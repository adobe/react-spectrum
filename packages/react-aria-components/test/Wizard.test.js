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

import {act, pointerMap, render, renderHook, within} from '@react-spectrum/test-utils-internal';
import React, {useContext, useState} from 'react';
import {TabListStateContext} from '../src/Tabs';
import userEvent from '@testing-library/user-event';
import {
  useWizardState,
  useWizardStep,
  Wizard,
  WizardPanel,
  WizardPanels,
  WizardStep,
  WizardStepList
} from '../src/Wizard';

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
          <WizardStep key={step.id} id={step.id} {...stepProps}>
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

  it('should mark the steps before the selected step as completed', async () => {
    let tree = render(<WizardExample defaultSelectedKey="advanced" />);
    let tabs = tree.getAllByRole('tab');

    expect(tabs.map(tab => tab.textContent)).toEqual([
      'CompletedDomain',
      'CompletedDNS',
      'Advanced',
      'Not completedReview'
    ]);
    let states = tabs.map(tab => tab.firstElementChild);
    expect(states[0]).toHaveAttribute('data-completed');
    expect(states[1]).toHaveAttribute('data-completed');
    expect(states[2]).toHaveAttribute('data-current');
    expect(states[2]).not.toHaveAttribute('data-completed');
    expect(states[3]).not.toHaveAttribute('data-completed');
    expect(states[3]).not.toHaveAttribute('data-current');

    // Completion follows the selection, so steps after the selected step are not completed after
    // navigating back, even though they are still navigable.
    await user.click(tabs[0]);
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'Domain',
      'Not completedDNS',
      'Not completedAdvanced',
      'Not completedReview'
    ]);
    expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
  });

  it('should provide the step state to useWizardStep', async () => {
    function StepState({id}) {
      let {isCurrent, isCompleted} = useWizardStep(id);
      return <span>{isCurrent ? 'current' : isCompleted ? 'completed' : 'upcoming'}</span>;
    }

    let tree = render(
      <Wizard defaultSelectedKey="dns">
        <WizardStepList aria-label="Setup">
          {steps.map(step => (
            <WizardStep key={step.id} id={step.id}>
              <StepState id={step.id} />
            </WizardStep>
          ))}
        </WizardStepList>
      </Wizard>
    );

    let getStates = () =>
      tree.getAllByRole('tab').map(tab => tab.firstElementChild.lastChild.textContent);
    expect(getStates()).toEqual(['completed', 'current', 'upcoming', 'upcoming']);

    await user.click(tree.getAllByRole('tab')[0]);
    expect(getStates()).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
  });

  it('should return a default step state from useWizardStep outside of a Wizard', () => {
    let {result} = renderHook(() => useWizardStep('domain'));
    expect(result.current).toEqual({isCurrent: false, isCompleted: false});
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

  describe('lastCompletedStep', () => {
    it('should only allow navigating to the first step when no steps are completed', async () => {
      let onSelectionChange = jest.fn();
      let onLastCompletedStepChange = jest.fn();
      let tree = render(
        <WizardExample
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
      let tree = render(
        <WizardExample
          defaultSelectedKey="advanced"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns', 'advanced']);
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

      // Unlike an uncontrolled last completed step, a controlled one can be rolled back.
      tree.rerender(
        <WizardExample
          lastCompletedStep="domain"
          onLastCompletedStepChange={onLastCompletedStepChange}
        />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'dns']);
      expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    });

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

    it('should never allow navigating to steps in disabledKeys', async () => {
      let tree = render(
        <WizardExample defaultLastCompletedStep="advanced" disabledKeys={['dns']} />
      );
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);
      tree.unmount();

      tree = render(<WizardExample allowsRandomAccess disabledKeys={['dns']} />);
      expect(getNavigableSteps(tree)).toEqual(['domain', 'advanced', 'review']);

      await user.click(tree.getAllByRole('tab')[1]);
      expect(getSelectedStep(tree)).toBe('domain');
    });
  });
});

