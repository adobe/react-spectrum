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
import {NumberField} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import {typeText} from '@react-spectrum/test-utils';

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
    let {container, debug} = render(<Provider theme={theme} locale={locale}><NumberField aria-label="labelled" {...props} /></Provider>);

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
      debug
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
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
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
  `('$Name handles input change with custom step number', () => {
    let {textField, incrementButton} = renderNumberField({onChange: onChangeSpy, step: 5});

    act(() => {textField.focus();});
    typeText(textField, '2');
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(2);
    onChangeSpy.mockReset();
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(7);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name clamps to closest min if smaller than the min', () => {
    let {
      container,
      textField
    } = renderNumberField({onChange: onChangeSpy, minValue: 0});

    expect(container).not.toHaveAttribute('aria-invalid');

    act(() => {textField.focus();});
    typeText(textField, '-1');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(0);
    expect(textField).toHaveAttribute('value', '0');

    expect(container).not.toHaveAttribute('aria-invalid');
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name clamps to closest max if larger than the max', () => {
    let {
      container,
      textField
    } = renderNumberField({onChange: onChangeSpy, maxValue: 1, defaultValue: 0});

    expect(container).not.toHaveAttribute('aria-invalid');

    // TODO: should the numberfield emit any onChange until blur or arrows?
    act(() => {textField.focus();});
    typeText(textField, '2');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(onChangeSpy).toHaveBeenCalledWith(1);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(textField).toHaveAttribute('value', '1');

    expect(container).not.toHaveAttribute('aria-invalid');
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
  `('$Name decrement value when scrolling downwards', () => {

    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    act(() => {fireEvent.wheel(textField, {deltaY: 10});});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name increment value when scrolling upwards', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy});

    act(() => {textField.focus();});
    act(() => {fireEvent.wheel(textField, {deltaY: -10});});
    expect(onChangeSpy).toHaveBeenCalledWith(1);
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
  `('$Name properly will return the same number from onChange as is displayed', () => {
    let {textField} = renderNumberField({onChange: onChangeSpy, defaultValue: 10, formatOptions: {maximumFractionDigits: 2}});

    expect(textField).toHaveAttribute('value', '10');
    typeText(textField, '.01');
    expect(textField).toHaveAttribute('value', '10.01');
    expect(onChangeSpy).toHaveBeenLastCalledWith(10.01);
    onChangeSpy.mockReset();

    typeText(textField, '45');
    expect(textField).toHaveAttribute('value', '10.0145');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => {textField.blur();});
    expect(textField).toHaveAttribute('value', '10.01');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it.each`
    Name
    ${'NumberField'}
  `('$Name properly formats defaultValue', () => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
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
  `('$Name keeps formatting on focus', () => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name              | props                                                    | locale     | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['€10.00', '€10.00']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['١٠٫٠٠ €', '١٠٫٠٠ €']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['10,00 €', '10,00 €']}
  `('$Name keeps formatted value on focus', ({props, locale, expected}) => {
    let {textField} = renderNumberField({showStepper: true, defaultValue: 10, ...props}, locale);

    expect(textField).toHaveAttribute('value', expected[0]);
    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', expected[1]);
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
  `('$Name sets invalid input value to valid number value on blur', ({Component}) => {
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
    Name              | props                                                    | locale     | keystrokes    | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['4', '2']} | ${['4', '42', '€42.00']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['4', '2']} | ${['4', '42', '42,00 €']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['٤', '٢']} | ${['٤', '٤٢', '٤٢٫٠٠ €']}
  `('$Name typing in locale stays consistent', ({props, locale, keystrokes, expected}) => {
    let {textField} = renderNumberField({showStepper: true, onChange: onChangeSpy, ...props}, locale);

    act(() => {textField.focus();});
    expect(textField).toHaveAttribute('value', '');
    typeText(textField, keystrokes[0]);
    expect(onChangeSpy).toHaveBeenCalledWith(4);
    expect(textField).toHaveAttribute('value', expected[0]);
    typeText(textField, keystrokes[1]);
    expect(onChangeSpy).toHaveBeenCalledWith(42);
    expect(textField).toHaveAttribute('value', expected[1]);
    act(() => {textField.blur();});
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[2]);
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
});
