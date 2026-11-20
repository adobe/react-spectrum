/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, ButtonContext} from '../src/Button';
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import React, {useContext, useState} from 'react';
import {TabListStateContext} from '../src/Tabs';
import {TextField} from '../src/TextField';
import userEvent from '@testing-library/user-event';
import {Wizard, WizardPanel, WizardPanels, WizardStep, WizardStepList} from '../src/Wizard';

let steps = [
  {id: 'domain', label: 'Domain'},
  {id: 'dns', label: 'DNS'},
  {id: 'advanced', label: 'Advanced'},
  {id: 'review', label: 'Review'}
];
let keys = steps.map(step => step.id);

function WizardExample({stepProps, children, ...props}) {
  return (
    <Wizard {...props}>
      <WizardStepList aria-label="Setup">
        {steps.map(step => (
          <WizardStep key={step.id} id={step.id} {...stepProps?.(step)}>
            {step.label}
          </WizardStep>
        ))}
      </WizardStepList>
      <WizardPanels>
        {steps.map(step => (
          <WizardPanel key={step.id} id={step.id}>
            {step.label} panel
          </WizardPanel>
        ))}
      </WizardPanels>
      {children}
    </Wizard>
  );
}

// Moves the selection from within the wizard, like the Previous and Continue buttons of a wizard.
function StepButtons() {
  let state = useContext(TabListStateContext);
  if (!state) {
    return null;
  }

  let index = keys.indexOf(state.selectedKey);
  return (
    <>
      <button disabled={index <= 0} onClick={() => state.setSelectedKey(keys[index - 1])}>
        Previous
      </button>
      <button
        disabled={index >= keys.length - 1}
        onClick={() => state.setSelectedKey(keys[index + 1])}>
        Continue
      </button>
    </>
  );
}

// A wizard with a dynamic collection of steps, like the one in the docs.
function DynamicWizard({items, ...props}) {
  return (
    <Wizard {...props}>
      <WizardStepList aria-label="Setup" items={items}>
        {step => <WizardStep>{step.label}</WizardStep>}
      </WizardStepList>
      <WizardPanels items={items}>
        {step => <WizardPanel>{step.label} panel</WizardPanel>}
      </WizardPanels>
    </Wizard>
  );
}

