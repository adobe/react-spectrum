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
  it('should be at minimum if no value is provided', function () {
    let props = {minValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should accept 6-length hex string', function () {
    let props = {defaultValue: '#aabbcc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.validationState).toBe(null);
  });

  it('should accept 3-length hex string', function () {
    let props = {defaultValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.validationState).toBe(null);
  });

  it('should accept Color value', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.validationState).toBe(null);
  });

  it('should be in invalid state', function () {
    let props = {defaultValue: 'invalidColor'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue).toBeUndefined();
    expect(result.current.inputValue).toBe('');
    expect(result.current.validationState).toBe('invalid');
  });

  it('should increment', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.increment());
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 205,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCD');
    expect(result.current.validationState).toBe(null);
  });

  it('should not increment beyond the maximum value', function () {
    let props = {defaultValue: '#abc', maxValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.increment());
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should increment to max value', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.incrementToMax());
    expect(result.current.colorValue.value).toEqual({
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#FFFFFF');
  });

  it('should decrement', function () {
    let props = {defaultValue: new Color('#aabbcc'), step: 4};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrement());
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 200,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBC8');
    expect(result.current.validationState).toBe(null);
  });

  it('should not decrement beyond the minimum value', function () {
    let props = {defaultValue: '#abc', minValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrement());
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should decrement to min value', function () {
    let props = {defaultValue: new Color('#aabbcc'), minValue: '#666'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrementToMin());
    expect(result.current.colorValue.value).toEqual({
      red: 102,
      green: 102,
      blue: 102,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#666666');
  });

  it('should revert to last valid value', function () {
    let props = {defaultValue: '#abc', minValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    act(() => result.current.decrement());
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
  });

  it('should update colorValue (uncontrolled)', function () {
    const onChangeSpy = jest.fn();
    let props = {defaultValue: '#abc', minValue: '#abc', onChange: onChangeSpy};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');

    const newColor = new Color('#cba');
    act(() => result.current.setColorValue(newColor));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.value).toEqual({
      red: 204,
      green: 187,
      blue: 170,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#CCBBAA');
  });

  it('should not update colorValue (controlled)', function () {
    const onChangeSpy = jest.fn();
    let props = {value: '#abc', onChange: onChangeSpy};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');

    const newColor = new Color('#cba');
    act(() => result.current.setColorValue(newColor));
    expect(onChangeSpy).toHaveBeenCalledWith(newColor);
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    // expect(result.current.inputValue).toBe('#CCBBAA');
    expect(result.current.validationState).toBe(null);
  });
});
