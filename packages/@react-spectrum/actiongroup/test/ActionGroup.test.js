/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, screen, triggerPress, within} from '@react-spectrum/test-utils';
import {ActionGroup} from '../';
import {Button} from '@react-spectrum/button';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import Edit from '@spectrum-icons/workflow/Edit';
import {Item} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {theme} from '@react-spectrum/theme-default';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import userEvent from '@testing-library/user-event';

// Describes the tabIndex values of button 1 (column 1), 2, and 3 as focus is moved forward or back.
// e.g. button2Focused describes button 2 having tabindex=0 while all other buttons have -1
let expectedButtonIndices = {
  button1Focused: ['0', '-1', '-1'],
  button2Focused: ['-1', '0', '-1'],
  button3Focused: ['-1', '-1', '0']
};

// Returns the expected button tab index configuration from expectedButtonIndicies in response to focus moving `forward` or `backward`
class BtnBehavior {
  constructor() {
    this.index = 0;
    this.buttons = expectedButtonIndices;
    this.forward = this.forward.bind(this);
    this.backward = this.backward.bind(this);
  }
  forward() {
    this.index = (this.index + 1) % 3;
    return this.current();
  }
  backward() {
    this.index = (this.index + 3 - 1) % 3;
    return this.current();
  }
  current() {
    return this.buttons[`button${this.index + 1}Focused`];
  }
  reset() {
    this.index = 0;
  }
}
let btnBehavior = new BtnBehavior();

function pressKeyOnButton(key) {
  return (button) => {
    fireEvent.keyDown(button, {key});
  };
}

function pressArrowRight(button) {
  return pressKeyOnButton('ArrowRight')(button);
}

function pressArrowLeft(button) {
  return pressKeyOnButton('ArrowLeft')(button);
}

function pressArrowUp(button) {
  return pressKeyOnButton('ArrowUp')(button);
}

function pressArrowDown(button) {
  return pressKeyOnButton('ArrowDown')(button);
}

function verifyResult(buttons, values, index) {
  expect(buttons).checkButtonIndex(values, index);
}

// Custom error message for button index equality check
expect.extend({
  checkButtonIndex(received, tabIndices, i) {
    let index = received.findIndex((htmlElement, i) => {
      const receivedValue = htmlElement.getAttribute('tabIndex');

      return receivedValue !== tabIndices[i];
    });

    if (index !== -1) {
      return {
        message: () => `expected button index configuration "button${i + 1}Focused": got (${received.map((button) => button.getAttribute('tabIndex'))}) but expected ${tabIndices}`,
        pass: false
      };
    } else {
      return {
        pass: true
      };
    }
  }
});

function renderComponent(props) {
  return render(
    <Provider theme={theme} locale="de-DE">
      <ActionGroup {...props}>
        <Item key="1">Click me 1</Item>
        <Item key="2">Click me 2</Item>
      </ActionGroup>
    </Provider>
  );
}

function renderComponentWithExtraInputs(props) {
  return render(
    <Provider theme={theme} locale="de-DE">
      <Button variant="primary" aria-label="ButtonBefore" />
      <ActionGroup {...props}>
        <Item key="1">Click me 1</Item>
        <Item key="2">Click me 2</Item>
      </ActionGroup>
      <Button variant="primary" aria-label="ButtonAfter" />
    </Provider>
  );
}

