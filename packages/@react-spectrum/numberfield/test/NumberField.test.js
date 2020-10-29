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

import {act, fireEvent, render, within} from '@testing-library/react';
import {chain} from '@react-aria/utils';
import {NumberField} from '../';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import {typeText} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

// a note for these tests, text selection is not working in jsdom, so on focus will not select the value already
// in the numberfield

describe('NumberField', function () {
  let onChangeSpy = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
    // there's an announcer, make sure to run through it
    act(() => {jest.runAllTimers();});
  });

  function renderNumberField(props = {}, locale = 'en-US') {
    let {container, debug, rerender} = render(<Provider theme={theme} locale={locale}><NumberField aria-label="labelled" {...props} /></Provider>);

    container = within(container).queryByRole('group');
    let textField = container.firstChild;
    let buttons = within(container).queryAllByRole('button');
    let incrementButton = buttons[0];
    let decrementButton = buttons[1];
    textField = textField.firstChild;
    return {
      container,
      textField,
      buttons,
      incrementButton,
      decrementButton,
      debug,
      rerender: (props = {}, locale) => rerender(<Provider theme={theme} locale={locale}><NumberField aria-label="labelled" {...props} /></Provider>)
    };
  }

  it.each`
    Name
    ${'NumberField'}
  `('$Name has correct aria and props', () => {
    let {
      container,
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField();

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(textField).toBeTruthy();
    expect(textField).toHaveAttribute('type', 'text');
    expect(textField).toHaveAttribute('inputMode', 'decimal');
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name switches to numeric inputMode if maximumFractionDigits is 0 and cannot type decimal', () => {
    let {
      textField
    } = renderNumberField({onChange: onChangeSpy, formatOptions: {maximumFractionDigits: 0}});

    expect(textField).toHaveAttribute('inputMode', 'numeric');

    act(() => {textField.focus();});
    typeText(textField, '5.2');
    expect(textField).toHaveAttribute('value', '52');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(52);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name switches to numeric for currencies that have no decimals', () => {
    let {
      textField
    } = renderNumberField({onChange: onChangeSpy, formatOptions: {style: 'currency', currency: 'JPY'}});

    expect(textField).toHaveAttribute('inputMode', 'numeric');

    act(() => {textField.focus();});
    typeText(textField, '5.2');
    expect(textField).toHaveAttribute('value', '52');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '¥52');
    expect(onChangeSpy).toHaveBeenCalledWith(52);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name switches to numeric for percentages', () => {
    let {
      textField
    } = renderNumberField({onChange: onChangeSpy, formatOptions: {style: 'percent'}});

    expect(textField).toHaveAttribute('inputMode', 'numeric');

    act(() => {textField.focus();});
    typeText(textField, '5.2');
    expect(textField).toHaveAttribute('value', '52');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '52%');
    expect(onChangeSpy).toHaveBeenCalledWith(0.52);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name handles input change', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    typeText(textField, '5');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(5);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name handles just typing a minus sign from empty', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    typeText(textField, '-');
    act(() => {textField.blur();});
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', '');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name handles starting a number with a decimal input change', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    typeText(textField, '.5');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(0.5);
  });

  it.each`
    Name
    ${'NumberField'}
  `('cannot type random letter after a number', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    typeText(textField, '1acd');
    expect(textField).toHaveAttribute('value', '1');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(1);
    expect(textField).toHaveAttribute('value', '1');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name handles input change with custom step number', () => {
    let {textField, incrementButton} = renderNumberField({onChange: onChangeSpy, step: 5});

    act(() => {textField.focus();});
    typeText(textField, '2');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenLastCalledWith(0);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenLastCalledWith(5);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '3');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenLastCalledWith(5);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenLastCalledWith(10);
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will not allow typing of a number less than the min', () => {
    let {
      container,
      textField
    } = renderNumberField({onChange: onChangeSpy, minValue: 0});

    expect(container).not.toHaveAttribute('aria-invalid');

    act(() => {textField.focus();});
    typeText(textField, '-');
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
    expect(textField).toHaveAttribute('value', '');
    typeText(textField, '1');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(1);
    expect(textField).toHaveAttribute('value', '1');

    expect(container).not.toHaveAttribute('aria-invalid');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will allow typing of a number between min and max', () => {
    let {
      textField
    } = renderNumberField({onChange: onChangeSpy, minValue: 20, maxValue: 50});

    act(() => {textField.focus();});
    typeText(textField, '32');
    expect(textField).toHaveAttribute('value', '32');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(32);
    expect(textField).toHaveAttribute('value', '32');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will not allow typing of a number greater than the max', () => {
    let {
      container,
      textField
    } = renderNumberField({onChange: onChangeSpy, maxValue: 1, defaultValue: 0});

    expect(container).not.toHaveAttribute('aria-invalid');

    act(() => {textField.focus();});
    typeText(textField, '2');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy).toHaveBeenCalledWith(1);
    expect(textField).toHaveAttribute('value', '1');

    expect(container).not.toHaveAttribute('aria-invalid');

    onChangeSpy.mockReset();
    act(() => {textField.focus();});
    typeText(textField, '1');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', '1');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name increment value by one when increment button is pressed', () => {
    let {incrementButton} = renderNumberField({onChange: onChangeSpy});

    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name decrement value by one when increment button is pressed', () => {
    let {decrementButton} = renderNumberField({onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name use step for increasing and decreasing value', () => {
    let {decrementButton, incrementButton} = renderNumberField({step: 10, onChange: onChangeSpy});

    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(-10);

    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(0);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name decrement value when scrolling downwards or left in LTR', () => {

    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.wheel(textField, {deltaY: 10});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
    fireEvent.wheel(textField, {deltaX: -10});
    expect(onChangeSpy).toHaveBeenLastCalledWith(-2);
    act(() => {textField.blur();});
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name increment value when scrolling upwards or right in LTR', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.wheel(textField, {deltaY: -10});
    expect(onChangeSpy).toHaveBeenLastCalledWith(1);
    fireEvent.wheel(textField, {deltaX: 10});
    expect(onChangeSpy).toHaveBeenLastCalledWith(2);
    act(() => {textField.blur();});
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name decrement value when scrolling right in RTL', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy}, 'ar-AE');

    act(() => {textField.focus();});
    fireEvent.wheel(textField, {deltaY: 10});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
    fireEvent.wheel(textField, {deltaX: 10});
    expect(onChangeSpy).toHaveBeenLastCalledWith(-2);
    act(() => {textField.blur();});
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name increment value when scrolling left in RTL', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy}, 'ar-AE');

    act(() => {textField.focus();});
    fireEvent.wheel(textField, {deltaY: -10});
    expect(onChangeSpy).toHaveBeenCalledWith(1);
    fireEvent.wheel(textField, {deltaX: -10});
    expect(onChangeSpy).toHaveBeenLastCalledWith(2);
    act(() => {textField.blur();});
  });

  // pinch to zoom triggers scrolling https://bugzilla.mozilla.org/show_bug.cgi?id=1052253 with the ctrl key
  it.each`
    Name
    ${'NumberField'}
  `('$Name should not fire increment or decrement if it is a zoom event', () => {

    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.wheel(textField, {deltaY: 10, ctrlKey: true});
    expect(onChangeSpy).not.toHaveBeenCalled();
    fireEvent.wheel(textField, {deltaY: -10, ctrlKey: true});
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
  });

  // TODO: what should happen when an invalid defaultValue is supplied in a min/max

  it.each`
    Name
    ${'NumberField'}
  `('$Name onChange is not called when controlled at minValue and decrement is pressed', () => {
    let {
      container,
      decrementButton
    } = renderNumberField({onChange: onChangeSpy, minValue: 3, value: 3});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).not.toHaveAttribute('aria-invalid');
    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    Name
    ${'v3 NumberField'}
  `('$Name onChange is not called when controlled at maxValue and increment is pressed', () => {
    let {
      container,
      incrementButton
    } = renderNumberField({onChange: onChangeSpy, maxValue: 3, value: 3});

    expect(container).toBeTruthy();
    expect(container).toHaveAttribute('role', 'group');
    expect(container).not.toHaveAttribute('aria-invalid');
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name can hide step buttons', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({showStepper: false});

    expect(textField).toBeDefined();
    expect(incrementButton).not.toBeDefined();
    expect(decrementButton).not.toBeDefined();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name starting from empty field, will start at the 0 if neither min or max are defined', () => {
    let {
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField({onChange: onChangeSpy});

    expect(textField).toHaveAttribute('value', '');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '1');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(1);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(NaN);

    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '-1');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name starting from empty field, will start at the minValue if defined and not the smallest allowed', () => {
    let {
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField({onChange: onChangeSpy, minValue: 3});

    expect(textField).toHaveAttribute('value', '');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '4');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(4);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(NaN);

    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '3');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(3);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name starting from empty field, will start at the maxValue if defined and not the largest allowed', () => {
    let {
      textField,
      incrementButton,
      decrementButton
    } = renderNumberField({onChange: onChangeSpy, maxValue: 3});

    expect(textField).toHaveAttribute('value', '');
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '2');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(2);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(NaN);

    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '3');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(3);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly will return the same number from onChange as is displayed', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, defaultValue: 10, formatOptions: {maximumFractionDigits: 2}});

    expect(textField).toHaveAttribute('value', '10');
    typeText(textField, '.01');
    expect(textField).toHaveAttribute('value', '10.01');
    expect(onChangeSpy).not.toHaveBeenCalled();

    typeText(textField, '45');
    expect(textField).toHaveAttribute('value', '10.0145');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '10.01');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(10.01);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats defaultValue', () => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will not call onChange with NaN before a valid input has been typed', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, formatOptions: {style: 'currency', currency: 'EUR'}});
    act(() => {textField.focus();});
    typeText(textField, '-');
    userEvent.type(textField, '{backspace}');
    act(() => {textField.blur();});
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will parse numbers even if they have currency in them', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, defaultValue: -10, formatOptions: {style: 'currency', currency: 'USD'}});
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '-$10.00');
    userEvent.type(textField, '{backspace}');
    typeText(textField, '2');
    expect(textField).toHaveAttribute('value', '-$10.02');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '-$10.02');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(-10.02);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will not call onChange with NaN twice in a row', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, formatOptions: {style: 'currency', currency: 'EUR'}});
    act(() => {textField.focus();});
    typeText(textField, '-');
    userEvent.type(textField, '{backspace}');
    typeText(textField, '-');
    userEvent.type(textField, '{backspace}');
    act(() => {textField.blur();});
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name if an invalid input is left, then revert to last good value', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, formatOptions: {style: 'currency', currency: 'EUR'}});
    act(() => {textField.focus();});
    typeText(textField, '-1');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
    expect(textField).toHaveAttribute('value', '-€1.00');
    onChangeSpy.mockReset();
    act(() => {textField.focus();});
    userEvent.type(textField, '{backspace}');
    userEvent.type(textField, '{backspace}');
    userEvent.type(textField, '{backspace}');
    userEvent.type(textField, '{backspace}');
    userEvent.type(textField, '{backspace}');
    expect(textField).toHaveAttribute('value', '-');
    act(() => {textField.blur();});
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', '-€1.00');
  });

  it.each`
    Name                    | value          | result
    ${'NumberField'}        | ${'98.543213'} | ${'98.54321'}
    ${'NumberField rounds'} | ${'98.543216'} | ${'98.54322'}
  `('$Name can have specified fraction digits', ({value, result}) => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, formatOptions: {maximumFractionDigits: 5}});
    act(() => {textField.focus();});
    typeText(textField, value);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', result);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats percents', () => {
    let {textField, incrementButton} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 0.1, formatOptions: {style: 'percent'}});

    expect(textField).toHaveAttribute('value', '10%');
    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '25');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '25%');
    expect(onChangeSpy).toHaveBeenLastCalledWith(0.25);
    act(() => {textField.focus();});
    triggerPress(incrementButton);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '26%');
    expect(onChangeSpy).toHaveBeenLastCalledWith(0.26);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats percent for 2.11', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, formatOptions: {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}});

    act(() => {textField.focus();});
    typeText(textField, '2.11');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '2.11%');
    expect(onChangeSpy).toHaveBeenCalledWith(0.0211);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats percents as a unit', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, value: 10, formatOptions: {style: 'unit', unit: 'percent', signDisplay: 'always'}});

    expect(textField).toHaveAttribute('value', '+10%');
    textField.setSelectionRange(2, 3);
    typeText(textField, '{backspace}');
    expect(textField).toHaveAttribute('value', '+1%');
    expect(onChangeSpy).not.toHaveBeenCalled();
    textField.setSelectionRange(2, 3);
    typeText(textField, '5%');
    expect(textField).toHaveAttribute('value', '+15%');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(15);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats value', () => {
    let {textField} = renderNumberField({showStepper: true, value: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats value when value changes', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '€11.00');
    triggerPress(decrementButton);
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '€9.00');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats value when formatter changes', () => {
    let {textField, rerender} = renderNumberField({defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    rerender({defaultValue: 10, formatOptions: {style: 'currency', currency: 'USD'}});
    expect(textField).toHaveAttribute('value', '$10.00');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name keeps formatting on focus', () => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats currencySign accounting', () => {
    let {textField, incrementButton} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: -10, formatOptions: {style: 'currency', currency: 'USD', currencySign: 'accounting'}});

    expect(textField).toHaveAttribute('value', '($10.00)');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '($9.00)');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(-9);

    act(() => {textField.focus();});
    textField.setSelectionRange(2, 3);
    typeText(textField, '{backspace}');
    textField.setSelectionRange(2, 2);
    typeText(textField, '1');
    textField.setSelectionRange(3, 3);
    typeText(textField, '8');
    expect(textField).toHaveAttribute('value', '($18.00)');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '($18.00)');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(-18);

    act(() => {textField.focus();});
    textField.setSelectionRange(7, 8);
    typeText(textField, '{backspace}');
    expect(textField).toHaveAttribute('value', '($18.00');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '$18.00');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(18);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '($32)');
    expect(textField).toHaveAttribute('value', '($32)');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '($32.00)');
    expect(onChangeSpy).toHaveBeenCalledTimes(4);
    expect(onChangeSpy).toHaveBeenLastCalledWith(-32);
  });

  it.each`
    Name              | props                                                    | locale     | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${'€10.00'}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${'١٠٫٠٠ €'}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${'10,00 €'}
    ${'US JPY'}       | ${{formatOptions: {style: 'currency', currency: 'JPY'}}} | ${'en-US'} | ${'¥10'}
  `('$Name keeps formatted value on focus', ({props, locale, expected}) => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, ...props}, locale);

    expect(textField).toHaveAttribute('value', expected);
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', expected);
    act(() => {textField.blur();});
  });

  // must use js-escapes for negative currency arabic, otherwise jest won't recognize the result as being equal
  it.each`
    Name                       | props                                                                       | locale     | expected
    ${'US Euros'}              | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'en-US'} | ${['€10.00', '€11.00', '€9.00']}
    ${'French Euros'}          | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'fr-FR'} | ${['10,00 €', '11,00 €', '9,00 €']}
    ${'Arabic Euros'}          | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'ar-AE'} | ${['١٠٫٠٠ €', '١١٫٠٠ €', '٩٫٠٠ €']}
    ${'US Euros negative'}     | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['-€10.00', '-€9.00', '-€11.00']}
    ${'French Euros negative'} | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['-10,00 €', '-9,00 €', '-11,00 €']}
    ${'Arabic Euros negative'} | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['\u061C-\u0661\u0660\u066B\u0660\u0660\xA0\u20AC', '\u061C-\u0669\u066B\u0660\u0660\xA0\u20AC', '\u061C-\u0661\u0661\u066B\u0660\u0660\xA0\u20AC']}
  `('$Name pressing increment & decrement keeps formatting', ({props, locale, expected}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField({showStepper: true, minValue: -15, ...props}, locale);

    expect(textField).toHaveAttribute('value', expected[0]);
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', expected[1]);
    triggerPress(decrementButton);
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', expected[2]);
  });

  it.each`
    Name              | props                                                    | locale     | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['€10.00', '€11.00', '€9.00', '€9.00']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['10,00 €', '11,00 €', '9,00 €', '9,00 €']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['١٠٫٠٠ €', '١١٫٠٠ €', '٩٫٠٠ €', '٩٫٠٠ €']}
  `('$Name pressing up arrow & down arrow keeps focus state formatting', ({props, locale, expected}) => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, ...props}, locale);

    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', expected[0]);
    fireEvent.keyDown(textField, {key: 'ArrowUp'});
    fireEvent.keyUp(textField, {key: 'ArrowUp'});
    expect(textField).toHaveAttribute('value', expected[1]);
    fireEvent.keyDown(textField, {key: 'ArrowDown'});
    fireEvent.keyUp(textField, {key: 'ArrowDown'});
    fireEvent.keyDown(textField, {key: 'ArrowDown'});
    fireEvent.keyUp(textField, {key: 'ArrowDown'});
    expect(textField).toHaveAttribute('value', expected[2]);
    act(() => {textField.blur();});
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[3]);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name sets invalid input value to valid number value on blur', () => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10});

    expect(textField).toHaveAttribute('value', '10');
    typeText(textField, '-');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.blur();});
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name sets invalid input value to valid step on blur', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 10, step: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    typeText(textField, '5');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '100');
    expect(onChangeSpy).toHaveBeenCalledWith(100);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);

    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '16');
    expect(textField).toHaveAttribute('value', '16');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '20');
    expect(textField).toHaveAttribute('value', '20');
    expect(onChangeSpy).toHaveBeenLastCalledWith(20);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it.each`
    Name
    ${'NumberField'}
  `('goes to valid max on `end`', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    fireEvent.keyDown(textField, {key: 'End'});
    fireEvent.keyUp(textField, {key: 'End'});
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '9,007,199,254,740,991');
    expect(onChangeSpy).toHaveBeenCalledWith(9007199254740991);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('goes to valid step max on `end`', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 10, step: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    fireEvent.keyDown(textField, {key: 'End'});
    fireEvent.keyUp(textField, {key: 'End'});
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '9,007,199,254,740,990');
    expect(onChangeSpy).toHaveBeenCalledWith(9007199254740990);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('goes to valid min on `home`', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    fireEvent.keyDown(textField, {key: 'Home'});
    fireEvent.keyUp(textField, {key: 'Home'});
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '-9,007,199,254,740,991');
    expect(onChangeSpy).toHaveBeenCalledWith(-9007199254740991);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('goes to valid step min on `home`', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, showStepper: true, defaultValue: 10, step: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    fireEvent.keyDown(textField, {key: 'Home'});
    fireEvent.keyUp(textField, {key: 'Home'});
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '-9,007,199,254,740,990');
    expect(onChangeSpy).toHaveBeenCalledWith(-9007199254740990);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name              | props                                                    | locale     | keystrokes              | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['4', '2', '.', '1']} | ${['4', '42', '42.', '42.1', '€42.10']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['4', '2', ',', '1']} | ${['4', '42', '42,', '42,1', '42,10 €']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['٤', '٢', ',', '١']} | ${['٤', '٤٢', '٤٢٫', '٤٢٫١', '٤٢٫١٠ €']}
  `('$Name typing in locale stays consistent', ({props, locale, keystrokes, expected}) => {
    let {textField} = renderNumberField({showStepper: true, onChange: onChangeSpy, ...props}, locale);

    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '');
    typeText(textField, keystrokes[0]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[0]);
    typeText(textField, keystrokes[1]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[1]);
    typeText(textField, keystrokes[2]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[2]);
    typeText(textField, keystrokes[3]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[3]);
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(42.1);
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[4]);
  });

  it.each`
    Name              | props | locale     | keystrokes                   | expected
    ${'US Euros'}     | ${{}} | ${'en-US'} | ${['1', ',', '0', '0', '0']} | ${['1', '1,', '1,0', '1,00', '1,000']}
    ${'French Euros'} | ${{}} | ${'fr-FR'} | ${['1', '.', '0', '0', '0']} | ${['1', '1.', '1.0', '1.00', '1.000']}
    ${'Arabic Euros'} | ${{}} | ${'ar-AE'} | ${['١', '.', '0', '0', '0']} | ${['١', '١٬', '١٬٠', '١٬٠٠', '١٬٠٠٠']}
  `('$Name typing group characters works', ({props, locale, keystrokes, expected}) => {
    let {textField} = renderNumberField({showStepper: true, onChange: onChangeSpy, ...props}, locale);

    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '');
    typeText(textField, keystrokes[0]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[0]);
    typeText(textField, keystrokes[1]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[1]);
    typeText(textField, keystrokes[2]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[2]);
    typeText(textField, keystrokes[3]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[3]);
    typeText(textField, keystrokes[4]);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textField).toHaveAttribute('value', expected[4]);
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(1000);
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[5]);
  });

  it.each`
    Name              | props                                                                      | locale
    ${'US Euros'}     | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'SAR'}}} | ${'en-US'}
  `('$Name typing in locale stays consistent', ({props, locale}) => {
    let {textField} = renderNumberField({showStepper: true, onChange: onChangeSpy, ...props}, locale);
    expect(textField).toHaveAttribute('value', 'SAR 10.00');

    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', 'SAR 10.00');
    typeText(textField, '@!');
    expect(textField).toHaveAttribute('value', 'SAR 10.00');
    act(() => {textField.blur();});
  });

  it('advances automatically if the arrows are held down', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({showStepper: true, defaultValue: 10, onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.mouseDown(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(11);
    act(() => {jest.advanceTimersByTime(399);});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    act(() => {jest.advanceTimersByTime(1);});
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(12);
    act(() => {jest.advanceTimersByTime(60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenCalledWith(13);
    act(() => {jest.advanceTimersByTime(3 * 60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(6);
    expect(onChangeSpy).toHaveBeenNthCalledWith(4, 14);
    expect(onChangeSpy).toHaveBeenNthCalledWith(5, 15);
    expect(onChangeSpy).toHaveBeenNthCalledWith(6, 16);
    fireEvent.mouseUp(incrementButton);
    onChangeSpy.mockReset();

    fireEvent.mouseDown(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(15);
    act(() => {jest.advanceTimersByTime(399);});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    act(() => {jest.advanceTimersByTime(1);});
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(14);
    act(() => {jest.advanceTimersByTime(60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenCalledWith(13);
    act(() => {jest.advanceTimersByTime(3 * 60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(6);
    expect(onChangeSpy).toHaveBeenNthCalledWith(4, 12);
    expect(onChangeSpy).toHaveBeenNthCalledWith(5, 11);
    expect(onChangeSpy).toHaveBeenNthCalledWith(6, 10);
    fireEvent.mouseUp(decrementButton);
  });

  it('advances automatically to the limit and not beyond', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({showStepper: true, defaultValue: 10, minValue: 0, maxValue: 20, onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.mouseDown(incrementButton);
    // to get to 20, it'll take 11 (0ms), 12 (400ms), 13 (60ms) ... 20 (540ms) 22 (660ms)
    // we should never get to 21 or 22 though, but lets advance the time there to make sure
    act(() => {jest.advanceTimersByTime(400 + (10 * 60));});
    expect(onChangeSpy).toHaveBeenCalledTimes(10);
    expect(onChangeSpy).toHaveBeenLastCalledWith(20);
    fireEvent.mouseUp(incrementButton);

    onChangeSpy.mockReset();

    fireEvent.mouseDown(decrementButton);
    act(() => {jest.advanceTimersByTime(400 + (20 * 60));});
    expect(onChangeSpy).toHaveBeenCalledTimes(20);
    expect(onChangeSpy).toHaveBeenLastCalledWith(0);
    fireEvent.mouseUp(decrementButton);
  });

  it('advances increment starting from undefined', () => {
    let {textField, incrementButton} = renderNumberField({showStepper: true, onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.mouseDown(incrementButton);
    // it should start at 0
    act(() => {jest.advanceTimersByTime(400 + 60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(3);
    fireEvent.mouseUp(incrementButton);
  });

  it('advances decrement starting from undefined', () => {
    let {textField, decrementButton} = renderNumberField({showStepper: true, onChange: onChangeSpy});

    act(() => {textField.focus();});
    fireEvent.mouseDown(decrementButton);
    // it should start at 0
    act(() => {jest.advanceTimersByTime(400 + 60);});
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenLastCalledWith(-3);
    fireEvent.mouseUp(decrementButton);
  });

  it.each`
    Name
    ${'v3 NumberField'}
  `('$Name handles input change with custom decimal step number', () => {
    let {textField, incrementButton} = renderNumberField({onChange: onChangeSpy, step: 0.001});

    act(() => {textField.focus();});
    typeText(textField, '1');
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.001);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.002);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.003);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.004);
    act(() => {textField.blur();});
  });

  // not sure why this one won't work, it looked like select() was added to jsdom 5 years ago
  it.skip.each`
    Name
    ${'v3 NumberField'}
  `('$Name selects input text on focus', () => {
    let {textField} = renderNumberField({defaultValue: 100});
    // start with 100 in the input
    expect(textField).toHaveAttribute('value', '100');
    // after we focus, we should have all 0f '100' selected, we can prove this by typing something into the input
    // if it wasn't all selected, then we'd still see some of the old value, instead we want to only see the new value
    act(() => {textField.focus();});
    typeText(textField, '3');
    expect(textField).toHaveAttribute('value', '3');
    act(() => {textField.blur();});
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name isReadOnly cannot be stepped', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({defaultValue: 100, isReadOnly: true});
    expect(textField).toHaveAttribute('value', '100');
    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeDisabled();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name has proper aria attributes', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField({
      defaultValue: 100,
      minValue: 0,
      maxValue: 100,
      isReadOnly: true,
      isDisabled: true,
      isRequired: true,
      id: 'test-numberfield-id',
      formatOptions: {style: 'currency', currency: 'EUR'}
    });

    expect(textField).toHaveAttribute('aria-valuenow', '100');
    expect(textField).toHaveAttribute('aria-valuetext', '€100.00');
    expect(textField).toHaveAttribute('aria-valuemin', '0');
    expect(textField).toHaveAttribute('aria-valuemax', '100');
    expect(textField).toHaveAttribute('aria-readonly', 'true');
    expect(textField).toHaveAttribute('aria-required', 'true');
    expect(textField).toHaveAttribute('aria-disabled', 'true');
    expect(textField).toHaveAttribute('role', 'spinbutton');

    // TODO: check aria-controls
    expect(incrementButton).toHaveAttribute('aria-label', 'Increment');
    expect(decrementButton).toHaveAttribute('aria-label', 'Decrement');
  });

  it.each`
    Name                          | props
    ${'NumberField uncontrolled'} | ${{defaultValue: 0}}
    ${'NumberField controlled'}   | ${{value: 0}}
  `('$Name 0 is rendered', ({props}) => {
    let {textField} = renderNumberField(props);
    expect(textField).toHaveAttribute('value', '0');
  });

  it.each`
    Name                          | props
    ${'NumberField controlled'}   | ${{value: 10, onChange: onChangeSpy}}
  `('$Name 10 is rendered and will not change the value in the input for steppers', ({props}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(props);
    expect(textField).toHaveAttribute('value', '10');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '10');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(11);
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '10');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(9);
  });

  it.each`
    Name                          | props
    ${'NumberField controlled'}   | ${{value: 10, onChange: onChangeSpy}}
  `('$Name 10 is rendered and will not change the value in the input for typed text', ({props}) => {
    let {textField} = renderNumberField(props);
    expect(textField).toHaveAttribute('value', '10');
    act(() => {textField.focus();});
    typeText(textField, '123');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '10');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(10123);
  });

  it.each`
    Name
    ${'NumberField controlled'}
  `('$Name 10 is rendered and will change if the controlled version is implemented', () => {
    function NumberFieldControlled(props) {
      let {onChange} = props;
      let [value, setValue] = useState(10);
      return <NumberField {...props} label="you shall not change" formatOptions={{style: 'currency', currency: 'EUR'}} value={value} onChange={chain(setValue, onChange)} />;
    }
    let {container} = render(<NumberFieldControlled onChange={onChangeSpy} />);
    container = within(container).queryByRole('group');
    let textField = container.firstChild;
    let buttons = within(container).queryAllByRole('button');
    let incrementButton = buttons[0];
    let decrementButton = buttons[1];
    textField = textField.firstChild;
    expect(textField).toHaveAttribute('value', '€10.00');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '€11.00');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(11);
    triggerPress(decrementButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(10);
    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name             | props
    ${'NumberField'} | ${{validationState: 'invalid'}}
  `('$Name can be invalid', ({props}) => {
    let {container} = renderNumberField(props);
    expect(container).toHaveAttribute('aria-invalid', 'true');
  });

  it.each`
    Name             | props
    ${'NumberField'} | ${{label: 'this is the stepper that never ends'}}
  `('$Name supports labels', ({props}) => {
    let {getByLabelText, getByRole} = render(<Provider theme={theme} locale="en-US"><NumberField {...props} /></Provider>);
    let spinButton = getByRole('spinbutton');
    expect(getByLabelText(props.label)).toBe(spinButton);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name will re-enable the steppers if the value causing it to be disabled is deleted', () => {
    let {textField, decrementButton, incrementButton} = renderNumberField({onChange: onChangeSpy, defaultValue: 1, maxValue: 1});
    expect(textField).toHaveAttribute('value', '1');
    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeEnabled();

    act(() => {textField.focus();});
    userEvent.clear(textField);
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '');
    expect(onChangeSpy).toHaveBeenCalledWith(NaN);
    expect(incrementButton).toBeEnabled();
    expect(decrementButton).toBeEnabled();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name can type in a numeral system that is not the default for the locale', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});
    expect(textField).toHaveAttribute('value', '');

    act(() => {textField.focus();});
    typeText(textField, '٤٢');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '٤٢');
    expect(onChangeSpy).toHaveBeenCalledWith(42);
    onChangeSpy.mockReset();

    act(() => {textField.focus();});
    typeText(textField, '1');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '٤٢');
    expect(onChangeSpy).not.toHaveBeenCalled();
    onChangeSpy.mockReset();

    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '56');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '56');
    expect(onChangeSpy).toHaveBeenCalledWith(56);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name can type in a numeral system that is not the default for arab system', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});
    expect(textField).toHaveAttribute('value', '');

    act(() => {textField.focus();});
    typeText(textField, '21');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '21');
    expect(onChangeSpy).toHaveBeenCalledWith(21);
    onChangeSpy.mockReset();

    act(() => {textField.focus();});
    typeText(textField, '٤');
    expect(textField).toHaveAttribute('value', '21');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '21');
    expect(onChangeSpy).not.toHaveBeenCalled();
    onChangeSpy.mockReset();

    act(() => {textField.focus();});
    userEvent.clear(textField);
    typeText(textField, '٤٢');
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '٤٢');
    expect(onChangeSpy).toHaveBeenCalledWith(42);
  });
});
