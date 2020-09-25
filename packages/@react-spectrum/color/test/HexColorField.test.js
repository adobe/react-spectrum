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
import {Color} from '@react-stately/color';
import {HexColorField} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {typeText} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <HexColorField
        label="Primary Color"
        {...props} />
    </Provider>
  );
}

describe('HexColorField', function () {
  it('should handle defaults', function () {
    let {
      getByLabelText, 
      getByRole,
      getByText
    } = renderComponent({});
    let hexColorField = getByLabelText('Primary Color');
    let label = getByText('Primary Color');
    expect(hexColorField).toBeInTheDocument();
    expect(getByRole('spinbutton')).toBe(hexColorField);
    expect(hexColorField).toHaveAttribute('type', 'text');
    expect(hexColorField).toHaveAttribute('autocomplete', 'off');
    expect(hexColorField).not.toHaveAttribute('readonly');
    expect(hexColorField).not.toBeInvalid();
    expect(hexColorField).not.toBeDisabled();
    expect(hexColorField).not.toBeRequired();
    expect(label).toHaveAttribute('for', hexColorField.id);
    expect(hexColorField).toHaveAttribute('aria-labelledby', label.id);
  });

  it('should handle aria-label prop', function () {
    let {getByLabelText} = renderComponent({
      'aria-label': 'Custom label',
      label: undefined
    });
    let hexColorField = getByLabelText('Custom label');
    expect(hexColorField).toBeInTheDocument();
    expect(hexColorField).not.toHaveAttribute('aria-labelledby');
  });

  it('should allow placeholder', function () {
    let {getByPlaceholderText, getByRole} = renderComponent({placeholder: 'Enter a color'});
    expect(getByRole('spinbutton')).toBe(getByPlaceholderText('Enter a color'));
  });

  it('should show valid validation state', function () {
    let {getByLabelText} = renderComponent({validationState: 'valid'});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField).not.toBeInvalid();
  });

  it('should show invalid validation state', function () {
    let {getByLabelText} = renderComponent({validationState: 'invalid'});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField).toBeInvalid();
  });

  it('should be disabled', function () {
    let {getByLabelText} = renderComponent({isDisabled: true});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField).toBeDisabled();
  });

  it('should be readonly', function () {
    let {getByLabelText} = renderComponent({isReadOnly: true});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField).toHaveAttribute('readonly');
  });

  it('should be required', function () {
    let {getByLabelText} = renderComponent({isRequired: true});
    let hexColorField = getByLabelText(/Primary Color/);
    expect(hexColorField).toBeRequired();
  });

  it('should be empty when invalid value is provided', function () {
    let {getByLabelText} = renderComponent({defaultValue: true});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('');

    act(() => {hexColorField.focus();});
    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('');
  });

  it.each`
    Name                                 | props
    ${'3-length hex string'}             | ${{defaultValue: '#abc'}}
    ${'6-length hex string'}             | ${{defaultValue: '#aabbcc'}}
    ${'Color object'}                    | ${{defaultValue: new Color('#abc')}}
    ${'3-length hex string controlled'}  | ${{value: '#abc'}}
    ${'6-length hex string controlled'}  | ${{value: '#aabbcc'}}
    ${'Color object controlled'}         | ${{value: new Color('#abc')}}
  `('should accept $Name as value', function ({props}) {
    let {getByLabelText} = renderComponent(props);
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');
  });

  it.each`
    Name                   | props
    ${'custom min value'}  | ${{defaultValue: '#aaa', minValue: '#bbb'}}
    ${'custom max value'}  | ${{defaultValue: '#ccc', maxValue: '#bbb'}}
  `('should clamp initial value provided to $Name', function ({props}) {
    let {getByLabelText} = renderComponent(props);
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#BBBBBB');
  });

  it('should handle uncontrolled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({defaultValue: '#abc', onChange: onChangeSpy});

    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {hexColorField.focus();});
    userEvent.clear(hexColorField);
    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(new Color('#cba'));

    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cbacba');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(new Color('#cbacba'));

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#CBACBA');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle controlled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({value: '#abc', onChange: onChangeSpy});

    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {hexColorField.focus();});
    userEvent.clear(hexColorField);
    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(new Color('#cba'));

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should disallow invalid characters revert back to last valid value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({defaultValue: '#abc', onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {hexColorField.focus();});
    userEvent.clear(hexColorField);
    typeText(hexColorField, 'xyz#8b');
    expect(hexColorField.value).toBe('#8b');
    expect(onChangeSpy).not.toHaveBeenCalled();

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not trigger onChange when input changes to text of same color value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('');

    typeText(hexColorField, 'fff');
    expect(hexColorField.value).toBe('fff');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(new Color('#fff'));

    typeText(hexColorField, 'fff');
    expect(hexColorField.value).toBe('ffffff');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                                | expected                 | key
    ${'increment with arrow up key'}    | ${new Color('#AAAAAE')}  | ${'ArrowUp'}
    ${'increment with page up key'}     | ${new Color('#AAAAAE')}  | ${'PageUp'}
    ${'decrement with arrow down key'}  | ${new Color('#AAAAA6')}  | ${'ArrowDown'}
    ${'decrement with page down key'}   | ${new Color('#AAAAA6')}  | ${'PageDown'}
  `('should handle $Name event', function ({expected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({
      value: '#aaa',
      onChange: onChangeSpy,
      step: 4
    });
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AAAAAA');

    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(hexColorField.value).toBe(expected.toString('hex'));
  });

  it.each`
    Name                                | expected                 | deltaY
    ${'increment with mouse wheel'}     | ${new Color('#AAAAAE')}  | ${-10}
    ${'decrement with mouse wheel'}     | ${new Color('#AAAAA6')}  | ${10}
  `('should handle $Name event', function ({expected, deltaY}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({
      value: '#aaa',
      onChange: onChangeSpy,
      step: 4
    });
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AAAAAA');

    fireEvent.wheel(hexColorField, {deltaY});
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(hexColorField.value).toBe(expected.toString('hex'));
  });

  it.each`
    Name                                 | props                                                    | initExpected  | key
    ${'not increment beyond max value'}  | ${{defaultValue: '#bbbbba', maxValue: '#bbb', step: 4}}  | ${'#BBBBBA'}  | ${'ArrowUp'}
    ${'not decrement beyond min value'}  | ${{defaultValue: '#bbbbbc', minValue: '#bbb', step: 4}}  | ${'#BBBBBC'}  | ${'ArrowDown'}
    ${'increment to max value'}          | ${{defaultValue: '#aaa', maxValue: '#bbb'}}              | ${'#AAAAAA'}  | ${'End'}
    ${'decrement to min value'}          | ${{defaultValue: '#ccc', minValue: '#bbb'}}              | ${'#CCCCCC'}  | ${'Home'}
  `('should $Name', function ({props, initExpected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe(initExpected);

    let newColor = new Color('#BBBBBB');
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(hexColorField.value).toBe(newColor.toString('hex'));

    // repeat action to make sure onChange is not called when already at min/max
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name            | props                                        | initExpected  | newValue
    ${'max value'}  | ${{defaultValue: '#aaa', maxValue: '#bbb'}}  | ${'#AAAAAA'}  | ${'fff'}
    ${'min value'}  | ${{defaultValue: '#ccc', minValue: '#bbb'}}  | ${'#CCCCCC'}  | ${'000'}
  `('should clamp value to $Name on change', function ({props, initExpected, newValue}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe(initExpected);

    let newColor = new Color('#BBBBBB');
    act(() => {hexColorField.focus();});
    userEvent.clear(hexColorField);
    typeText(hexColorField, newValue);
    expect(hexColorField.value).toBe(newValue);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe(newColor.toString('hex'));
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });
});
