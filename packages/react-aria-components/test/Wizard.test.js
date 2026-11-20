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
import React, {useContext, useState} from 'react';
import {TabListStateContext} from '../src/Tabs';
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

// The selected step is controlled by the parent, which moves it with Back and Next buttons.
function ControlledWizard({onSelectionChange, ...props}) {
  let [selectedKey, setSelectedKey] = useState('domain');
  let index = keys.indexOf(selectedKey);
  return (
    <>
      <WizardExample
        {...props}
        selectedKey={selectedKey}
        onSelectionChange={key => {
          onSelectionChange?.(key);
          setSelectedKey(key);
        }}
      />
      <button onClick={() => setSelectedKey(keys[index - 1])}>Back</button>
      <button onClick={() => setSelectedKey(keys[index + 1])}>Next</button>
    </>
  );
}

function getSelectedStep(tree) {
  let tabs = tree.getAllByRole('tab');
  return keys[tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true')];
}

function getNavigableSteps(tree) {
  return tree
    .getAllByRole('tab')
    .flatMap((tab, i) => (tab.getAttribute('aria-disabled') === 'true' ? [] : [keys[i]]));
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
    let tree = render(<WizardExample defaultLastCompletedStep="dns" />);
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
      <WizardExample defaultLastCompletedStep="dns" onSelectionChange={onSelectionChange} />
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

  it('should mark the steps before the selected step as completed and retain memory when going back', async () => {
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

    // Completion follows the selection moving forwards. But it does not change
    // going back to earlier steps.
    await user.click(tabs[0]);
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Domain',
      'CompletedDNS',
      'Not completedAdvanced',
      'Not completedReview'
    ]);
    expect(tabs[0]).toHaveAttribute('data-current');
    expect(tabs[0]).toHaveAttribute('data-completed');
    expect(tabs[1]).toHaveAttribute('data-completed');
    expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
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
    expect(tabs.map(tab => tab.className)).toEqual([
      'current',
      'completed',
      'upcoming',
      'upcoming'
    ]);
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


  // Like Select, which builds the collection of its ListBox once and provides its state to it, the
  // wizard should build its steps once rather than building them again in the Tabs it renders.
  describe('collection', () => {
    function renderWithProbe(Example) {
      let log = {mounts: 0, collections: []};
      let onMount = () => {
        log.mounts++;
      };
      let onRender = collection => {
        log.collections.push(collection);
      };
      let getElement = () => (
        <Example>
          <CollectionProbe onMount={onMount} onRender={onRender} />
          <StepButtons />
        </Example>
      );
      let tree = render(getElement());
      return {tree, log, rerender: () => tree.rerender(getElement())};
    }

    it('should not mount its children more times than Tabs', () => {
      let tabs = renderWithProbe(TabsExample);
      tabs.tree.unmount();
      let wizard = renderWithProbe(WizardExample);
      expect(wizard.log.mounts).toBe(tabs.log.mounts);
    });

    it('should keep the same step collection when the selected step changes', async () => {
      let {tree, log} = renderWithProbe(WizardExample);
      let collection = log.collections.at(-1);

      await user.click(tree.getByRole('button', {name: 'Continue'}));
      expect(getSelectedStep(tree)).toBe('dns');
      expect(log.collections.at(-1)).toBe(collection);
    });

    it.each(['mounting', 're-rendering'])(
      'should build the step collection as many times as Tabs when %s',
      phase => {
        let [tabsCount, wizardCount] = [TabsExample, WizardExample].map(Example => {
          let {tree, log, rerender} = renderWithProbe(Example);
          if (phase === 're-rendering') {
            log.collections = [log.collections.at(-1)];
            rerender();
          }
          tree.unmount();
          return new Set(log.collections).size;
        });

        expect(wizardCount).toBe(tabsCount);
      }
    );
  });
  describe('lastCompletedStep', () => {
    it.each([
      ['no steps are completed', {}],
      ['lastCompletedStep is not one of the steps', {lastCompletedStep: 'missing'}]
    ])('should only allow navigating to the first step when %s', async (_, props) => {
      let onSelectionChange = jest.fn();
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
          {...props}
          onSelectionChange={onSelectionChange}
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain']);

      await user.click(tree.getAllByRole('tab')[1]);
      expect(getSelectedStep(tree)).toBe('domain');
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it('should allow navigating to completed steps and the step after the last completed step', async () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
          defaultLastCompletedStep="dns"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getSelectedStep(tree)).toBe('domain');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      let tabs = tree.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('data-current');
      expect(tabs[0]).toHaveAttribute('data-completed');
      expect(tabs[1]).toHaveAccessibleName('Completed DNS');
      expect(tabs[1]).toHaveAttribute('data-completed');
      expect(tabs[2]).not.toHaveAttribute('data-completed');
      expect(tabs[3]).not.toHaveAttribute('data-completed');

      // Selecting the step after the last completed step doesn't complete any more steps.
      await user.click(tree.getAllByRole('tab')[2]);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it('should not complete any steps when the default selected step follows the last completed step', () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
          defaultSelectedKey="dns"
          defaultLastCompletedStep="domain"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it('should complete the steps before the default selected step', () => {
      let onLastCompletedStepChange = jest.fn();
      // Records every step that is rendered as disabled.
      let disabledSteps = new Set();
      let tree = render(
        <Wizard defaultSelectedKey="advanced" onLastCompletedStepChange={onLastCompletedStepChange}>
          <WizardStepList aria-label="Setup">
            {steps.map(step => (
              <WizardStep key={step.id} id={step.id}>
                {({isDisabled}) => {
                  if (isDisabled) {
                    disabledSteps.add(step.id);
                  }
                  return step.label;
                }}
              </WizardStep>
            ))}
          </WizardStepList>
        </Wizard>
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      // The last completed step is derived during render rather than synced in an effect, so the
      // completed steps are never rendered as disabled.
      expect(disabledSteps).toEqual(new Set(['review']));
      // Like other default values, the derived last completed step doesn't call the change handler.
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it('should complete steps as the selection advances and keep them navigable after going back', async () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample onLastCompletedStepChange={onLastCompletedStepChange}>
          <StepButtons />
        </WizardExample>
      );
      let previous = tree.getByRole('button', {name: 'Previous'});
      let next = tree.getByRole('button', {name: 'Continue'});

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(onLastCompletedStepChange).toHaveBeenCalledTimes(1);
      expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('domain');

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
      expect(onLastCompletedStepChange).toHaveBeenCalledTimes(2);
      expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('dns');

      // Going back never rolls back an uncontrolled last completed step.
      await user.click(previous);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      await user.click(tree.getAllByRole('tab')[0]);
      expect(getSelectedStep(tree)).toBe('domain');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      // The furthest step reached can be selected again directly.
      await user.click(tree.getAllByRole('tab')[2]);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(onLastCompletedStepChange).toHaveBeenCalledTimes(2);
    });

    it('should derive the last completed step when the parent changes the selection', async () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(<ControlledWizard onLastCompletedStepChange={onLastCompletedStepChange} />);
      let back = tree.getByRole('button', {name: 'Back'});
      let next = tree.getByRole('button', {name: 'Next'});

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      // Going back never rolls back an uncontrolled last completed step, even when the selection is
      // controlled.
      await user.click(back);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      // The parent changed the selection itself rather than through the wizard, so it isn't notified
      // about the steps that the selection completed.
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it('should support a controlled lastCompletedStep', () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
          lastCompletedStep="advanced"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(keys);
      let tabs = tree.getAllByRole('tab');
      expect(tabs.map(tab => tab.hasAttribute('data-completed'))).toEqual([
        true,
        true,
        true,
        false
      ]);

      // Unlike an uncontrolled last completed step, a controlled one can be rolled back.
      tree.rerender(
        <WizardExample
          lastCompletedStep="domain"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(tabs.map(tab => tab.hasAttribute('data-completed'))).toEqual([
        true,
        false,
        false,
        false
      ]);
      expect(tabs[1]).toHaveAccessibleName('Not completed DNS');

      tree.rerender(
        <WizardExample
          lastCompletedStep={null}
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain']);
      for (let tab of tabs) {
        expect(tab).not.toHaveAttribute('data-completed');
      }
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

    it.each(['lastCompletedStep', 'defaultLastCompletedStep'])(
      'should mark a step with key zero as completed with %s',
      prop => {
        let tree = render(
          <Wizard {...{[prop]: 0}}>
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
      }
    );

    it('should request completing steps without updating a controlled lastCompletedStep', async () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
          lastCompletedStep="domain"
          onLastCompletedStepChange={onLastCompletedStepChange}>
          <StepButtons />
        </WizardExample>
      );
      let next = tree.getByRole('button', {name: 'Continue'});

      // Selecting the step after the last completed step doesn't complete any more steps.
      await user.click(next);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(onLastCompletedStepChange).toHaveBeenCalledTimes(1);
      expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('dns');

      // The last completed step is still "domain", so the step after "dns" isn't navigable once
      // the selection moves away from it.
      await user.click(tree.getByRole('button', {name: 'Previous'}));
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
    });

    it('should call onLastCompletedStepChange in the same event as onSelectionChange', async () => {
      // Records each pair of values that the parent renders with. Strict mode renders twice, so
      // only changes are recorded.
      let renders = [];
      function FullyControlledWizard() {
        let [selectedKey, setSelectedKey] = useState('domain');
        let [lastCompletedStep, setLastCompletedStep] = useState(null);
        if (renders.at(-1)?.join() !== [selectedKey, lastCompletedStep].join()) {
          renders.push([selectedKey, lastCompletedStep]);
        }

        return (
          <WizardExample
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey}
            lastCompletedStep={lastCompletedStep}
            onLastCompletedStepChange={setLastCompletedStep}>
            <StepButtons />
          </WizardExample>
        );
      }

      let tree = render(<FullyControlledWizard />);
      let previous = tree.getByRole('button', {name: 'Previous'});
      let next = tree.getByRole('button', {name: 'Continue'});

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);

      await user.click(next);
      expect(getSelectedStep(tree)).toBe('advanced');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      await user.click(previous);
      expect(getSelectedStep(tree)).toBe('dns');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);

      // Both values are updated together, so the parent never renders a selected step that is
      // ahead of the step after the last completed step.
      expect(renders).toEqual([
        ['domain', null],
        ['dns', 'domain'],
        ['advanced', 'dns'],
        ['dns', 'dns']
      ]);
    });

    it('should keep the selected step navigable when it is beyond the step after the last completed step', () => {
      let tree = render(<WizardExample selectedKey="review" lastCompletedStep="domain" />);
      expect(getSelectedStep(tree)).toBe('review');
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'review']);
    });

    it('should allow navigating to any step with allowsRandomAccess', async () => {
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample allowsRandomAccess onLastCompletedStepChange={onLastCompletedStepChange} />
      );
      expect(getNavigableSteps(tree)).toEqual(keys);

      await user.click(tree.getAllByRole('tab')[3]);
      expect(getSelectedStep(tree)).toBe('review');
      expect(onLastCompletedStepChange).toHaveBeenCalledTimes(1);
      expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('advanced');
    });

    it.each([
      ['disabledKeys', {disabledKeys: ['dns']}],
      ['isDisabled', {stepProps: step => ({isDisabled: step.id === 'dns'})}]
    ])('should never allow navigating to steps disabled with %s', async (_, disabledProps) => {
      let tree = render(<WizardExample defaultLastCompletedStep="advanced" {...disabledProps} />);
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);
      tree.unmount();

      tree = render(<WizardExample allowsRandomAccess {...disabledProps} />);
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);

      await user.click(tree.getAllByRole('tab')[1]);
      expect(getSelectedStep(tree)).toBe('domain');
    });
  });
});
