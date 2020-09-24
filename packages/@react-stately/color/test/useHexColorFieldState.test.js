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

import {act, renderHook} from '@testing-library/react-hooks';
import {Color} from '../src/Color';
import {useHexColorFieldState} from '../';

describe('useHexColorFieldState tests', function () {
  it('should have empty color value state if no initial value is provided', function () {
    let {result} = renderHook(() => useHexColorFieldState({}));
    expect(result.current.colorValue).toBeUndefined();
    expect(result.current.inputValue).toBe('');
  });

  it('should have empty color value if invalid initial value is provided', function () {
    let props = {defaultValue: 'invalidColor', minValue: '#abc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue).toBeUndefined();
    expect(result.current.inputValue).toBe('');
  });

  it('should accept 6-length hex string', function () {
    let props = {defaultValue: '#aabbcc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should accept 3-length hex string', function () {
    let props = {defaultValue: '#abc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should accept Color object as value', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should clamp if value provided is more than maxValue', function () {
    let props = {defaultValue: new Color('#999'), maxValue: new Color('#666')};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(102);
    expect(result.current.colorValue.getChannelValue('green')).toBe(102);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(102);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#666666');
  });

  it('should clamp if value provided is less than minValue', function () {
    let props = {defaultValue: new Color('#333'), minValue: new Color('#666')};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(102);
    expect(result.current.colorValue.getChannelValue('green')).toBe(102);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(102);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#666666');
  });

  it('should increment', function () {
    let props = {defaultValue: new Color('#012')};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.increment());
    expect(result.current.colorValue.getChannelValue('red')).toBe(0);
    expect(result.current.colorValue.getChannelValue('green')).toBe(17);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(35);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#001123');
  });

  it('should not increment beyond the maximum value', function () {
    let props = {defaultValue: '#abc', maxValue: '#abc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.increment());
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should increment to max value', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.incrementToMax());
    expect(result.current.colorValue.getChannelValue('red')).toBe(255);
    expect(result.current.colorValue.getChannelValue('green')).toBe(255);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(255);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#FFFFFF');
  });

  it('should decrement', function () {
    let props = {defaultValue: new Color('#012'), step: 4};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrement());
    expect(result.current.colorValue.getChannelValue('red')).toBe(0);
    expect(result.current.colorValue.getChannelValue('green')).toBe(17);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(30);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#00111E');
  });

  it('should not decrement beyond the minimum value', function () {
    let props = {defaultValue: '#abc', minValue: '#abc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrement());
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should decrement to min value', function () {
    let props = {defaultValue: new Color('#aabbcc'), minValue: '#666'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrementToMin());
    expect(result.current.colorValue.getChannelValue('red')).toBe(102);
    expect(result.current.colorValue.getChannelValue('green')).toBe(102);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(102);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#666666');
  });

  it('should revert to last valid input value', function () {
    let props = {defaultValue: '#abc', minValue: '#abc'};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);

    act(() => result.current.setInputValue('invalidColor'));
    expect(result.current.inputValue).toBe('invalidColor');

    act(() => result.current.commitInputValue());
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should update colorValue (uncontrolled)', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', minValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    let newColor = new Color('#cba');
    act(() => result.current.setInputValue('#cba'));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(204);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(170);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#cba');
  });

  it('should not update colorValue (controlled)', function () {
    let onChangeSpy = jest.fn();
    let props = {value: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    let newColor = new Color('#cba');
    act(() => result.current.setInputValue('#cba'));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#cba');
  });

  it('should not update colorValue for empty input', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    act(() => result.current.setInputValue(''));
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('');
  });

  it('should not update colorValue for invalid input', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AABBCC');

    act(() => result.current.setInputValue('invalidColor'));
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('invalidColor');
  });

  it('should clamp to minimum value', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#CCC', minValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(204);
    expect(result.current.colorValue.getChannelValue('green')).toBe(204);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(204);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#CCCCCC');

    let newColor = new Color('#BBB');
    act(() => result.current.setInputValue('#AAA'));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AAA');
  });

  it('should clamp to maximum value', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#AAA', maxValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(170);
    expect(result.current.colorValue.getChannelValue('green')).toBe(170);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(170);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#AAAAAA');

    let newColor = new Color('#BBB');
    act(() => result.current.setInputValue('#CCC'));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#CCC');
  });

  it('should not call onChange on increment when value is already at max', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#BBB', maxValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#BBBBBB');

    act(() => result.current.increment());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not call onChange on decrement when value is already at min', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#BBB', minValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#BBBBBB');

    act(() => result.current.decrement());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not call onChange on incrementToMax when value is already at max', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#BBB', maxValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#BBBBBB');

    act(() => result.current.incrementToMax());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('should not call onChange on decrementToMin when value is already at min', function () {
    let onChangeSpy = jest.fn();
    let props = {defaultValue: '#BBB', minValue: '#BBB', onChange: onChangeSpy};
    let {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.getChannelValue('red')).toBe(187);
    expect(result.current.colorValue.getChannelValue('green')).toBe(187);
    expect(result.current.colorValue.getChannelValue('blue')).toBe(187);
    expect(result.current.colorValue.getChannelValue('alpha')).toBe(1);
    expect(result.current.inputValue).toBe('#BBBBBB');

    act(() => result.current.decrementToMin());
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