describe('ActionGroup', function () {
  beforeAll(function () {
    jest.useFakeTimers();

    jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
      if (this instanceof HTMLButtonElement) {
        return 100;
      }

      return 1000;
    });
  });

  afterEach(() => {
    btnBehavior.reset();
  });

  it.each`
  Name               | ComponentGroup   | Component
  ${'ActionGroup'}   | ${ActionGroup}   | ${Item}
  `('$Name handles defaults', function ({ComponentGroup, Component}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup>
          <Component >Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    expect(getByRole('toolbar')).toBeTruthy();
    expect(getAllByRole('button')).toBeTruthy();
  });

  it.each`
    Name               | ComponentGroup   | Component   | props
    ${'ActionGroup'}   | ${ActionGroup}   | ${Item}     | ${{orientation: 'vertical'}}
  `('$Name handles vertical', function ({ComponentGroup, Component, props}) {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} data-testid="test-group" >
          <Component>Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
  });

  it.each`
    Name               | ComponentGroup   | Component   | props
    ${'ActionGroup'}   | ${ActionGroup}   | ${Item}     | ${{selectionMode: 'single', isDisabled: true}}
  `('$Name handles disabled', function ({ComponentGroup, Component, props}) {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component>Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });

  it.each`
    Name                                                   | props                                         | orders
    ${'(left/right arrows, ltr + horizontal) ActionGroup'} | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(left/right arrows, rtl + horizontal) ActionGroup'} | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowRight, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.forward}]}
    ${'(up/down arrows, ltr + horizontal) ActionGroup'}    | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
    ${'(up/down arrows, rtl + horizontal) ActionGroup'}    | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
    ${'(left/right arrows, ltr + vertical) ActionGroup'}   | ${{locale: 'de-DE', orientation: 'vertical'}} | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(left/right arrows, rtl + vertical) ActionGroup'}   | ${{locale: 'ar-AE', orientation: 'vertical'}} | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(up/down arrows, ltr + vertical) ActionGroup'}      | ${{locale: 'de-DE', orientation: 'vertical'}} | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
    ${'(up/down arrows, rtl + vertical) ActionGroup'}      | ${{locale: 'ar-AE', orientation: 'vertical'}} | ${[{action: () => {userEvent.tab();}, result: () => expectedButtonIndices.button1Focused}, {action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
  `('$Name shifts button focus in the correct direction on key press', function ({Name, props, orders}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <ActionGroup orientation={props.orientation} >
          <Item data-testid="button-1" key="1">Click me 1</Item>
          <Item data-testid="button-2" key="">Click me 2</Item>
          <Item data-testid="button-3" key="3">Click me 3</Item>
        </ActionGroup>
      </Provider>
    );

    let buttons = tree.getAllByRole('button');

    orders.forEach(({action, result}, index) => {
      action(document.activeElement);
      verifyResult(buttons, result(), index);
    });
  });

  it.each`
    Name                     | props                | disabledKeys   | orders
    ${'middle disabled'}     | ${{locale: 'de-DE'}} | ${['1']}       | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['0', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1']}]}
    ${'first disabled'}      | ${{locale: 'de-DE'}} | ${['0']}       | ${[{action: () => {userEvent.tab();}, result: () => ['-1', '0', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '0', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '0', '-1']}]}
    ${'last disabled'}       | ${{locale: 'de-DE'}} | ${['2']}       | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '0', '-1']}, {action: pressArrowRight, result: () => ['0', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '0', '-1']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1']}]}
    ${'1&2 disabled'}        | ${{locale: 'de-DE'}} | ${['0', '1']}  | ${[{action: () => {userEvent.tab();}, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}]}
    ${'rtl middle disabled'} | ${{locale: 'ar-AE'}} | ${['1']}       | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['0', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1']}]}
    ${'rtl first disabled'}  | ${{locale: 'ar-AE'}} | ${['0']}       | ${[{action: () => {userEvent.tab();}, result: () => ['-1', '0', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '0', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '0', '-1']}]}
    ${'rtl last disabled'}   | ${{locale: 'ar-AE'}} | ${['2']}       | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '0', '-1']}, {action: pressArrowRight, result: () => ['0', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '0', '-1']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1']}]}
    ${'rtl 1&2 disabled'}    | ${{locale: 'ar-AE'}} | ${['0', '1']}  | ${[{action: () => {userEvent.tab();}, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowRight, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['-1', '-1', '0']}]}

  `('$Name skips disabled keys', function ({Name, props, disabledKeys, orders}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <ActionGroup disabledKeys={disabledKeys}>
          <Item key="0" data-testid="button-1">Click me 1</Item>
          <Item key="1" data-testid="button-2">Click me 2</Item>
          <Item key="2" data-testid="button-3">Click me 3</Item>
        </ActionGroup>
      </Provider>
    );

    let buttons = tree.getAllByRole('button');

    orders.forEach(({action, result}, index) => {
      action(document.activeElement);
      verifyResult(buttons, result(), index);
    });
  });

  it.each`
    Name                         | props                | disabledKeys   | orders
    ${'middle two disabled'}     | ${{locale: 'de-DE'}} | ${['1', '2']}  | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '-1', '0']}, {action: pressArrowRight, result: () => ['0', '-1', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1', '-1']}]}
    ${'rtl middle two disabled'} | ${{locale: 'de-DE'}} | ${['1', '2']}  | ${[{action: () => {userEvent.tab();}, result: () => ['0', '-1', '-1', '-1']}, {action: pressArrowRight, result: () => ['-1', '-1', '-1', '0']}, {action: pressArrowRight, result: () => ['0', '-1', '-1', '-1']}, {action: pressArrowLeft, result: () => ['-1', '-1', '-1', '0']}, {action: pressArrowLeft, result: () => ['0', '-1', '-1', '-1']}]}
  `('$Name skips multiple disabled keys', function ({Name, props, disabledKeys, orders}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <ActionGroup disabledKeys={disabledKeys}>
          <Item key="0" data-testid="button-1">Click me 1</Item>
          <Item key="1" data-testid="button-2">Click me 2</Item>
          <Item key="2" data-testid="button-3">Click me 3</Item>
          <Item key="3" data-testid="button-4">Click me 4</Item>
        </ActionGroup>
      </Provider>
    );

    let buttons = tree.getAllByRole('button');

    orders.forEach(({action, result}, index) => {
      action(document.activeElement);
      verifyResult(buttons, result(), index);
    });
  });

  it('should be focusable from Tab', async function () {
    let tree = renderComponentWithExtraInputs({selectionMode: 'single'});

    let buttonBefore = tree.getByLabelText('ButtonBefore');
    let buttonAfter = tree.getByLabelText('ButtonAfter');
    let buttons = tree.getAllByRole('radio');
    act(() => {buttonBefore.focus();});

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttonAfter);
  });

  it('should be focusable from Shift + Tab', function () {
    let tree = renderComponentWithExtraInputs({selectionMode: 'single'});

    let buttonBefore = tree.getByLabelText('ButtonBefore');
    let buttonAfter = tree.getByLabelText('ButtonAfter');
    let buttons = tree.getAllByRole('radio');
    act(() => {buttonAfter.focus();});

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttons[1]);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonBefore);
  });

  it('should remember last focused item', function () {
    let tree = renderComponentWithExtraInputs({selectionMode: 'single'});

    let buttonBefore = tree.getByLabelText('ButtonBefore');
    let buttonAfter = tree.getByLabelText('ButtonAfter');
    let buttons = tree.getAllByRole('radio');
    act(() => {buttonBefore.focus();});

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);

    pressArrowRight(buttons[0]);
    expect(document.activeElement).toBe(buttons[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttonAfter);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ActionGroup handles single selection', function () {
    let {getAllByRole} = renderComponent({selectionMode: 'single'});

    let [button1, button2] = getAllByRole('radio');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'false');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('ActionGroup handles multiple selection', function () {
    let {getByRole, getAllByRole} = renderComponent({selectionMode: 'multiple'});

    expect(getByRole('toolbar')).toBeTruthy();
    let [button1, button2] = getAllByRole('checkbox');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('ActionGroup should not allow selecting all items with cmd + a', function () {
    let {getAllByRole} = renderComponent({selectionMode: 'multiple'});

    let [button1, button2] = getAllByRole('checkbox');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'false');

    fireEvent.keyDown(button1, {key: 'a', ctrlKey: true});
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'false');
  });

  it('ActionGroup handles none selection', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="none">
          <Item>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('button');
    triggerPress(button1);
    expect(button1).not.toHaveAttribute('aria-checked');
  });

  it('ActionGroup should pass className, role and tabIndex', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="single">
          <Item UNSAFE_className={'test-class'}>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('radio');
    expect(button1).not.toHaveAttribute('icon');
    expect(button1).not.toHaveAttribute('unsafe_classname');
    expect(button1).toHaveAttribute('class', expect.not.stringContaining('test-class'));
    expect(button1).toHaveAttribute('class', expect.stringContaining('-item'));
    expect(button1).toHaveAttribute('role', 'radio');
    expect(button1).toHaveAttribute('tabIndex', '0');
  });

  it('ActionGroup handles disabledKeys', function () {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderComponent({selectionMode: 'single', disabledKeys: ['1'], onSelectionChange});

    let [button1, button2] = getAllByRole('radio');
    triggerPress(button1);
    expect(button1).toHaveAttribute('disabled');
    expect(onSelectionChange).toBeCalledTimes(0);
    triggerPress(button2);
    expect(button2).not.toHaveAttribute('disabled');
    expect(onSelectionChange).toBeCalledTimes(1);
  });

  it('ActionGroup handles selectedKeys (controlled)', function () {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderComponent({selectionMode: 'single', selectedKeys: ['1'], onSelectionChange});

    let [button1, button2] = getAllByRole('radio');
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'false');
    triggerPress(button2);
    expect(onSelectionChange).toBeCalledTimes(1);
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'false');
  });

  it('ActionGroup handles selectedKeys (uncontrolled)', function () {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderComponent({selectionMode: 'single', defaultSelectedKeys: ['1'], onSelectionChange});

    let [button1, button2] = getAllByRole('radio');
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'false');
    triggerPress(button2);
    expect(onSelectionChange).toBeCalledTimes(1);
    expect(button1).toHaveAttribute('aria-checked', 'false');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('ActionGroup deselects the selected button', function () {
    let onSelectionChange = jest.fn();
    let {getAllByRole} = renderComponent({selectionMode: 'single', onSelectionChange});

    let [button1] = getAllByRole('radio');
    triggerPress(button1);
    expect(onSelectionChange).toBeCalledTimes(1);
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['1']));
    triggerPress(button1);
    expect(onSelectionChange).toBeCalledTimes(2);
    expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set([]));
  });

  it('ActionGroup allows aria-label', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup aria-label="Test">
          <Item>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('toolbar');
    expect(button1).toHaveAttribute('aria-label', 'Test');
  });

  it('ActionGroup allows aria-labelledby', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <span id="test">Test</span>
        <ActionGroup aria-labelledby="test">
          <Item>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('toolbar');
    expect(button1).toHaveAttribute('aria-labelledby', 'test');
  });

  it('ActionGroup allows aria-describedby', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <span id="test">Test</span>
        <ActionGroup aria-describedby="test">
          <Item>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('toolbar');
    expect(button1).toHaveAttribute('aria-describedby', 'test');
  });

  it('ActionGroup allow aria-label on Item', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="single">
          <Item aria-label="Test">Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('radio');
    expect(button1).toHaveAttribute('aria-label', 'Test');
  });

  it('ActionGroup allows custom props', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup data-testid="test">
          <Item>Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByRole('toolbar');
    expect(button1).toHaveAttribute('data-testid', 'test');
  });

  it('ActionGroup Item allows custom props', function () {
    let {getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup>
          <Item data-testid="test">Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let item = getAllByRole('button')[0];
    expect(item).toHaveAttribute('data-testid', 'test');
  });

  it('fires onAction when a button is pressed', function () {
    let onAction = jest.fn();
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="none" onAction={onAction}>
          <Item key="test">Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button = tree.getByRole('button');
    triggerPress(button);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('test');
  });

  it('does not fire onAction if the action group is disabled', function () {
    let onAction = jest.fn();
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup onAction={onAction} isDisabled>
          <Item key="test">Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button = tree.getByRole('button');
    triggerPress(button);

    expect(onAction).not.toHaveBeenCalled();
  });

  it('does not fire onAction if the item is disabled', function () {
    let onAction = jest.fn();
    let tree = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup onAction={onAction} disabledKeys={['test']}>
          <Item key="test">Click me</Item>
        </ActionGroup>
      </Provider>
    );

    let button = tree.getByRole('button');
    triggerPress(button);

    expect(onAction).not.toHaveBeenCalled();
  });

  it('supports DialogTrigger as a wrapper around items', function () {
    let tree = render(
      <Provider theme={theme}>
        <ActionGroup>
          <DialogTrigger>
            <Item>Hi</Item>
            <Dialog>
              I'm a dialog
            </Dialog>
          </DialogTrigger>
        </ActionGroup>
      </Provider>
    );

    let button = tree.getByRole('button');

    act(() => {
      triggerPress(button);
      jest.runAllTimers();
    });

    let dialog = tree.getByRole('dialog');
    expect(dialog).toBeVisible();

    act(() => {
      fireEvent.keyDown(dialog, {key: 'Escape'});
      fireEvent.keyUp(dialog, {key: 'Escape'});
      jest.runAllTimers();
    });

    expect(tree.queryByRole('dialog')).toBeNull();
  });

  it('supports TooltipTrigger as a wrapper around items', function () {
    let tree = render(
      <Provider theme={theme}>
        <ActionGroup>
          <TooltipTrigger>
            <Item>Hi</Item>
            <Tooltip>
              I'm a tooltip
            </Tooltip>
          </TooltipTrigger>
        </ActionGroup>
      </Provider>
    );

    let button = tree.getByRole('button');
    fireEvent.keyDown(document.body, {key: 'Tab'});
    fireEvent.keyUp(document.body, {key: 'Tab'});
    act(() => button.focus());

    let tooltip = tree.getByRole('tooltip');
    expect(tooltip).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('no infinite loop if all keys are disabled', function () {
    let tree = render(
      <Provider theme={theme}>
        <input type="text" id="foo" autoFocus />
        <ActionGroup disabledKeys={['test1', 'test2']} selectionMode="single">
          <Item key="test1">Hi</Item>
          <Item key="test2">Bye</Item>
        </ActionGroup>
        <input type="text" id="bar" />
      </Provider>
    );

    let actiongroup = tree.getByRole('radiogroup');
    expect(actiongroup).toHaveAttribute('aria-disabled', 'true');
    let inputs = tree.getAllByRole('textbox');
    expect(document.activeElement).toBe(inputs[0]);
    userEvent.tab();
    expect(document.activeElement).toBe(inputs[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('not disabled if extraneous disabledKeys are provided', function () {
    let tree = render(
      <Provider theme={theme}>
        <input type="text" id="foo" autoFocus />
        <ActionGroup disabledKeys={['test1', 'foo']} selectionMode="single">
          <Item key="test1">Hi</Item>
          <Item key="test2">Bye</Item>
        </ActionGroup>
        <input type="text" id="bar" />
      </Provider>
    );

    let actiongroup = tree.getByRole('radiogroup');
    expect(actiongroup).not.toHaveAttribute('aria-disabled', 'true');
    let inputs = tree.getAllByRole('textbox');
    let buttons = tree.getAllByRole('radio');
    expect(document.activeElement).toBe(inputs[0]);
    userEvent.tab();
    expect(document.activeElement).toBe(buttons[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('is disabled if extraneous disabledKeys are provided in addition to all keys being disabled', function () {
    let tree = render(
      <Provider theme={theme}>
        <input type="text" id="foo" autoFocus />
        <ActionGroup disabledKeys={['test1', 'test2', 'foo']} selectionMode="single">
          <Item key="test1">Hi</Item>
          <Item key="test2">Bye</Item>
        </ActionGroup>
        <input type="text" id="bar" />
      </Provider>
    );

    let actiongroup = tree.getByRole('radiogroup');
    expect(actiongroup).toHaveAttribute('aria-disabled', 'true');
    let inputs = tree.getAllByRole('textbox');
    expect(document.activeElement).toBe(inputs[0]);
    userEvent.tab();
    expect(document.activeElement).toBe(inputs[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[0]);
  });

  describe('overflowMode="collapse"', function () {
    beforeEach(() => {
      jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
        if (this instanceof HTMLButtonElement) {
          return 100;
        }

        return 250;
      });
    });

    it('collapses overflowing items into a menu', function () {
      let onAction = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" onAction={onAction}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveTextContent('One');
      expect(buttons[1]).toHaveAttribute('aria-label', '…');
      expect(buttons[1]).toHaveAttribute('aria-haspopup', 'true');
      expect(buttons[1]).not.toHaveAttribute('aria-checked');

      triggerPress(buttons[1]);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Two');
      expect(items[1]).toHaveTextContent('Three');
      expect(items[2]).toHaveTextContent('Four');

      triggerPress(items[1]);
      expect(onAction).toHaveBeenCalledWith('three');
    });

    it('collapsed menu items can have DOM attributes passed to them', function () {
      let onAction = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" onAction={onAction}>
            <Item key="one">One</Item>
            <Item key="two" data-element="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');

      triggerPress(buttons[1]);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitem');
      expect(items[0]).toHaveAttribute('data-element', 'two');
    });

    it('handles keyboard focus management properly', function () {
      let onAction = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" onAction={onAction}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
      expect(buttons[1]).toHaveAttribute('tabIndex', '0');

      act(() => buttons[0].focus());
      expect(buttons[0]).toHaveAttribute('tabIndex', '0');
      expect(buttons[1]).toHaveAttribute('tabIndex', '-1');

      pressArrowRight(buttons[0]);
      expect(buttons[0]).toHaveAttribute('tabIndex', '-1');
      expect(buttons[1]).toHaveAttribute('tabIndex', '0');
    });

    it('passes aria labeling props through to menu button if it is the only child', function () {
      jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
        if (this instanceof HTMLButtonElement) {
          return 100;
        }

        return 150;
      });

      let onAction = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup aria-label="Test" overflowMode="collapse" onAction={onAction}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      expect(tree.queryByRole('toolbar')).toBeNull();
      let button = tree.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Test');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).not.toHaveAttribute('aria-checked');

      triggerPress(button);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitem');
      expect(items).toHaveLength(4);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');
      expect(items[3]).toHaveTextContent('Four');

      triggerPress(items[1]);
      expect(onAction).toHaveBeenCalledWith('two');
    });

    it('collapses all items if selectionMode="single"', function () {
      let onSelectionChange = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" selectionMode="single" defaultSelectedKeys={['two']} onSelectionChange={onSelectionChange}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      expect(tree.queryByRole('radiogroup')).toBeNull();

      let button = tree.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '…');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).not.toHaveAttribute('aria-checked');

      triggerPress(button);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitemradio');
      expect(items).toHaveLength(4);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[1]).toHaveAttribute('aria-checked', 'true');
      expect(items[2]).toHaveTextContent('Three');
      expect(items[3]).toHaveTextContent('Four');

      triggerPress(items[2]);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['three']));

      triggerPress(button);
      menu = tree.getByRole('menu');
      items = within(menu).getAllByRole('menuitemradio');

      expect(items[1]).not.toHaveAttribute('aria-checked', 'true');
      expect(items[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('collapses all items if selectionMode="multiple"', function () {
      let onSelectionChange = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" selectionMode="multiple" defaultSelectedKeys={['two', 'three']} onSelectionChange={onSelectionChange}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      expect(tree.queryByRole('radiogroup')).toBeNull();

      let button = tree.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '…');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).not.toHaveAttribute('aria-checked');

      triggerPress(button);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitemcheckbox');
      expect(items).toHaveLength(4);
      expect(items[0]).toHaveTextContent('One');
      expect(items[0]).not.toHaveAttribute('aria-checked', 'true');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[1]).toHaveAttribute('aria-checked', 'true');
      expect(items[2]).toHaveTextContent('Three');
      expect(items[2]).toHaveAttribute('aria-checked', 'true');
      expect(items[3]).toHaveTextContent('Four');
      expect(items[3]).not.toHaveAttribute('aria-checked', 'true');

      triggerPress(items[3]);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['two', 'three', 'four']));

      expect(items[1]).toHaveAttribute('aria-checked', 'true');
      expect(items[2]).toHaveAttribute('aria-checked', 'true');
      expect(items[3]).toHaveAttribute('aria-checked', 'true');
    });

    it('menu button should be disabled if action group is disabled', function () {
      let onAction = jest.fn();
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" onAction={onAction} isDisabled>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveTextContent('One');
      expect(buttons[0]).toBeDisabled();
      expect(buttons[1]).toHaveAttribute('aria-label', '…');
      expect(buttons[1]).toHaveAttribute('aria-haspopup', 'true');
      expect(buttons[1]).not.toHaveAttribute('aria-checked');
      expect(buttons[1]).toBeDisabled();
    });

    it('menu items should be disabled for items listed in disabledKeys', function () {
      const handleOnAction = jest.fn();

      render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" onAction={handleOnAction} disabledKeys={['two', 'four']}>
            <Item key="one">One</Item>
            <Item key="two">Two</Item>
            <Item key="three">Three</Item>
            <Item key="four">Four</Item>
          </ActionGroup>
        </Provider>
      );

      const actionGroup = screen.getByRole('toolbar');
      expect(within(actionGroup).getAllByRole('button')).toHaveLength(2);
      expect(within(actionGroup).getByRole('button', {name: 'One'})).toBeVisible();

      const moreButton = within(actionGroup).getByRole('button', {name: '…'});
      expect(moreButton).not.toHaveAttribute('aria-checked');
      expect(moreButton).toBeVisible();

      triggerPress(moreButton);

      const menu = screen.getByRole('menu');
      expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);

      const itemTwo = within(menu).getByRole('menuitem', {name: 'Two'});
      expect(itemTwo).toBeVisible();
      expect(itemTwo).toHaveAttribute('aria-disabled', 'true');

      const itemThree = within(menu).getByRole('menuitem', {name: 'Three'});
      expect(itemThree).toBeVisible();
      expect(itemThree).not.toHaveAttribute('aria-disabled');

      const itemFour = within(menu).getByRole('menuitem', {name: 'Four'});
      expect(itemFour).toBeVisible();
      expect(itemFour).toHaveAttribute('aria-disabled', 'true');

      triggerPress(itemTwo);
      expect(handleOnAction).not.toHaveBeenCalled();

      triggerPress(itemFour);
      expect(handleOnAction).not.toHaveBeenCalled();

      triggerPress(itemThree);
      expect(handleOnAction).toHaveBeenCalled();
    });
  });

  describe('buttonLabelBehavior', function () {
    it('should show the text in a tooltip with buttonLabelBehavior="hide"', function () {
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" buttonLabelBehavior="hide">
            <Item key="one">
              <Edit />
              <Text>One</Text>
            </Item>
            <Item key="two">
              <Edit />
              <Text>Two</Text>
            </Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveAttribute('aria-labelledby');
      let text = document.getElementById(buttons[0].getAttribute('aria-labelledby'));
      expect(text).toHaveTextContent('One');
      expect(text).toHaveAttribute('hidden');

      fireEvent.mouseEnter(buttons[0]);
      fireEvent.mouseMove(buttons[0]);
      act(() => jest.advanceTimersByTime(2000));

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('One');
      expect(buttons[0]).toHaveAttribute('aria-describedby', tooltip.id);
    });

    it('should show the text when collapsed into a dropdown', function () {
      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" buttonLabelBehavior="hide">
            <Item key="one" textValue="One">
              <Edit />
              <Text>One</Text>
            </Item>
            <Item key="two" textValue="Two">
              <Edit />
              <Text>Two</Text>
            </Item>
            <Item key="three" textValue="Three">
              <Edit />
              <Text>Three</Text>
            </Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);

      triggerPress(buttons[1]);

      let menu = tree.getByRole('menu');
      let items = within(menu).getAllByRole('menuitem');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('Two');
      expect(items[1]).toHaveTextContent('Three');
    });

    it('should show the text if it fits with buttonLabelBehavior="collapse"', function () {
      jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
        if (this instanceof HTMLButtonElement) {
          return this.hasAttribute('aria-labelledby') ? 50 : 100;
        }

        return 300;
      });

      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" buttonLabelBehavior="collapse">
            <Item key="one">
              <Edit />
              <Text>One</Text>
            </Item>
            <Item key="two">
              <Edit />
              <Text>Two</Text>
            </Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).not.toHaveAttribute('aria-labelledby');
      expect(buttons[0]).toHaveTextContent('One');
    });

    it('should hide the text if it does not fit with buttonLabelBehavior="collapse"', function () {
      jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
        if (this instanceof HTMLButtonElement) {
          return this.hasAttribute('aria-labelledby') ? 50 : 100;
        }

        return 150;
      });

      let tree = render(
        <Provider theme={theme}>
          <ActionGroup overflowMode="collapse" buttonLabelBehavior="collapse">
            <Item key="one">
              <Edit />
              <Text>One</Text>
            </Item>
            <Item key="two">
              <Edit />
              <Text>Two</Text>
            </Item>
          </ActionGroup>
        </Provider>
      );

      let actiongroup = tree.getByRole('toolbar');
      let buttons = within(actiongroup).getAllByRole('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveAttribute('aria-labelledby');
      let text = document.getElementById(buttons[0].getAttribute('aria-labelledby'));
      expect(text).toHaveTextContent('One');
      expect(text).toHaveAttribute('hidden');

      fireEvent.mouseEnter(buttons[0]);
      fireEvent.mouseMove(buttons[0]);
      act(() => jest.advanceTimersByTime(2000));

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('One');
      expect(buttons[0]).toHaveAttribute('aria-describedby', tooltip.id);
    });
  });
});
