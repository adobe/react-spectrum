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
import NumberInput from '@react/react-spectrum/NumberInput';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

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

  function renderNumberField(Component, props = {}, locale = 'en-US') {
    let {container, debug} = render(<Provider theme={theme} locale={locale}><Component aria-label="labelled" {...props} /></Provider>);

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
      decrementButton,
      debug
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
    expect(textField).toHaveAttribute('type', 'text');
    expect(incrementButton).toBeTruthy();
    expect(decrementButton).toBeTruthy();
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    act(() => {userEvent.type(textField, '5');});
    expect(onChangeSpy).toHaveBeenCalledWith(5);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name handles input change with custom step number', ({Component}) => {
    let {textField, incrementButton} = renderNumberField(Component, {onChange: onChangeSpy, step: 5});

    act(() => {userEvent.type(textField, '2');});
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

    act(() => {userEvent.type(textField, '-1');});
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

    act(() => {userEvent.type(textField, '1');});
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

    act(() => {fireEvent.focus(textField);});
    act(() => {fireEvent.wheel(textField, {deltaY: 10});});
    expect(onChangeSpy).toHaveBeenCalledWith(-1);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
    ${'v2 NumberField'} | ${NumberInput}
  `('$Name increment value when scrolling upwards', ({Component}) => {
    let {textField} = renderNumberField(Component, {onChange: onChangeSpy});

    act(() => {fireEvent.focus(textField);});
    act(() => {fireEvent.wheel(textField, {deltaY: -10});});
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
    act(() => {fireEvent.focus(textField);});
    act(() => {fireEvent.wheel(textField, {deltaY: -10});});
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
    act(() => {fireEvent.focus(textField);});
    act(() => {fireEvent.wheel(textField, {deltaY: 10});});
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

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name properly formats value', ({Component}) => {
    let {textField} = renderNumberField(Component, {showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name properly formats value when value changes', ({Component}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(Component, {showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', '€11.00');
    triggerPress(decrementButton);
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', '€9.00');
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name changes value to unformatted value on focus', ({Component}) => {
    let {textField} = renderNumberField(Component, {showStepper: true, defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}});

    expect(textField).toHaveAttribute('value', '€10.00');
    act(() => {fireEvent.focus(textField);});
    expect(textField).toHaveAttribute('value', '10');
  });

  it.each`
    Name              | props                                                    | locale     | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['€10.00', '10']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['١٠٫٠٠ €', '١٠']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['10,00 €', '10']}
  `('$Name changes value to unformatted value on focus', ({props, locale, expected}) => {
    let {textField} = renderNumberField(NumberField, {showStepper: true, defaultValue: 10, ...props}, locale);

    expect(textField).toHaveAttribute('value', expected[0]);
    fireEvent.focus(textField);
    expect(textField).toHaveAttribute('value', expected[1]);
    fireEvent.blur(textField);
  });

  // must use js-escapes for negative currency arabic, otherwise jest won't recognize the result as being equal
  it.each`
    Name                       | props                                                                       | locale     | expected
    ${'US Euros'}              | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'en-US'} | ${['€10.00', '€11.00', '€9.00']}
    ${'French Euros'}          | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'fr-FR'} | ${['10,00 €', '11,00 €', '9,00 €']}
    ${'Arabic Euros'}          | ${{defaultValue: 10, formatOptions: {style: 'currency', currency: 'EUR'}}}  | ${'ar-AE'} | ${['١٠٫٠٠ €', '١١٫٠٠ €', '٩٫٠٠ €']}
    ${'US Euros negative'}     | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['-€10.00', '-€9.00', '-€11.00']}
    ${'French Euros negative'} | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['-10,00 €', '-9,00 €', '-11,00 €']}
    ${'Arabic Euros negative'} | ${{defaultValue: -10, formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['\u061C-\u0661\u0660\u066B\u0660\u0660\xA0\u20AC', '\u061C-\u0669\u066B\u0660\u0660\xA0\u20AC', '\u061C-\u0661\u0661\u066B\u0660\u0660\xA0\u20AC']}
  `('$Name pressing increment & decrement keeps formatting', ({props, locale, expected}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(NumberField, {showStepper: true, minValue: -15, ...props}, locale);

    expect(textField).toHaveAttribute('value', expected[0]);
    triggerPress(incrementButton);
    expect(textField).toHaveAttribute('value', expected[1]);
    triggerPress(decrementButton);
    triggerPress(decrementButton);
    expect(textField).toHaveAttribute('value', expected[2]);
  });

  it.each`
    Name              | props                                                    | locale     | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['10', '11', '9', '€9.00']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['10', '11', '9', '9,00 €']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['١٠', '١١', '٩', '٩٫٠٠ €']}
  `('$Name pressing up arrow & down arrow keeps focus state formatting', ({props, locale, expected}) => {
    let {textField} = renderNumberField(NumberField, {showStepper: true, defaultValue: 10, ...props}, locale);

    fireEvent.focus(textField);
    expect(textField).toHaveAttribute('value', expected[0]);
    fireEvent.keyDown(textField, {key: 'ArrowUp'});
    fireEvent.keyUp(textField, {key: 'ArrowUp'});
    expect(textField).toHaveAttribute('value', expected[1]);
    fireEvent.keyDown(textField, {key: 'ArrowDown'});
    fireEvent.keyUp(textField, {key: 'ArrowDown'});
    fireEvent.keyDown(textField, {key: 'ArrowDown'});
    fireEvent.keyUp(textField, {key: 'ArrowDown'});
    expect(textField).toHaveAttribute('value', expected[2]);
    fireEvent.blur(textField);
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[3]);
  });

  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name sets invalid input value to valid number value on blur', ({Component}) => {
    let {textField} = renderNumberField(Component, {showStepper: true, defaultValue: 10});

    expect(textField).toHaveAttribute('value', '10');
    act(() => {userEvent.type(textField, '-');});
    fireEvent.blur(textField);
    expect(textField).toHaveAttribute('value', '10');
    fireEvent.focus(textField);
    expect(textField).toHaveAttribute('value', '10');
    fireEvent.blur(textField);
  });

  it.each`
    Name              | props                                                    | locale     | keystrokes    | expected
    ${'US Euros'}     | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'en-US'} | ${['4', '2']} | ${['4', '42', '€42.00']}
    ${'French Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'fr-FR'} | ${['4', '2']} | ${['4', '42', '42,00 €']}
    ${'Arabic Euros'} | ${{formatOptions: {style: 'currency', currency: 'EUR'}}} | ${'ar-AE'} | ${['٤', '٢']} | ${['٤', '٤٢', '٤٢٫٠٠ €']}
  `('$Name typing in locale stays consistent', ({props, locale, keystrokes, expected}) => {
    let {textField} = renderNumberField(NumberField, {showStepper: true, onChange: onChangeSpy, ...props}, locale);

    fireEvent.focus(textField);
    expect(textField).toHaveAttribute('value', '');
    act(() => {
      userEvent.type(textField, keystrokes[0]);
    });
    expect(onChangeSpy).toHaveBeenCalledWith(4);
    expect(textField).toHaveAttribute('value', expected[0]);
    act(() => {
      userEvent.type(textField, keystrokes[1]);
    });
    expect(onChangeSpy).toHaveBeenCalledWith(42);
    expect(textField).toHaveAttribute('value', expected[1]);
    fireEvent.blur(textField);
    // after blur, we should go to the formatted version
    expect(textField).toHaveAttribute('value', expected[2]);
  });

  it('advances automatically if the arrows are held down', () => {
    let {textField, incrementButton, decrementButton} = renderNumberField(NumberField, {showStepper: true, defaultValue: 10, onChange: onChangeSpy});

    fireEvent.focus(textField);
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
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name handles input change with custom decimal step number', ({Component}) => {
    let {textField, incrementButton} = renderNumberField(Component, {onChange: onChangeSpy, step: 0.001});

    fireEvent.focus(textField);
    act(() => {userEvent.type(textField, '1');});
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.001);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.002);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.003);
    triggerPress(incrementButton);
    expect(onChangeSpy).toHaveBeenCalledWith(1.004);
    fireEvent.blur(textField);
  });
  
  // not sure why this one won't work, it looked like select() was added to jsdom 5 years ago
  it.skip.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name selects input text on focus', ({Component}) => {
    let {textField} = renderNumberField(Component, {defaultValue: 100});
    // start with 100 in the input
    expect(textField).toHaveAttribute('value', '100');
    // after we focus, we should have all 0f '100' selected, we can prove this by typing something into the input
    // if it wasn't all selected, then we'd still see some of the old value, instead we want to only see the new value
    fireEvent.focus(textField);
    act(() => {userEvent.type(textField, '3');});
    expect(textField).toHaveAttribute('value', '3');
    fireEvent.blur(textField);
  });
  
  it.each`
    Name                | Component
    ${'v3 NumberField'} | ${NumberField}
  `('$Name isReadOnly cannot be stepped', ({Component}) => {
    let {textField, incrementButton, decrementButton} = renderNumberField(Component, {defaultValue: 100, isReadOnly: true});
    expect(textField).toHaveAttribute('value', '100');
    expect(incrementButton).toBeDisabled();
    expect(decrementButton).toBeDisabled();
  });
});