describe('useWizardState', () => {
  it('should select the first step and complete no steps by default', () => {
    let {result} = renderHook(() => useWizardState({keys}));
    expect(result.current.selectedKey).toBe('domain');
    expect(result.current.lastCompletedStep).toBeNull();
    expect(result.current.disabledKeys).toEqual(new Set(['dns', 'advanced', 'review']));
  });

  it('should support defaultLastCompletedStep', () => {
    let {result} = renderHook(() => useWizardState({keys, defaultLastCompletedStep: 'dns'}));
    expect(result.current.selectedKey).toBe('domain');
    expect(result.current.lastCompletedStep).toBe('dns');
    expect(result.current.disabledKeys).toEqual(new Set(['review']));
  });

  it('should complete the steps before the default selected step', () => {
    let onLastCompletedStepChange = jest.fn();
    let renders = [];
    let {result} = renderHook(() => {
      let state = useWizardState({keys, defaultSelectedKey: 'advanced', onLastCompletedStepChange});
      renders.push(state);
      return state;
    });
    expect(result.current.selectedKey).toBe('advanced');
    expect(result.current.lastCompletedStep).toBe('dns');
    expect(result.current.disabledKeys).toEqual(new Set(['review']));

    // The last completed step is derived during render rather than synced in an effect, so it's
    // already correct on the first render. Like other default values, it doesn't call the change
    // handler.
    expect(renders[0].lastCompletedStep).toBe('dns');
    expect(renders[0].disabledKeys).toEqual(new Set(['review']));
    expect(onLastCompletedStepChange).not.toHaveBeenCalled();
  });

  it('should advance the last completed step with the selection and never roll it back', () => {
    let onLastCompletedStepChange = jest.fn();
    let {result} = renderHook(() => useWizardState({keys, onLastCompletedStepChange}));

    act(() => result.current.setSelectedKey('dns'));
    expect(result.current.lastCompletedStep).toBe('domain');
    expect(result.current.disabledKeys).toEqual(new Set(['advanced', 'review']));
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(1);
    expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('domain');

    // Skipping ahead completes every step before the selected step.
    act(() => result.current.setSelectedKey('review'));
    expect(result.current.lastCompletedStep).toBe('advanced');
    expect(result.current.disabledKeys).toEqual(new Set());
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(2);
    expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('advanced');

    act(() => result.current.setSelectedKey('domain'));
    expect(result.current.selectedKey).toBe('domain');
    expect(result.current.lastCompletedStep).toBe('advanced');
    expect(result.current.disabledKeys).toEqual(new Set());
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(2);
  });

  it('should support a controlled lastCompletedStep', () => {
    let onLastCompletedStepChange = jest.fn();
    let {result, rerender} = renderHook(
      ({lastCompletedStep}) => useWizardState({keys, lastCompletedStep, onLastCompletedStepChange}),
      {initialProps: {lastCompletedStep: 'advanced'}}
    );
    expect(result.current.lastCompletedStep).toBe('advanced');
    expect(result.current.disabledKeys).toEqual(new Set());

    rerender({lastCompletedStep: 'domain'});
    expect(result.current.lastCompletedStep).toBe('domain');
    expect(result.current.disabledKeys).toEqual(new Set(['advanced', 'review']));

    act(() => result.current.setSelectedKey('advanced'));
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(1);
    expect(onLastCompletedStepChange).toHaveBeenLastCalledWith('dns');
    expect(result.current.lastCompletedStep).toBe('domain');
    expect(result.current.disabledKeys).toEqual(new Set(['review']));
  });

  it('should always disable steps in disabledKeys', () => {
    let {result} = renderHook(() =>
      useWizardState({keys, allowsRandomAccess: true, disabledKeys: ['dns']})
    );
    expect(result.current.disabledKeys).toEqual(new Set(['dns']));
  });
});
