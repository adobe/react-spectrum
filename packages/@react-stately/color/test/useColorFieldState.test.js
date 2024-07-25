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

import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
import {parseColor} from '../src/Color';
import {useColorFieldState} from '..';

describe('useColorFieldState tests', function () {
  it.each`
    Name                        | props
    ${'no initial value'}       | ${{}}
    ${'invalid initial value'}  | ${{defaultValue: 'invalidColor'}}
  `('should be in empty state if $Name is provided', function ({props}) {
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue).toBeUndefined();
    expect(result.current.inputValue).toBe('');
  });

  it.each`
    Name                                   | props
    ${'6-length hex string'}               | ${{defaultValue: '#aabbcc'}}
    ${'3-length hex string'}               | ${{defaultValue: '#abc'}}
    ${'Color object'}                      | ${{defaultValue: parseColor('#aabbcc')}}
    ${'6-length hex string (controlled)'}  | ${{value: '#aabbcc'}}
    ${'3-length hex string (controlled)'}  | ${{value: '#abc'}}
    ${'Color object (controlled)'}         | ${{value: parseColor('#aabbcc')}}
  `('should accept $Name as value', function ({props}) {
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it.each`
    name                                 | action               | props
    ${'not increment beyond max value'}  | ${'increment'}       | ${{defaultValue: '#ffffff'}}
    ${'increment to max value'}          | ${'incrementToMax'}  | ${{defaultValue: '#aabbcc'}}
  `('should $action $name', function ({action, props}) {
    let {result} = renderHook(() => useColorFieldState(props));
    act(() => result.current[action]());
    expect(result.current.colorValue.getChannelValue('red')).toBe(255);
    expect(result.current.colorValue.getChannelValue('green')).toBe(255);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(255);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#FFFFFF');
  });

  it.each`
    name                                 | action               | props
    ${'not decrement beyond min value'}  | ${'decrement'}       | ${{defaultValue: '#000000'}}
    ${'decrement to min value'}          | ${'decrementToMin'}  | ${{defaultValue: '#aabbcc'}}
  `('should $action $name', function ({action, props}) {
    let {result} = renderHook(() => useColorFieldState(props));
    act(() => result.current[action]());
    expect(result.current.colorValue.getChannelValue('red')).toBe(0);
    expect(result.current.colorValue.getChannelValue('green')).toBe(0);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(0);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#000000');
  });

  it('should revert to last valid input value', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', minValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);

    act(() => result.current.setInputValue('ab'));
    expect(result.current.inputValue).toBe('ab');

    act(() => result.current.commit());
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not accept invalid characters', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', minValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);

    act(() => result.current.setInputValue('invalidColor'));

    act(() => result.current.commit());
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should update colorValue (uncontrolled)', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    let newColor = parseColor('#cba');
    act(() => result.current.setInputValue('#cba'));

    act(() => result.current.commit());
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(204);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(170);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#CCBBAA');
  });

  it('should not update colorValue (controlled)', function () {
    let onChangeSpy = jest.fn();
    let props = {value: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    let newColor = parseColor('#cba');
    act(() => result.current.setInputValue('#cba'));

    act(() => result.current.commit());
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should call onChange when input is cleared', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    act(() => result.current.setInputValue(''));

    act(() => result.current.commit());
    expect(onChangeSpy).toHaveBeenCalledWith(null);
    expect(result.current.colorValue).toBeNull();
    expect(result.current.inputValue).toBe('');
  });

  it.each`
    action
    ${'increment'}
    ${'incrementToMax'}
  `('should not call onChange on $action when value is already at max', function ({action}) {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#FFF', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(255);
    expect(result.current.colorValue.getChannelValue('green')).toBe(255);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(255);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#FFFFFF');

    act(() => result.current[action]());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it.each`
    action
    ${'decrement'}
    ${'decrementToMin'}
  `('should not call onChange on $action when value is already at min', function ({action}) {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#000', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(0);
    expect(result.current.colorValue.getChannelValue('green')).toBe(0);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(0);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#000000');

    act(() => result.current[action]());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not call onChange when new value has the same color value', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#BBB', minValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#BBBBBB');

    act(() => result.current.setInputValue('#BBBBBB'));
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