function getSelectedStep(tree, stepKeys = keys) {
  let tabs = tree.getAllByRole('tab');
  return stepKeys[tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true')];
}

function getNavigableSteps(tree, stepKeys = keys) {
  return tree
    .getAllByRole('tab')
    .flatMap((tab, i) => (tab.getAttribute('aria-disabled') === 'true' ? [] : [stepKeys[i]]));
}

function getCompletedSteps(tree) {
  return tree.getAllByRole('tab').map(tab => tab.hasAttribute('data-completed'));
}

// Like the WizardButtons of the starters, which move between steps with the previous and next slots.
function WizardButtons() {
  return (
    <div>
      <Button slot="previous">Back</Button>
      <Button slot="next">Next</Button>
    </div>
  );
}

// Reports the collection that the TabList renders.
function CollectionProbe({onRender}) {
  let state = useContext(TabListStateContext);
  if (state) {
    onRender(state.collection);
  }
  return null;
}

let projectKeys = ['details', 'members', 'review'];

function isValidName(name) {
  return name.trim() !== '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ProjectField({label, isValid, errorMessage, ...props}) {
  return (
    <TextField {...props} isRequired validate={value => (isValid(value) ? null : errorMessage)}>
      <Label>{label}</Label>
      <Input />
      <FieldError />
    </TextField>
  );
}

// The steps of the examples in the docs, which create a project with a field on each step. Panels
// are unmounted when their step isn't current, so the values are kept in state.
function ProjectSteps({name, onNameChange, email, onEmailChange}) {
  return (
    <>
      <WizardStepList aria-label="Create project">
        <WizardStep id="details">Details</WizardStep>
        <WizardStep id="members">Members</WizardStep>
        <WizardStep id="review">Review</WizardStep>
      </WizardStepList>
      <WizardPanels>
        <WizardPanel id="details">
          <ProjectField
            label="Name"
            value={name}
            onChange={onNameChange}
            isValid={isValidName}
            errorMessage="Enter a name for the project."
          />
        </WizardPanel>
        <WizardPanel id="members">
          <ProjectField
            label="Email"
            value={email}
            onChange={onEmailChange}
            isValid={isValidEmail}
            errorMessage="Enter a valid email address."
          />
        </WizardPanel>
        <WizardPanel id="review">Review panel</WizardPanel>
      </WizardPanels>
    </>
  );
}

// Like the Uncontrolled example in the docs, which wraps the wizard in a form and moves to the next
// step when the form is submitted. The browser only submits the form when the fields in the current
// step are valid.
function FormWizard({onCreate}) {
  let [step, setStep] = useState('details');
  let [name, setName] = useState('');
  let [email, setEmail] = useState('');

  return (
    <Form
      onSubmit={e => {
        e.preventDefault();
        if (step === 'review') {
          onCreate(name, email);
        } else {
          setStep(projectKeys[projectKeys.indexOf(step) + 1]);
        }
      }}>
      <Wizard selectedKey={step} onSelectionChange={setStep}>
        <ProjectSteps name={name} onNameChange={setName} email={email} onEmailChange={setEmail} />
        <Button slot="previous">Back</Button>
        <Button type="submit">{step === 'review' ? 'Create project' : 'Next'}</Button>
      </Wizard>
    </Form>
  );
}

// Like the Controlled and Random access examples in the docs, which complete each step once its
// field is valid. Without random access, a step is only completed once the steps before it are, so
// that users can't skip ahead of a step that isn't completed.
function CompletedKeysWizard({allowsRandomAccess, onCreate}) {
  let [step, setStep] = useState('details');
  let [name, setName] = useState('');
  let [email, setEmail] = useState('');
  let completedKeys = [];
  if (isValidName(name)) {
    completedKeys.push('details');
  }
  if (isValidEmail(email) && (allowsRandomAccess || isValidName(name))) {
    completedKeys.push('members');
  }

  return (
    <Wizard
      allowsRandomAccess={allowsRandomAccess}
      completedKeys={completedKeys}
      selectedKey={step}
      onSelectionChange={setStep}>
      <ProjectSteps name={name} onNameChange={setName} email={email} onEmailChange={setEmail} />
      <Button slot="previous">Back</Button>
      {step === 'review' ? (
        <Button isDisabled={completedKeys.length < 2} onPress={() => onCreate(name, email)}>
          Create project
        </Button>
      ) : (
        <Button slot="next">Next</Button>
      )}
    </Wizard>
  );
}

describe('Wizard', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('should render a step list and the panel of the selected step', () => {
    let tree = render(<WizardExample />);
    let stepList = tree.getByRole('tablist');
    expect(stepList).toHaveAttribute('aria-label', 'Setup');

    let tabs = within(stepList).getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(getSelectedStep(tree)).toBe('domain');

    let panel = tree.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Domain panel');
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
  });

  it('should render with default classes', () => {
    let tree = render(<WizardExample />);
    let stepList = tree.getByRole('tablist');
    expect(stepList.parentElement).toHaveClass('react-aria-Wizard');
    expect(stepList).toHaveClass('react-aria-WizardStepList');
    for (let step of within(stepList).getAllByRole('tab')) {
      expect(step).toHaveClass('react-aria-WizardStep');
    }

    let panel = tree.getByRole('tabpanel');
    expect(panel.parentElement).toHaveClass('react-aria-WizardPanels');
    expect(panel).toHaveClass('react-aria-WizardPanel');
  });

  it('should pass the default class name to className functions', () => {
    let tree = render(
      <WizardExample
        className={({defaultClassName}) => `${defaultClassName} wizard`}
        stepProps={() => ({className: ({defaultClassName}) => `${defaultClassName} step`})}
      />
    );
    let stepList = tree.getByRole('tablist');
    expect(stepList.parentElement).toHaveClass('react-aria-Wizard', 'wizard');
    for (let step of within(stepList).getAllByRole('tab')) {
      expect(step).toHaveClass('react-aria-WizardStep', 'step');
    }
  });

  it('should support uncontrolled selection', async () => {
    let onSelectionChange = jest.fn();
    let tree = render(
      <WizardExample defaultSelectedKey="dns" onSelectionChange={onSelectionChange} />
    );
    expect(getSelectedStep(tree)).toBe('dns');
    expect(tree.getByRole('tabpanel')).toHaveTextContent('DNS panel');

    await user.click(tree.getAllByRole('tab')[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('domain');
    expect(getSelectedStep(tree)).toBe('domain');
    expect(tree.getByRole('tabpanel')).toHaveTextContent('Domain panel');
  });

  it('should support controlled selection', async () => {
    let onSelectionChange = jest.fn();
    let tree = render(<WizardExample selectedKey="dns" onSelectionChange={onSelectionChange} />);

    await user.click(tree.getAllByRole('tab')[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('domain');
    expect(getSelectedStep(tree)).toBe('dns');
  });

  it('should identify only the selected step as the current step for assistive technology', async () => {
    let tree = render(<WizardExample completedKeys={['domain', 'dns']} />);
    let tabs = tree.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-current', 'step');
    for (let tab of tabs.slice(1)) {
      expect(tab).not.toHaveAttribute('aria-current');
    }

    await user.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-current', 'step');
    for (let tab of [tabs[0], tabs[1], tabs[3]]) {
      expect(tab).not.toHaveAttribute('aria-current');
    }
  });

  it('should only select a step on Enter when navigating with the keyboard', async () => {
    let onSelectionChange = jest.fn();
    let tree = render(
      <WizardExample completedKeys={['domain', 'dns']} onSelectionChange={onSelectionChange} />
    );
    let tabs = tree.getAllByRole('tab');

    await user.tab();
    expect(document.activeElement).toBe(tabs[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[1]);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[2]);
    expect(getSelectedStep(tree)).toBe('domain');
    expect(onSelectionChange).not.toHaveBeenCalled();

    // The last step isn't navigable yet, so it is skipped.
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[0]);
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tabs[2]);

    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('advanced');
    expect(getSelectedStep(tree)).toBe('advanced');
  });

  it('should mark the steps before the selected step as completed by default', async () => {
    let tree = render(<WizardExample defaultSelectedKey="advanced" />);
    let tabs = tree.getAllByRole('tab');

    expect(tabs.map(tab => tab.textContent)).toEqual([
      'CompletedDomain',
      'CompletedDNS',
      'Advanced',
      'Not completedReview'
    ]);
    expect(tabs[0]).toHaveAttribute('data-completed');
    expect(tabs[1]).toHaveAttribute('data-completed');
    expect(tabs[2]).toHaveAttribute('data-current');
    expect(tabs[2]).not.toHaveAttribute('data-completed');
    expect(tabs[3]).not.toHaveAttribute('data-completed');
    expect(tabs[3]).not.toHaveAttribute('data-current');

    // Completion follows the selection, so going back to an earlier step means the steps after it
    // are no longer completed.
    await user.click(tabs[0]);
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Domain',
      'Not completedDNS',
      'Not completedAdvanced',
      'Not completedReview'
    ]);
    expect(tabs[0]).toHaveAttribute('data-current');
    expect(tabs[0]).not.toHaveAttribute('data-completed');
    expect(getNavigableSteps(tree)).toEqual(['domain']);
  });

  it('should provide the step state as render props', async () => {
    let tree = render(
      <Wizard defaultSelectedKey="advanced">
        <WizardStepList aria-label="Setup">
          {steps.map(step => (
            <WizardStep
              key={step.id}
              id={step.id}
              className={({isCurrent, isCompleted}) =>
                isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'
              }
              style={({isCurrent}) => ({fontWeight: isCurrent ? 'bold' : 'normal'})}
              render={(domProps, {stepNumber}) => <div {...domProps} data-step={stepNumber} />}>
              {({stepNumber}) => `${stepNumber}. ${step.label}`}
            </WizardStep>
          ))}
        </WizardStepList>
      </Wizard>
    );

    let tabs = tree.getAllByRole('tab');
    expect(tabs.map(tab => tab.className)).toEqual([
      'completed',
      'completed',
      'current',
      'upcoming'
    ]);
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Completed1. Domain',
      'Completed2. DNS',
      '3. Advanced',
      'Not completed4. Review'
    ]);
    expect(tabs.map(tab => tab.style.fontWeight)).toEqual(['normal', 'normal', 'bold', 'normal']);
    expect(tabs.map(tab => tab.dataset.step)).toEqual(['1', '2', '3', '4']);

    await user.click(tabs[0]);
    expect(tabs.map(tab => tab.className)).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
  });

  it('should support render props on steps', () => {
    let tree = render(
      <Wizard defaultSelectedKey="dns">
        <WizardStepList aria-label="Setup">
          {steps.map(step => (
            <WizardStep key={step.id} id={step.id}>
              {({isSelected, isDisabled}) =>
                `${step.label} ${isSelected ? 'selected' : isDisabled ? 'locked' : 'open'}`
              }
            </WizardStep>
          ))}
        </WizardStepList>
      </Wizard>
    );

    expect(tree.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'CompletedDomain open',
      'DNS selected',
      'Not completedAdvanced locked',
      'Not completedReview locked'
    ]);
  });

  it('should support refs', () => {
    let wizardRef = React.createRef();
    let stepListRef = React.createRef();
    let stepRef = React.createRef();
    let panelsRef = React.createRef();
    let panelRef = React.createRef();
    let tree = render(
      <Wizard ref={wizardRef}>
        <WizardStepList ref={stepListRef} aria-label="Setup">
          <WizardStep id="domain" ref={stepRef}>
            Domain
          </WizardStep>
        </WizardStepList>
        <WizardPanels ref={panelsRef}>
          <WizardPanel id="domain" ref={panelRef}>
            Domain panel
          </WizardPanel>
        </WizardPanels>
      </Wizard>
    );

    expect(stepListRef.current).toBe(tree.getByRole('tablist'));
    expect(wizardRef.current).toBe(tree.getByRole('tablist').parentElement);
    expect(stepRef.current).toBe(tree.getByRole('tab'));
    expect(panelRef.current).toBe(tree.getByRole('tabpanel'));
    expect(panelsRef.current).toBe(tree.getByRole('tabpanel').parentElement);
  });

  it('should use the default class names when className functions return undefined', () => {
    let tree = render(
      <Wizard className={() => undefined}>
        <WizardStepList aria-label="Setup" className={() => undefined}>
          <WizardStep id="domain" className={() => undefined}>
            Domain
          </WizardStep>
        </WizardStepList>
        <WizardPanels>
          <WizardPanel id="domain" className={() => undefined}>
            Domain panel
          </WizardPanel>
        </WizardPanels>
      </Wizard>
    );

    let stepList = tree.getByRole('tablist');
    let elements = [
      stepList.parentElement,
      stepList,
      tree.getByRole('tab'),
      tree.getByRole('tabpanel')
    ];
    expect(elements.map(element => element.className)).toEqual([
      'react-aria-Wizard',
      'react-aria-WizardStepList',
      'react-aria-WizardStep',
      'react-aria-WizardPanel'
    ]);
  });

  it.each([
    ['disabledKeys', {disabledKeys: ['domain']}],
    ['isDisabled', {stepProps: step => ({isDisabled: step.id === 'domain'})}]
  ])(
    'should select the first enabled step by default when the first step is disabled with %s',
    (_, disabledProps) => {
      let tree = render(<WizardExample {...disabledProps} />);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(tree.getByRole('tabpanel')).toHaveTextContent('DNS panel');
      expect(getNavigableSteps(tree)).toEqual(['dns']);
    }
  );

  it('should provide the step state to steps without an id', () => {
    let tree = render(
      <Wizard>
        <WizardStepList aria-label="Setup">
          <WizardStep>{({stepNumber}) => `Step ${stepNumber}`}</WizardStep>
          <WizardStep>{({stepNumber}) => `Step ${stepNumber}`}</WizardStep>
        </WizardStepList>
      </Wizard>
    );

    // The step is selected, but the wizard can't find it to provide its state.
    let tabs = tree.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs.map(tab => tab.textContent)).toEqual(['Step 1', 'Not completedStep 2']);
    expect(tabs[0]).toHaveAttribute('aria-current', 'step');
  });

  it.each([
    ['aria-label', step => ({'aria-label': step.label})],
    ['aria-labelledby', step => ({'aria-labelledby': `${step.id}-label`})]
  ])('should announce whether a step labelled with %s is completed', (_, stepProps) => {
    let tree = render(
      <>
        {steps.map(step => (
          <span key={step.id} id={`${step.id}-label`}>
            {step.label}
          </span>
        ))}
        <WizardExample defaultSelectedKey="dns" stepProps={stepProps} />
      </>
    );

    let tabs = tree.getAllByRole('tab');
    expect(tabs[0]).toHaveAccessibleName('Completed Domain');
    expect(tabs[1]).toHaveAccessibleName('DNS');
    expect(tabs[2]).toHaveAccessibleName('Not completed Advanced');
  });

  it('should select another step when the selected step is removed', () => {
    let tree = render(<DynamicWizard items={steps} defaultSelectedKey="advanced" />);
    expect(getSelectedStep(tree)).toBe('advanced');

    tree.rerender(
      <DynamicWizard
        items={steps.filter(step => step.id !== 'advanced')}
        defaultSelectedKey="advanced"
      />
    );
    let selectedTabs = tree
      .getAllByRole('tab')
      .filter(tab => tab.getAttribute('aria-selected') === 'true');
    expect(selectedTabs).toHaveLength(1);
    expect(tree.queryAllByRole('tabpanel')).toHaveLength(1);
  });

  it('should not move to a disabled step with the starter WizardButtons', async () => {
    let tree = render(
      <WizardExample disabledKeys={['dns']}>
        <WizardButtons />
      </WizardExample>
    );

    await user.click(tree.getByRole('button', {name: 'Next'}));
    expect(getSelectedStep(tree)).toBe('advanced');
    expect(tree.getByRole('tabpanel')).toHaveTextContent('Advanced panel');

    await user.click(tree.getByRole('button', {name: 'Back'}));
    expect(getSelectedStep(tree)).toBe('domain');
  });

  it('should disable the previous and next buttons when there is no previous or next step', async () => {
    let tree = render(
      <WizardExample disabledKeys={['review']}>
        <WizardButtons />
      </WizardExample>
    );
    let back = tree.getByRole('button', {name: 'Back'});
    let next = tree.getByRole('button', {name: 'Next'});
    expect(back).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);
    await user.click(next);
    expect(getSelectedStep(tree)).toBe('advanced');
    expect(back).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it('should disable the previous and next buttons when the wizard is disabled', () => {
    let tree = render(
      <WizardExample isDisabled defaultSelectedKey="dns">
        <WizardButtons />
      </WizardExample>
    );
    expect(tree.getByRole('button', {name: 'Back'})).toBeDisabled();
    expect(tree.getByRole('button', {name: 'Next'})).toBeDisabled();
  });

  it('should keep the button slots of its parent, like the close slot of a Dialog', async () => {
    let onPress = jest.fn();
    let tree = render(
      <ButtonContext.Provider value={{slots: {close: {onPress}}}}>
        <WizardExample>
          <Button slot="close">Close</Button>
        </WizardExample>
      </ButtonContext.Provider>
    );

    await user.click(tree.getByRole('button', {name: 'Close'}));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Like Select, which builds the collection of its ListBox once and provides its state to it, the
  // wizard should build its steps once rather than building them again in the Tabs it renders.
  describe('collection', () => {
    it('should keep the same step collection when the selected step changes', async () => {
      let collections = [];
      let tree = render(
        <WizardExample>
          <CollectionProbe onRender={collection => collections.push(collection)} />
          <StepButtons />
        </WizardExample>
      );
      let collection = collections.at(-1);

      await user.click(tree.getByRole('button', {name: 'Continue'}));
      expect(getSelectedStep(tree)).toBe('dns');
      expect(collections.at(-1)).toBe(collection);
    });
  });

  describe('completedKeys', () => {
    it.each([
      ['no steps are completed', []],
      ['the completed steps are not in the wizard', ['missing']]
    ])('should only allow navigating to the first step when %s', async (_, completedKeys) => {
      let onSelectionChange = jest.fn();
      let tree = render(
        <WizardExample completedKeys={completedKeys} onSelectionChange={onSelectionChange}>
          <WizardButtons />
        </WizardExample>
      );
      expect(getNavigableSteps(tree)).toEqual(['domain']);
      expect(tree.getByRole('button', {name: 'Next'})).toBeDisabled();

      await user.click(tree.getAllByRole('tab')[1]);
      expect(getSelectedStep(tree)).toBe('domain');
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('should allow navigating to the steps up to and including the one after the last completed step', async () => {
      // The last completed step is the one furthest along, even when the steps before it aren't
      // completed.
      let tree = render(<WizardExample completedKeys={['dns']} />);
      let tabs = tree.getAllByRole('tab');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      expect(getCompletedSteps(tree)).toEqual([false, true, false, false]);
      expect(tabs[1]).toHaveAccessibleName('Completed DNS');
      expect(tabs[2]).toHaveAccessibleName('Not completed Advanced');

      // Selecting a step doesn't complete the steps before it.
      await user.click(tabs[2]);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      expect(tabs[0]).toHaveAccessibleName('Not completed Domain');
    });

    it('should only move to the next step once the application completes the current step', async () => {
      let tree = render(
        <WizardExample completedKeys={[]}>
          <WizardButtons />
        </WizardExample>
      );
      let back = tree.getByRole('button', {name: 'Back'});
      let next = tree.getByRole('button', {name: 'Next'});
      expect(next).toBeDisabled();

      // For example, once the fields in the step are valid.
      tree.rerender(
        <WizardExample completedKeys={['domain']}>
          <WizardButtons />
        </WizardExample>
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(next).toBeEnabled();

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(next).toBeDisabled();

      // Going back doesn't change which steps are completed.
      await user.click(back);
      expect(getSelectedStep(tree)).toBe('domain');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(next).toBeEnabled();

      // Only the application changes which steps are completed, for example when the fields in a
      // completed step become invalid.
      tree.rerender(
        <WizardExample completedKeys={[]}>
          <WizardButtons />
        </WizardExample>
      );
      expect(getNavigableSteps(tree)).toEqual(['domain']);
      expect(tree.getAllByRole('tab')[0]).not.toHaveAttribute('data-completed');
      expect(next).toBeDisabled();
    });

    it('should keep the selected step navigable when it is beyond the step after the last completed step', () => {
      let tree = render(
        <WizardExample selectedKey="advanced" completedKeys={['domain']}>
          <WizardButtons />
        </WizardExample>
      );
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      expect(tree.getByRole('button', {name: 'Back'})).toBeEnabled();
      expect(tree.getByRole('button', {name: 'Next'})).toBeDisabled();
    });

    it('should mark a step with key zero as completed', () => {
      let tree = render(
        <Wizard completedKeys={[0]}>
          <WizardStepList aria-label="Setup">
            <WizardStep id={0}>First</WizardStep>
            <WizardStep id={1}>Second</WizardStep>
          </WizardStepList>
        </Wizard>
      );
      let tabs = tree.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('data-current');
      expect(tabs[0]).toHaveAttribute('data-completed');
      expect(tabs[1]).not.toHaveAttribute('data-completed');
      expect(tabs[1]).not.toHaveAttribute('aria-disabled');
    });

    it('should allow navigating to any step without completing steps with allowsRandomAccess', async () => {
      let tree = render(<WizardExample allowsRandomAccess />);
      expect(getNavigableSteps(tree)).toEqual(keys);

      await user.click(tree.getAllByRole('tab')[3]);
      expect(getSelectedStep(tree)).toBe('review');
      for (let tab of tree.getAllByRole('tab')) {
        expect(tab).not.toHaveAttribute('data-completed');
      }
    });

    it('should mark the completed steps with allowsRandomAccess', async () => {
      let tree = render(
        <WizardExample allowsRandomAccess completedKeys={['advanced']}>
          <WizardButtons />
        </WizardExample>
      );
      expect(getNavigableSteps(tree)).toEqual(keys);
      expect(getCompletedSteps(tree)).toEqual([false, false, true, false]);

      // The current step doesn't need to be completed before moving to the next one.
      await user.click(tree.getByRole('button', {name: 'Next'}));
      expect(getSelectedStep(tree)).toBe('dns');
    });

    it.each([
      ['disabledKeys', {disabledKeys: ['dns']}],
      ['isDisabled', {stepProps: step => ({isDisabled: step.id === 'dns'})}]
    ])('should never allow navigating to steps disabled with %s', async (_, disabledProps) => {
      let tree = render(
        <WizardExample completedKeys={['domain', 'dns', 'advanced']} {...disabledProps} />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);
      tree.unmount();

      tree = render(<WizardExample allowsRandomAccess {...disabledProps} />);
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);

      await user.click(tree.getAllByRole('tab')[1]);
      expect(getSelectedStep(tree)).toBe('domain');
    });

    it.each([
      ['disabledKeys', {disabledKeys: ['dns']}],
      ['isDisabled', {stepProps: step => ({isDisabled: step.id === 'dns'})}]
    ])(
      'should allow navigating past a step disabled with %s after the last completed step',
      async (_, disabledProps) => {
        let tree = render(
          <WizardExample completedKeys={['domain']} {...disabledProps}>
            <WizardButtons />
          </WizardExample>
        );
        expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced']);

        await user.click(tree.getByRole('button', {name: 'Next'}));
        expect(getSelectedStep(tree)).toBe('advanced');
      }
    );
  });

  describe('form validation', () => {
    it('should only move to the next step when the form around the wizard is valid', async () => {
      let onCreate = jest.fn();
      let tree = render(<FormWizard onCreate={onCreate} />);

      // The browser doesn't submit the form while a field in the current step is invalid. Instead,
      // the first invalid field displays its error and receives focus.
      await user.click(tree.getByRole('button', {name: 'Next'}));
      let name = tree.getByRole('textbox', {name: 'Name'});
      expect(getSelectedStep(tree, projectKeys)).toBe('details');
      expect(name).toHaveAccessibleDescription('Enter a name for the project.');
      expect(document.activeElement).toBe(name);

      await user.keyboard('Website');
      await user.click(tree.getByRole('button', {name: 'Next'}));
      expect(getSelectedStep(tree, projectKeys)).toBe('members');
      expect(getNavigableSteps(tree, projectKeys)).toEqual(['details', 'members']);
      expect(getCompletedSteps(tree)).toEqual([true, false, false]);

      // Pressing Enter in a field submits the form too.
      let email = tree.getByRole('textbox', {name: 'Email'});
      await user.type(email, 'devon{Enter}');
      expect(getSelectedStep(tree, projectKeys)).toBe('members');
      expect(email).toHaveAccessibleDescription('Enter a valid email address.');

      await user.type(email, '@example.com{Enter}');
      expect(getSelectedStep(tree, projectKeys)).toBe('review');
      expect(getCompletedSteps(tree)).toEqual([true, true, false]);

      // On the last step, the next button creates the project.
      await user.click(tree.getByRole('button', {name: 'Create project'}));
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith('Website', 'devon@example.com');

      // Going back to a completed step marks the steps after it as not completed, and keeps the
      // values of its fields.
      await user.click(tree.getAllByRole('tab')[0]);
      expect(getSelectedStep(tree, projectKeys)).toBe('details');
      expect(getNavigableSteps(tree, projectKeys)).toEqual(['details']);
      expect(getCompletedSteps(tree)).toEqual([false, false, false]);
      expect(tree.getByRole('textbox', {name: 'Name'})).toHaveValue('Website');
      expect(tree.getByRole('button', {name: 'Next'})).toBeInTheDocument();
    });

    it('should complete the steps in order once their fields are valid', async () => {
      let onCreate = jest.fn();
      let tree = render(<CompletedKeysWizard onCreate={onCreate} />);
      let next = tree.getByRole('button', {name: 'Next'});
      expect(getNavigableSteps(tree, projectKeys)).toEqual(['details']);
      expect(next).toBeDisabled();

      await user.type(tree.getByRole('textbox', {name: 'Name'}), 'Website');
      expect(getCompletedSteps(tree)).toEqual([true, false, false]);
      expect(getNavigableSteps(tree, projectKeys)).toEqual(['details', 'members']);
      expect(next).toBeEnabled();

      await user.click(next);
      expect(getSelectedStep(tree, projectKeys)).toBe('members');
      expect(next).toBeDisabled();

      await user.type(tree.getByRole('textbox', {name: 'Email'}), 'devon@example.com');
      expect(getNavigableSteps(tree, projectKeys)).toEqual(projectKeys);
      await user.click(next);
      expect(getSelectedStep(tree, projectKeys)).toBe('review');

      // Completed steps stay completed when going back.
      await user.click(tree.getAllByRole('tab')[0]);
      expect(getCompletedSteps(tree)).toEqual([true, true, false]);
      expect(getNavigableSteps(tree, projectKeys)).toEqual(projectKeys);

      // Until a field becomes invalid, which also marks the steps after it as not completed, because
      // the steps are completed in order.
      await user.clear(tree.getByRole('textbox', {name: 'Name'}));
      expect(getCompletedSteps(tree)).toEqual([false, false, false]);
      expect(getNavigableSteps(tree, projectKeys)).toEqual(['details']);
      expect(tree.getByRole('button', {name: 'Next'})).toBeDisabled();

      await user.keyboard('Docs');
      expect(getCompletedSteps(tree)).toEqual([true, true, false]);
      expect(getNavigableSteps(tree, projectKeys)).toEqual(projectKeys);

      await user.click(tree.getAllByRole('tab')[2]);
      await user.click(tree.getByRole('button', {name: 'Create project'}));
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith('Docs', 'devon@example.com');
    });

    it('should complete the steps in any order with allowsRandomAccess', async () => {
      let onCreate = jest.fn();
      let tree = render(<CompletedKeysWizard allowsRandomAccess onCreate={onCreate} />);
      let tabs = tree.getAllByRole('tab');
      expect(getNavigableSteps(tree, projectKeys)).toEqual(projectKeys);

      // Users can reach the last step before completing the others, so the project can't be created
      // until every step is completed.
      await user.click(tabs[2]);
      expect(getSelectedStep(tree, projectKeys)).toBe('review');
      expect(tree.getByRole('button', {name: 'Create project'})).toBeDisabled();

      await user.click(tabs[1]);
      await user.type(tree.getByRole('textbox', {name: 'Email'}), 'devon@example.com');
      expect(getCompletedSteps(tree)).toEqual([false, true, false]);

      await user.click(tree.getByRole('button', {name: 'Back'}));
      await user.type(tree.getByRole('textbox', {name: 'Name'}), 'Website');
      expect(getCompletedSteps(tree)).toEqual([true, true, false]);

      await user.click(tabs[2]);
      let create = tree.getByRole('button', {name: 'Create project'});
      expect(create).toBeEnabled();
      await user.click(create);
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith('Website', 'devon@example.com');
    });
  });
});
