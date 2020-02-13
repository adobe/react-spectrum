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
import {cleanup, fireEvent, render, within} from '@testing-library/react';
import {NumberField} from '../';
import NumberInput from '@react/react-spectrum/NumberInput';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

describe('NumberField', function () {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
    cleanup();
  });

  function renderNumberField(Component, props = {}) {
    let {container} = render(<Component {...props} />);

    container = within(container).queryByRole('group');
    let textField = container.firstChild;
    let buttons = within(container).queryAllByRole('button');
    let incrementButton = buttons[0];
    let decrementButton = buttons[1];
    // in v3 TextField is wrapped with one more div
    if (Component === NumberField) {
      textField = textField.firstChild;
    }
    return {
      container,
      textField,
      buttons,
      incrementButton,
      decrementButton
    };
  }

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name has correct aria and props', ({Component}) => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField(Component);

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(textField).toBeTruthy();
    expect(textField).toHaveAttribute('type', 'number');
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    userEvent.type(textField, '5');
    expect(onChangeSpy).toHaveBeenCalledWith(5);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change with custom step number', ({Component}) => {
    let {textField, incrementButton} = renderNumberField(Component, {onChange: onChangeSpy, step: 5});

    userEvent.type(textField, '2');
    expect(onChangeSpy).toHaveBeenCalledWith(2);
    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(7);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name handles decrementing input change from valid default to invalid and adds aria-invalid', ({Component}) => {
    let {
      container,
      textField
    } = renderNumberField(Component, {onChange: onChangeSpy, minValue: 0, defaultValue: 0});

    expect(container).toHaveAttribute('aria-invalid', 'false');

    userEvent.type(textField, '-1');
    expect(onChangeSpy).toHaveBeenCalledWith(-1);

    expect(container).toHaveAttribute('aria-invalid', 'true');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name handles incrementing input change from valid default to invalid and adds aria-invalid', ({Component}) => {
    let {
      container,
      textField
    } = renderNumberField(Component, {onChange: onChangeSpy, maxValue: 0, defaultValue: 0});

    expect(container).toHaveAttribute('aria-invalid', 'false');

    userEvent.type(textField, '1');
    expect(onChangeSpy).toHaveBeenCalledWith(1);

    expect(container).toHaveAttribute('aria-invalid', 'true');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name increment value by one when increment button is pressed', ({Component}) => {
    let {incrementButton} = renderNumberField(Component, {onChange: onChangeSpy});

    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name decrement value by one when increment button is pressed', ({Component}) => {
    let {decrementButton} = renderNumberField(Component, {onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name use step for increasing and decreasing value', ({Component}) => {
    let {decrementButton, incrementButton} = renderNumberField(Component, {step: 10, onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-10);

    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(0);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name decrement value when scrolling downwards', ({Component}) => {

    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: 10});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name increment value when scrolling upwards', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: -10});
    expect(onChangeSpy).toHaveBeenCalledWith(1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name incrementing from invalid default to valid value removes aria-invalid', ({Component}) => {
    let {
      container,
      incrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, minValue: 3, defaultValue: 2});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'true');

    triggerPress(incrementButton);
    expect(container).toHaveAttribute('aria-invalid', 'false');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name decrementing from invalid default to valid value removes aria-invalid', ({Component}) => {
    let {
      container,
      decrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, maxValue: 3, defaultValue: 4});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'true');

    triggerPress(decrementButton);
    expect(container).toHaveAttribute('aria-invalid', 'false');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name scrolling up from an invalid default value to a valid value removes aria-invalid', ({Component}) => {
    let {
      textField
    } = renderNumberField(Component, {minValue: 3, defaultValue: 2});

    expect(textField).toHaveAttribute('aria-invalid', 'true');
    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: -10});
    expect(textField).not.toHaveAttribute('aria-invalid');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name scrolling down from an invalid default value to a valid value removes aria-invalid', ({Component}) => {
    let {
      textField
    } = renderNumberField(Component, {maxValue: 3, defaultValue: 4});

    expect(textField).toHaveAttribute('aria-invalid', 'true');
    fireEvent.focus(textField);
    fireEvent.wheel(textField, {deltaY: 10});
    expect(textField).not.toHaveAttribute('aria-invalid');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name onChange is not called when controlled at minValue and decrement is pressed', ({Component}) => {
    let {
      container,
      decrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, minValue: 3, value: 3});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'false');
    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name onChange is not called when controlled at maxValue and increment is pressed', ({Component}) => {
    let {
      container,
      incrementButton
    } = renderNumberField(Component, {onChange: onChangeSpy, maxValue: 3, value: 3});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).toHaveAttribute('aria-invalid', 'false');
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name can hide step buttons', ({Component}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(Component, {showStepper: false});

    expect(textField).toBeDefined();
    expect(incrementButton).not.toBeDefined();
    expect(decrementButton).not.toBeDefined();
  });
});
