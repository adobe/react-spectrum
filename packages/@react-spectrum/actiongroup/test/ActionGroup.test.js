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

import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '../';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import {testSlotsAPI, triggerPress} from '@react-spectrum/test-utils';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import V2Button from '@react/react-spectrum/Button';
import V2ButtonGroup from '@react/react-spectrum/ButtonGroup';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

// Describes the tabIndex values of button 1 (column 1), 2, and 3 as focus is moved forward or back.
// e.g. button2Focused describes button 2 having tabindex=0 while all other buttons have -1
let expectedButtonIndicies = {
  button1Focused: ['0', '-1', '-1'],
  button2Focused: ['-1', '0', '-1'],
  button3Focused: ['-1', '-1', '0']
};

// Returns the expected button tab index configuration from expectedButtonIndicies in response to focus moving `forward` or `backward`
class BtnBehavior {
  constructor() {
    this.index = 0;
    this.buttons = expectedButtonIndicies;
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
        message: () => `expected button index configuration "button${i + 1}Focused": (${received.map((button) => button.getAttribute('tabIndex'))}) but got ${tabIndices}`,
        pass: false
      };
    } else {
      return {
        pass: true
      };
    }
  }
});

describe('ActionGroup', function () {
  afterEach(() => {
    btnBehavior.reset();
    cleanup();
  });

  it('uses slots api', () => {
    testSlotsAPI(ActionGroup);
  });

  it.each`
  Name               | ComponentGroup   | Component
  ${'ActionGroup'}   | ${ActionGroup}   | ${ActionButton}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}
  `('$Name handles defaults', function ({ComponentGroup, Component}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup>
          <Component >Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    expect(getByRole('radiogroup')).toBeTruthy();
    expect(getAllByRole('radio')).toBeTruthy();
  });

  it.each`
  Name               | ComponentGroup   | Component       | props
  ${'ActionGroup'}   | ${ActionGroup}   | ${ActionButton} | ${{selectionMode: 'multiple'}}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{multiple: true, role: 'toolbar'}}
  `('$Name handles multiple selection', function ({ComponentGroup, Component, props}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <ComponentGroup {...props} >
          <Component >Click me</Component>
          <Component >Click me</Component>
        </ComponentGroup>
      </Provider>
    );
    expect(getByRole('toolbar')).toBeTruthy();
    let button = getAllByRole('checkbox');
    expect(button.length).toBe(2);
  });

  it.each`
    Name               | ComponentGroup   | Component       | props
    ${'ActionGroup'}   | ${ActionGroup}   | ${ActionButton} | ${{orientation: 'vertical'}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{orientation: 'vertical', role: 'toolbar'}}
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
    Name               | ComponentGroup   | Component       | props
    ${'ActionGroup'}   | ${ActionGroup}   | ${ActionButton} | ${{isDisabled: true}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${V2Button}     | ${{disabled: true}}
  `('$Name handles disabeld', function ({ComponentGroup, Component, props}) {
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
    Name                                                   | ComponentGroup   | Component       | props                                         | orders
    ${'(left/right arrows, ltr + horizontal) ActionGroup'} | ${ActionGroup}   | ${ActionButton} | ${{locale: 'de-DE'}}                          | ${[{action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(left/right arrows, rtl + horizontal) ActionGroup'} | ${ActionGroup}   | ${ActionButton} | ${{locale: 'ar-AE'}}                          | ${[{action: pressArrowRight, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.forward}]}
    ${'(up/down arrows, ltr + horizontal) ActionGroup'}    | ${ActionGroup}   | ${ActionButton} | ${{locale: 'de-DE'}}                          | ${[{action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
    ${'(up/down arrows, rtl + horizontal) ActionGroup'}    | ${ActionGroup}   | ${ActionButton} | ${{locale: 'ar-AE'}}                          | ${[{action: pressArrowDown, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.forward}]}
    ${'(left/right arrows, ltr + vertical) ActionGroup'}   | ${ActionGroup}   | ${ActionButton} | ${{locale: 'de-DE', orientation: 'vertical'}} | ${[{action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(left/right arrows, rtl + vertical) ActionGroup'}   | ${ActionGroup}   | ${ActionButton} | ${{locale: 'ar-AE', orientation: 'vertical'}} | ${[{action: pressArrowRight, result: btnBehavior.forward}, {action: pressArrowLeft, result: btnBehavior.backward}, {action: pressArrowLeft, result: btnBehavior.backward}]}
    ${'(up/down arrows, ltr + vertical) ActionGroup'}      | ${ActionGroup}   | ${ActionButton} | ${{locale: 'de-DE', orientation: 'vertical'}} | ${[{action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
    ${'(up/down arrows, rtl + vertical) ActionGroup'}      | ${ActionGroup}   | ${ActionButton} | ${{locale: 'ar-AE', orientation: 'vertical'}} | ${[{action: pressArrowDown, result: btnBehavior.forward}, {action: pressArrowUp, result: btnBehavior.backward}, {action: pressArrowUp, result: btnBehavior.backward}]}
  `('$Name shifts button focus in the correct direction on key press', function ({ComponentGroup, Component, props, orders}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <ComponentGroup orientation={props.orientation} >
          <Component data-testid="button-1">Click me 1</Component>
          <Component data-testid="button-2">Click me 2</Component>
          <Component data-testid="button-3">Click me 3</Component>
        </ComponentGroup>
      </Provider>
    );

    let button1 = tree.getByTestId('button-1');
    let button2 = tree.getByTestId('button-2');
    let button3 = tree.getByTestId('button-3');
    let buttons = [button1, button2, button3];
    let buttonGroup = tree.getByRole('radiogroup');
    buttonGroup.focus();
    fireEvent.keyDown(document.activeElement, {key: 'Tab'});

    verifyResult(buttons, expectedButtonIndicies.button1Focused);

    orders.forEach(({action, result}, index) => {
      action(document.activeElement);
      verifyResult(buttons, result(), index);
    });
  });

  it('ActionGroup handles single selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup >
          <ActionButton data-testid="button-1">Click me</ActionButton>
          <ActionButton data-testid="button-2">Click me</ActionButton>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    let button2 = getByTestId('button-2');
    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'false');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('ActionGroup handles multiple selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="multiple">
          <ActionButton data-testid="button-1">Click me</ActionButton>
          <ActionButton data-testid="button-2">Click me</ActionButton>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'true');

    let button2 = getByTestId('button-2');
    triggerPress(button2);
    expect(button1).toHaveAttribute('aria-checked', 'true');
    expect(button2).toHaveAttribute('aria-checked', 'true');
  });

  it('ActionGroup handles none selection', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup selectionMode="none">
          <ActionButton data-testid="button-1">Click me</ActionButton>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    triggerPress(button1);
    expect(button1).toHaveAttribute('aria-checked', 'false');
  });

  it('ActionGroup should pass className, role and tabIndex', function () {
    let {getByTestId} = render(
      <Provider theme={theme} locale="de-DE">
        <ActionGroup>
          <ActionButton UNSAFE_className={'test-class'} data-testid="button-1">Click me</ActionButton>
        </ActionGroup>
      </Provider>
    );

    let button1 = getByTestId('button-1');
    expect(button1).not.toHaveAttribute('icon');
    expect(button1).not.toHaveAttribute('unsafe_classname');
    expect(button1).toHaveAttribute('class', expect.stringContaining('test-class'));
    expect(button1).toHaveAttribute('class', expect.stringContaining('-item'));
    expect(button1).toHaveAttribute('role', 'radio');
    expect(button1).toHaveAttribute('tabIndex', '-1');
  });
});
