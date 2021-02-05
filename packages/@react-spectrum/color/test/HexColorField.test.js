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
import {HexColorField} from '../';
import {parseColor} from '@react-stately/color';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
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
    expect(getByRole('textbox')).toBe(hexColorField);
    expect(hexColorField).toHaveAttribute('type', 'text');
    expect(hexColorField).toHaveAttribute('autocomplete', 'off');
    expect(hexColorField).toHaveAttribute('autocorrect', 'off');
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
    expect(getByRole('textbox')).toBe(getByPlaceholderText('Enter a color'));
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
    let {getByLabelText} = renderComponent({defaultValue: '#fffffffff'});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('');

    // call commit to re-verify that a colorValue is not set in state
    act(() => {hexColorField.focus();});
    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('');
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
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');
  });

  it('should handle uncontrolled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({defaultValue: '#abc', onChange: onChangeSpy});

    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {
      hexColorField.focus();
      userEvent.clear(hexColorField);
    });
    // should call onChange when input is cleared
    expect(hexColorField.value).toBe('');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));

    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cbacba');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cbacba'));

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#CBACBA');
    expect(onChangeSpy).toHaveBeenCalledTimes(3);
  });

  it('should not update value in controlled state', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({value: '#abc', onChange: onChangeSpy});

    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {
      hexColorField.focus();
      userEvent.clear(hexColorField);
    });
    // should call onChange when input is cleared
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    act(() => {
      hexColorField.focus();
      userEvent.type(hexColorField, '{selectall}');
    });
    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));
    expect(onChangeSpy).toHaveBeenCalledTimes(2);

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should update value in controlled state', function () {
    function HexColorFieldControlled(props) {
      let {onChange} = props;
      let [color, setColor] = useState(props.value);
      return (
        <HexColorField
          {...props}
          label="Primary Color"
          value={color}
          onChange={chain(setColor, onChange)} />
      );
    }
    let onChangeSpy = jest.fn();
    let {getByLabelText} = render(<HexColorFieldControlled value={parseColor('#abc')} onChange={onChangeSpy} />);

    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AABBCC');

    act(() => {
      hexColorField.focus();
      userEvent.clear(hexColorField);
    });
    // should call onChange when input is cleared
    expect(hexColorField.value).toBe('');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(null);

    typeText(hexColorField, 'cba');
    expect(hexColorField.value).toBe('cba');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#cba'));

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#CCBBAA');
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should disallow invalid characters and revert back to last valid value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('');

    act(() => {hexColorField.focus();});
    typeText(hexColorField, 'abc');
    expect(hexColorField.value).toBe('abc');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#abc'));

    typeText(hexColorField, 'xyz8b');
    expect(hexColorField.value).toBe('abc8b');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);

    act(() => {hexColorField.blur();});
    expect(hexColorField.value).toBe('#AABBCC');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('should not trigger onChange when input changes to text of same color value', function () {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('');

    typeText(hexColorField, 'fff');
    expect(hexColorField.value).toBe('fff');
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(parseColor('#fff'));

    typeText(hexColorField, 'fff');
    expect(hexColorField.value).toBe('ffffff');
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
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AAAAAA');

    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(hexColorField.value).toBe(expected.toString('hex'));
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
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe('#AAAAAA');

    fireEvent.wheel(hexColorField, {deltaY});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(expected);
    expect(hexColorField.value).toBe(expected.toString('hex'));
  });

  it.each`
    Name                                 | props                                   | initExpected  | key
    ${'not increment beyond max value'}  | ${{defaultValue: '#fffffc', step: 16}}  | ${'#FFFFFC'}  | ${'ArrowUp'}
    ${'increment to max value'}          | ${{defaultValue: '#aabbcc'}}            | ${'#AABBCC'}  | ${'End'}
  `('should $Name', function ({props, initExpected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe(initExpected);

    let maxColor = parseColor('#FFFFFF');
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(maxColor);
    expect(hexColorField.value).toBe(maxColor.toString('hex'));

    // repeat action to make sure onChange is not called when already at max
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                                 | props                                   | initExpected  | key
    ${'not decrement beyond min value'}  | ${{defaultValue: '#00000c', step: 16}}  | ${'#00000C'}  | ${'ArrowDown'}
    ${'decrement to min value'}          | ${{defaultValue: '#aabbcc'}}            | ${'#AABBCC'}  | ${'Home'}
  `('should $Name', function ({props, initExpected, key}) {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = renderComponent({...props, onChange: onChangeSpy});
    let hexColorField = getByLabelText('Primary Color');
    expect(hexColorField.value).toBe(initExpected);

    let minColor = parseColor('#000000');
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledWith(minColor);
    expect(hexColorField.value).toBe(minColor.toString('hex'));

    // repeat action to make sure onChange is not called when already at min
    fireEvent.keyDown(hexColorField, {key});
    fireEvent.keyUp(hexColorField, {key});
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });
});
