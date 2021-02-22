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

import {act, fireEvent, render} from '@testing-library/react';
import {chain} from '@react-aria/utils';
import {ColorField} from '../';
import {parseColor} from '@react-stately/color';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import {theme} from '@react-spectrum/theme-default';
import {typeText} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <ColorField
        label="Primary Color"
        {...props} />
    </Provider>
  );
}

describe('ColorField', function () {
  it('should handle defaults', function () {
    let {
      getByLabelText,
      getByRole,
      getByText
    } = renderComponent({});
    let colorField = getByLabelText('Primary Color');
    let label = getByText('Primary Color');
    expect(colorField).toBeInTheDocument();
    expect(getByRole('textbox')).toBe(colorField);
    expect(colorField).toHaveAttribute('type', 'text');
    expect(colorField).toHaveAttribute('autocomplete', 'off');
    expect(colorField).toHaveAttribute('autocorrect', 'off');
    expect(colorField).not.toHaveAttribute('readonly');
    expect(colorField).not.toBeInvalid();
    expect(colorField).not.toBeDisabled();
    expect(colorField).not.toBeRequired();
    expect(label).toHaveAttribute('for', colorField.id);
    expect(colorField).toHaveAttribute('aria-labelledby', label.id);
  });

  it('should handle aria-label prop', function () {
    let {getByLabelText} = renderComponent({
      'aria-label': 'Custom label',
      label: undefined
    });
    let colorField = getByLabelText('Custom label');
    expect(colorField).toBeInTheDocument();
    expect(colorField).not.toHaveAttribute('aria-labelledby');
  });

  it('should allow placeholder', function () {
    let {getByPlaceholderText, getByRole} = renderComponent({placeholder: 'Enter a color'});
    expect(getByRole('textbox')).toBe(getByPlaceholderText('Enter a color'));
  });

  it('should show valid validation state', function () {
    let {getByLabelText} = renderComponent({validationState: 'valid'});
    let colorField = getByLabelText('Primary Color');
    expect(colorField).not.toBeInvalid();
  });

  it('should show invalid validation state', function () {
    let {getByLabelText} = renderComponent({validationState: 'invalid'});
    let colorField = getByLabelText('Primary Color');
    expect(colorField).toBeInvalid();
  });

  it('should be disabled', function () {
    let {getByLabelText} = renderComponent({isDisabled: true});
    let colorField = getByLabelText('Primary Color');
    expect(colorField).toBeDisabled();
  });

  it('should be readonly', function () {
    let {getByLabelText} = renderComponent({isReadOnly: true});
    let colorField = getByLabelText('Primary Color');
    expect(colorField).toHaveAttribute('readonly');
  });

  it('should be required', function () {
    let {getByLabelText} = renderComponent({isRequired: true});
    let colorField = getByLabelText(/Primary Color/);
    expect(colorField).toBeRequired();
  });

  it('should be empty when invalid value is provided', function () {
    let {getByLabelText} = renderComponent({defaultValue: '#fffffffff'});
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('');

    // call commit to re-verify that a colorValue is not set in state
    act(() => {colorField.focus();});
    act(() => {colorField.blur();});
    expect(colorField.value).toBe('');
  });

  it.each`
    Name                                 | props
    ${'3-length hex string'}             | ${{defaultValue: '#abc'}}
    ${'6-length hex string'}             | ${{defaultValue: '#aabbcc'}}
    ${'Color object'}                    | ${{defaultValue: parseColor('#abc')}}
    ${'3-length hex string controlled'}  | ${{value: '#abc'}}
    ${'6-length hex string controlled'}  | ${{value: '#aabbcc'}}
    ${'Color object controlled'}         | ${{value: parseColor('#abc')}}
  `('should accept $Name as value', function ({props}) {
    let {getByLabelText} = renderComponent(props);
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AABBCC');
  });

  it('should handle uncontrolled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({defaultValue: '#abc', onChange: onChangeSpy});

    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AABBCC');

    act(() => {
      colorField.focus();
      userEvent.clear(colorField);
    });
    // should call onChange when input is cleared
    expect(colorField.value).toBe('');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    typeText(colorField, 'cba');
    expect(colorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));

    typeText(colorField, 'cba');
    expect(colorField.value).toBe('cbacba');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cbacba'));

    act(() => {colorField.blur();});
    expect(colorField.value).toBe('#CBACBA');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
  });

  it('should not update value in controlled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({value: '#abc', onChange: onChangeSpy});

    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AABBCC');

    act(() => {
      colorField.focus();
      userEvent.clear(colorField);
    });
    // should call onChange when input is cleared
    expect(colorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    act(() => {
      colorField.focus();
      userEvent.type(colorField, '{selectall}');
    });
    typeText(colorField, 'cba');
    expect(colorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));
    expect(onChangeSpy).toHaveBeenCalledTimes(2);

    act(() => {colorField.blur();});
    expect(colorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should update value in controlled state', function () {
    function ColorFieldControlled(props) {
      let {onChange} = props;
      let [color, setColor] = useState(props.value);
      return (
        <ColorField
          {...props}
          label="Primary Color"
          value={color}
          onChange={chain(setColor, onChange)} />
      );
    }
    let onChangeSpy = jest.fn();
    let {getByLabelText} = render(<ColorFieldControlled value={parseColor('#abc')} onChange={onChangeSpy} />);

    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AABBCC');

    act(() => {
      colorField.focus();
      userEvent.clear(colorField);
    });
    // should call onChange when input is cleared
    expect(colorField.value).toBe('');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    typeText(colorField, 'cba');
    expect(colorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));

    act(() => {colorField.blur();});
    expect(colorField.value).toBe('#CCBBAA');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should disallow invalid characters and revert back to last valid value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({onChange: onChangeSpy});
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('');

    act(() => {colorField.focus();});
    typeText(colorField, 'abc');
    expect(colorField.value).toBe('abc');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#abc'));

    typeText(colorField, 'xyz8b');
    expect(colorField.value).toBe('abc8b');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);

    act(() => {colorField.blur();});
    expect(colorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should not trigger onChange when input changes to text of same color value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({onChange: onChangeSpy});
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('');

    typeText(colorField, 'fff');
    expect(colorField.value).toBe('fff');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#fff'));

    typeText(colorField, 'fff');
    expect(colorField.value).toBe('ffffff');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                                | expected                 | key
    ${'increment with arrow up key'}    | ${parseColor('#AAAAAE')}  | ${'ArrowUp'}
    ${'decrement with arrow down key'}  | ${parseColor('#AAAAA6')}  | ${'ArrowDown'}
  `('should handle $Name event', function ({expected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({
      defaultValue: '#aaa',
      onChange: onChangeSpy,
      step: 4
    });
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AAAAAA');

    fireEvent.keyDown(colorField, {key});
    fireEvent.keyUp(colorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(colorField.value).toBe(expected.toString('hex'));
  });

  it.each`
    Name                                | expected                 | deltaY
    ${'increment with mouse wheel'}     | ${parseColor('#AAAAAE')}  | ${-10}
    ${'decrement with mouse wheel'}     | ${parseColor('#AAAAA6')}  | ${10}
  `('should handle $Name event', function ({expected, deltaY}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({
      defaultValue: '#aaa',
      onChange: onChangeSpy,
      step: 4
    });
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe('#AAAAAA');

    fireEvent.wheel(colorField, {deltaY});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(colorField.value).toBe(expected.toString('hex'));
  });

  it.each`
    Name                                 | props                                   | initExpected  | key
    ${'not increment beyond max value'}  | ${{defaultValue: '#fffffc', step: 16}}  | ${'#FFFFFC'}  | ${'ArrowUp'}
    ${'increment to max value'}          | ${{defaultValue: '#aabbcc'}}            | ${'#AABBCC'}  | ${'End'}
  `('should $Name', function ({props, initExpected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe(initExpected);

    let maxColor = parseColor('#FFFFFF');
    fireEvent.keyDown(colorField, {key});
    fireEvent.keyUp(colorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(maxColor);
    expect(colorField.value).toBe(maxColor.toString('hex'));

    // repeat action to make sure onChange is not called when already at max
    fireEvent.keyDown(colorField, {key});
    fireEvent.keyUp(colorField, {key});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                                 | props                                   | initExpected  | key
    ${'not decrement beyond min value'}  | ${{defaultValue: '#00000c', step: 16}}  | ${'#00000C'}  | ${'ArrowDown'}
    ${'decrement to min value'}          | ${{defaultValue: '#aabbcc'}}            | ${'#AABBCC'}  | ${'Home'}
  `('should $Name', function ({props, initExpected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let colorField = getByLabelText('Primary Color');
    expect(colorField.value).toBe(initExpected);

    let minColor = parseColor('#000000');
    fireEvent.keyDown(colorField, {key});
    fireEvent.keyUp(colorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(minColor);
    expect(colorField.value).toBe(minColor.toString('hex'));

    // repeat action to make sure onChange is not called when already at min
    fireEvent.keyDown(colorField, {key});
    fireEvent.keyUp(colorField, {key});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });
});
