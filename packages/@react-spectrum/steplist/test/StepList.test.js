/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, triggerPress, within} from '@react-spectrum/test-utils';
import {Item} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {StepList} from '../';
import {theme} from '@react-spectrum/theme-default';

const items = [
  {key: 'step-one', value: 'Step 1'},
  {key: 'step-two', value: 'Step 2'},
  {key: 'step-three', value: 'Step 3'},
  {key: 'step-four', value: 'Step 4'}
];

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <StepList {...props} id="steplist-id" aria-label="steplist-test">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    </Provider>
  );
}

describe('StepList', function () {
  let onSelectionChange = jest.fn();

  it('renders', function () {
    const tree = renderComponent();
    const stepListItems = tree.getAllByRole('link');
    expect(stepListItems.length).toBe(4);

    const stepOne = stepListItems[0];
    expect(stepOne).toHaveAttribute('aria-current', 'step');
    expect(stepOne).not.toHaveAttribute('tabindex');
    expect(stepOne).toHaveClass('is-selected');
    expect(stepOne.firstElementChild.textContent).not.toContain('Not');

    for (let i = 1; i < stepListItems.length; i++) {
      expect(stepListItems[i]).toHaveAttribute('aria-disabled', 'true');
      expect(stepListItems[1]).not.toHaveClass('is-completed');
      expect(stepListItems[1]).not.toHaveClass('is-selected');
      expect(stepListItems[i].firstElementChild.textContent).toContain('Not');
    }

    const stepList = tree.getByLabelText('steplist-test');
    expect(stepList).toHaveAttribute('id', 'steplist-id');
  });

  it('renders sizes', () => {
    const tree = renderComponent({size: 'XL'});
    const stepList = tree.getByLabelText('steplist-test');

    expect(stepList).toHaveAttribute('class', expect.stringContaining('--xlarge'));
  });

  it('renders vertical', () => {
    const tree = renderComponent({orientation: 'vertical'});
    const stepList = tree.getByLabelText('steplist-test');

    expect(stepList).toHaveAttribute('class', expect.stringContaining('--vertical'));
  });

  it('attaches a user provided ref', function () {
    const ref = React.createRef();
    const container = renderComponent({ref});
    const stepList = container.getByLabelText('steplist-test');

    expect(ref.current.UNSAFE_getDOMNode()).toBe(stepList);
  });

  it('allows user to click completed steps and immediate next step only', function () {
    const tree = renderComponent({defaultLastCompletedStep: 'step-two', defaultSelectedKey: 'step-three', onSelectionChange});
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    // select previously completed step
    const stepOne = stepListItems[0];
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(stepOne).toHaveClass('is-completed');
    triggerPress(stepOne);
    expect(stepOne).toHaveAttribute('aria-current', 'step');

    // select immediate next step (step after last completed step)
    const stepThree = stepListItems[2];
    expect(stepThree).not.toHaveAttribute('aria-current');
    expect(stepThree).not.toHaveClass('is-completed');
    triggerPress(stepThree);
    expect(stepThree).toHaveAttribute('aria-current');

    // try to select step after immediate next step
    const stepFour = stepListItems[3];
    expect(stepFour).not.toHaveAttribute('aria-current');
    triggerPress(stepFour);
    expect(stepFour).not.toHaveAttribute('aria-current');
  });

  it('allows user to change selected step via tab key only', function () {
    const tree = renderComponent({defaultLastCompletedStep: 'step-two', defaultSelectedKey: 'step-three', onSelectionChange});
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    expect(stepListItems[2]).toHaveAttribute('aria-current', 'step');

    function pressKey(keyOptions) {
      fireEvent.keyDown(document.activeElement, keyOptions);
      fireEvent.keyUp(document.activeElement, keyOptions);
    }

    act(() => {
      stepListItems[1].focus();
      pressKey({key: 'Tab', shiftKey: true});
      pressKey({key: 'Enter'});
    });

    expect(stepListItems[1]).toHaveAttribute('aria-current');

    act(() => {
      pressKey({key: 'ArrowUp'});
    });

    expect(stepListItems[1]).toHaveAttribute('aria-current');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('should not allow user to click on disabled steps', () => {
    const tree = renderComponent({defaultLastCompletedStep: 'step-two', defaultSelectedKey: 'step-three', disabledKeys: ['step-one']});
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    const stepOne = stepListItems[0];

    triggerPress(stepOne);
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(stepOne).not.toHaveClass('is-selected');
  });

  it('should disable all steps when step list is disabled', function () {
    const tree = renderComponent({defaultLastCompletedStep: 'step-two', isDisabled: true});
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
      expect(stepListItem).toHaveClass('is-disabled');
    }

    const stepOne = stepListItems[0];
    expect(stepOne).toHaveAttribute('aria-current');
    expect(stepOne).not.toHaveClass('is-selected');

    const stepTwo = stepListItems[1];
    triggerPress(stepTwo);
    expect(stepTwo).not.toHaveAttribute('aria-current');
    expect(stepTwo).not.toHaveClass('is-selected');
  });

  it('should not allow user to click previous steps when step list is read only', function () {
    const tree = renderComponent({defaultSelectedKey: 'step-four', defaultLastCompletedStep: 'step-three', isReadOnly: true});
    const stepList = tree.getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    for (let stepListItem of stepListItems) {
      expect(stepListItem).toHaveAttribute('aria-disabled', 'true');
      expect(stepListItem).not.toHaveClass('is-disabled');
    }

    const stepFour = stepListItems[3];
    expect(stepFour).toHaveAttribute('aria-current');
    expect(stepFour).toHaveClass('is-selected');

    const stepOne = stepListItems[0];
    triggerPress(stepOne);
    expect(stepOne).not.toHaveAttribute('aria-current');
    expect(stepOne).not.toHaveClass('is-selected');
  });

  it('updates the last completed step automatically (uncontrollled) when the selected step is updated', function () {
    const onLastCompletedStepChange = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        defaultLastCompletedStep="step-one"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-one">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );
    const stepList = getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    expect(stepListItems[0]).toHaveClass('is-completed');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-two">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );

    expect(onLastCompletedStepChange.mock.calls.length).toBe(0);
    expect(stepListItems[0]).toHaveClass('is-completed');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onLastCompletedStepChange={onLastCompletedStepChange}
        selectedKey="step-three">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );

    expect(onLastCompletedStepChange.mock.calls[0][0]).toBe('step-two');
    expect(stepListItems[1]).toHaveClass('is-completed');
  });

  it('does not updated selected step when last completed step is controlled', function () {
    const onSelectedKey = jest.fn();
    const {getByLabelText, rerender} = render(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        lastCompletedStep={'step-one'}
        onSelectedKey={onSelectedKey}>
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );
    const stepList = getByLabelText('steplist-test');
    const stepListItems =  within(stepList).getAllByRole('link');

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onSelectedKey={onSelectedKey}
        lastCompletedStep="step-two">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );

    rerender(
      <StepList
        id="steplist-id"
        aria-label="steplist-test"
        onSelectedKey={onSelectedKey}
        lastCompletedStep="step-three">
        {items.map(item => (<Item key={item.key}>{item.value}</Item>))}
      </StepList>
    );

    expect(onSelectedKey.mock.calls.length).toBe(0);
    expect(stepListItems[0]).toHaveClass('is-selected');
    expect(stepListItems[1]).toHaveClass('is-completed');
    expect(stepListItems[2]).toHaveClass('is-completed');
  });
});
