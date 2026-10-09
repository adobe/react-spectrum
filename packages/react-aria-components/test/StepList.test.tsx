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

import {act} from '@testing-library/react';
import {Link} from '../src/Link';
import {pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {RouterProvider} from 'react-aria/private/utils/openLink';
import {StepList, StepListItem} from '../src/StepList';
import userEvent from '@testing-library/user-event';

interface StepItem {
  id: string;
  value: string;
}

const items: Array<StepItem> = [
  {id: 'step-one', value: 'Step 1'},
  {id: 'step-two', value: 'Step 2'},
  {id: 'step-three', value: 'Step 3'},
  {id: 'step-four', value: 'Step 4'}
];

type StepListProps = Omit<typeof StepList, 'children'>;

function renderComponent(props: StepListProps = {} as StepListProps) {
  return render(
    <StepList id="steplist-id" aria-label="steplist-test" {...props} items={items}>
      {(item: StepItem) => (
        <StepListItem id={item.id}>
          <Link>{item.value}</Link>
        </StepListItem>
      )}
    </StepList>
  );
}

function renderWithRouter(props: any = {}) {
  let {defaultSelectedKey, onSelectionChange, ...rest} = props;
  function Wrapper() {
    let [selectedKey, setSelectedKey] = React.useState<string | undefined>(defaultSelectedKey);
    let navigate = (href: string) => {
      setSelectedKey(href);
      onSelectionChange?.(href);
    };
    return (
      <RouterProvider navigate={navigate}>
        <StepList
          id="steplist-id"
          aria-label="steplist-test"
          {...rest}
          selectedKey={selectedKey}
          items={items}>
          {(item: StepItem) => (
            <StepListItem id={item.id} href={item.id}>
              <Link>{item.value}</Link>
            </StepListItem>
          )}
        </StepList>
      </RouterProvider>
    );
  }
  return render(<Wrapper />);
}

describe('StepList', function () {
  let onSelectionChange = jest.fn();
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('renders', function () {
    const tree = renderComponent({onSelectionChange});
    const stepListItems = tree.getAllByRole('link');
    expect(stepListItems.length).toBe(4);

    const stepOne = stepListItems[0];
    expect(stepOne).toHaveAttribute('aria-current', 'step');
    expect(stepOne).toHaveAttribute('tabIndex', '0');
    expect(stepOne.closest('li')!.textContent).not.toContain('Completed');
    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith('step-one');

    for (let i = 1; i < stepListItems.length; i++) {
      expect(stepListItems[i]).toHaveAttribute('aria-disabled', 'true');
      expect(stepListItems[i].closest('li')!.textContent).toContain('Not');
      expect(stepListItems[i]).not.toHaveAttribute('tabindex');
    }

    const stepList = tree.getByLabelText('steplist-test');
    expect(stepList).toHaveAttribute('id', 'steplist-id');
  });

  it('includes step state text in the accessible name via aria-labelledby', function () {
    const tree = renderComponent({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepListItems = tree.getAllByRole('link');

    // Each step link is labelled by its containing item, which includes the visually hidden
    // step state text, so the state is part of the link's accessible name.
    let currentStep = stepListItems[2];
    expect(currentStep!.getAttribute('aria-current')).toBeTruthy();

    let completedStep = stepListItems[0];
    expect(completedStep!.parentElement!.textContent).toContain('Completed');

    let notCompletedStep = stepListItems[3];
    expect(notCompletedStep!.parentElement!.textContent).toContain('Not');
  });

  it('attaches a user provided ref', function () {
    const ref = React.createRef<HTMLOListElement>();
    const container = renderComponent({ref});
    const stepList = container.getByLabelText('steplist-test');

    expect(ref.current).toBe(stepList);
  });

  it('allows user to navigate to completed steps and the immediate next step only', async function () {
    const tree = renderWithRouter({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    // Steps switch between <a> and <span> as selection changes, so re-query after each nav.
    const getSteps = () => within(stepList).getAllByRole('link');

    // navigate to a previously completed step
    expect(getSteps()[0]).not.toHaveAttribute('aria-current');
    expect(getSteps()[0].closest('li')!.textContent).toContain('Completed');
    await user.click(getSteps()[0]);
    expect(getSteps()[0]).toHaveAttribute('aria-current', 'step');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-one');

    // navigate to the immediate next step (step after last completed step)
    expect(getSteps()[2]).not.toHaveAttribute('aria-current');
    await user.click(getSteps()[2]);
    expect(getSteps()[2]).toHaveAttribute('aria-current');
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-three');
    onSelectionChange.mockReset();

    // the step after the immediate next step is not navigable
    expect(getSteps()[3]).not.toHaveAttribute('aria-current');
    await user.click(getSteps()[3]);
    expect(getSteps()[3]).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('allows user to change selected step via keyboard', async function () {
    const tree = renderWithRouter({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const getSteps = () => within(stepList).getAllByRole('link');

    expect(getSteps()[2]).toHaveAttribute('aria-current', 'step');

    // Only completed steps and the current step are tabbable; upcoming steps are skipped.
    await user.tab();
    expect(document.activeElement).toBe(getSteps()[0]);
    await user.tab();
    expect(document.activeElement).toBe(getSteps()[1]);
    await user.tab();
    expect(document.activeElement).toBe(getSteps()[2]);

    await user.tab({shift: true});
    expect(document.activeElement).toBe(getSteps()[1]);
    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith('step-two');
    expect(getSteps()[1]).toHaveAttribute('aria-current');
    onSelectionChange.mockReset();

    // Arrow keys do not change selection in a step list of links.
    await user.keyboard('{ArrowUp}');
    expect(getSteps()[1]).toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should not allow user to click on disabled steps', async function () {
    const tree = renderWithRouter({
      defaultLastCompletedStep: 'step-two',
      defaultSelectedKey: 'step-three',
      disabledKeys: ['step-one'],
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    const stepOne = stepListItems[0];
    expect(stepOne).toHaveAttribute('aria-disabled', 'true');

    await user.click(stepOne);
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should disable all steps when step list is disabled', async function () {
    const tree = renderComponent({
      defaultLastCompletedStep: 'step-two',
      isDisabled: true,
      onSelectionChange
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-three');
    onSelectionChange.mockReset();
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
    }

    const stepThree = stepListItems[2];
    expect(stepThree).toHaveAttribute('aria-current');

    const stepTwo = stepListItems[1];
    await user.click(stepTwo);
    expect(stepTwo).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('should not allow user to click previous steps when step list is readonly', async function () {
    const tree = renderWithRouter({
      defaultSelectedKey: 'step-four',
      defaultLastCompletedStep: 'step-three',
      isReadOnly: true,
      onSelectionChange
    });
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
    }

    const stepFour = stepListItems[3];
    expect(stepFour).toHaveAttribute('aria-current');

    const stepOne = stepListItems[0];
    await user.click(stepOne);
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  // TODO address bug, I think we missed a call to onLastCompletedStepChange
  it('updates the last completed step automatically (uncontrollled) when the selected step is updated', function () {
    const onLastCompletedStepChange = jest.fn();
    const onSelectionChange = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        defaultLastCompletedStep="step-one"
        onLastCompletedStepChange={onLastCompletedStepChange}
        onSelectionChange={onSelectionChange}
        selectedKey="step-one"
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );
    const stepList = getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    expect(stepListItems[0]).toHaveAttribute('aria-current');
    expect(stepListItems[0].closest('li')!.textContent).toContain('Current');
    expect(onLastCompletedStepChange).not.toHaveBeenCalled();

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-two"
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );

    expect(onLastCompletedStepChange).not.toHaveBeenCalled();
    expect(stepListItems[0].closest('li')!.textContent).toContain('Completed');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-three"
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );

    expect(onLastCompletedStepChange).toHaveBeenCalledWith('step-two');
    expect(stepListItems[1].closest('li')!.textContent).toContain('Completed');
  });

  it('does not update selected step when last completed step is controlled', function () {
    const onLastCompletedStepChange = jest.fn();
    const onSelectionChange = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        lastCompletedStep={'step-one'}
        onSelectionChange={onSelectionChange}
        onLastCompletedStepChange={onLastCompletedStepChange}
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );
    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith('step-two');
    const stepList = getByLabelText('steplist-test');
    const stepListItems = within(stepList).getAllByRole('link');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        onSelectionChange={onSelectionChange}
        lastCompletedStep="step-two"
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        onSelectionChange={onSelectionChange}
        lastCompletedStep="step-three"
        items={items}>
        {(item: StepItem) => (
          <StepListItem id={item.id}>
            <Link>{item.value}</Link>
          </StepListItem>
        )}
      </StepList>
    );

    expect(onLastCompletedStepChange).toHaveBeenCalledTimes(0);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(stepListItems[1]).toHaveAttribute('aria-current');
    expect(stepListItems[2].closest('li')!.textContent).toContain('Completed');
  });
});
