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
import {useSliderState} from '../';

describe('useSliderState', () => {
  let numberFormatter = new Intl.NumberFormat('en-US', {});
  it('should allow setting and reading values, percentages, and labels', () => {
    let formatOptions = {
      style: 'currency',
      currency: 'USD'
    };
    let numberFormatter = new Intl.NumberFormat('en-US', formatOptions);
    let result = renderHook(() => useSliderState({
      defaultValue: [50],
      minValue: 10,
      maxValue: 200,
      step: 10,
      numberFormatter
    })).result;

    expect(result.current.getThumbValue(0)).toBe(50);
    expect(result.current.getThumbPercent(0)).toBe(40 / 190);
    expect(result.current.getValuePercent(50)).toBe(40 / 190);
    expect(result.current.getThumbValueLabel(0)).toBe('$50.00');

    act(() => result.current.setThumbValue(0, 100));
    expect(result.current.getThumbValue(0)).toBe(100);
    expect(result.current.getThumbPercent(0)).toBe(90 / 190);
    expect(result.current.getThumbValueLabel(0)).toBe('$100.00');

    act(() => result.current.setThumbValue(0, 500));
    expect(result.current.getThumbValue(0)).toBe(200);
    expect(result.current.getThumbPercent(0)).toBe(1);
    expect(result.current.getThumbValueLabel(0)).toBe('$200.00');

    act(() => result.current.setThumbValue(0, 0));
    expect(result.current.getThumbValue(0)).toBe(10);
    expect(result.current.getThumbPercent(0)).toBe(0);
    expect(result.current.getThumbValueLabel(0)).toBe('$10.00');

    act(() => result.current.setThumbValue(0, 7));
    expect(result.current.getThumbValue(0)).toBe(10);
    expect(result.current.getThumbPercent(0)).toBe(0);
    expect(result.current.getThumbValueLabel(0)).toBe('$10.00');

    act(() => result.current.setThumbPercent(0, 0.13));
    expect(result.current.getThumbValue(0)).toBe(30);
    expect(result.current.getThumbPercent(0)).toBe(20 / 190);
  });

  it('should enforce maxValue and minValue for multiple thumbs', () => {
    let result = renderHook(() => useSliderState({
      defaultValue: [50, 70, 90],
      minValue: 10,
      maxValue: 200,
      numberFormatter
    })).result;

    expect(result.current.values).toEqual([50, 70, 90]);

    expect(result.current.getThumbMinValue(0)).toBe(10);
    expect(result.current.getThumbMaxValue(0)).toBe(70);

    expect(result.current.getThumbMinValue(1)).toBe(50);
    expect(result.current.getThumbMaxValue(1)).toBe(90);

    expect(result.current.getThumbMinValue(2)).toBe(70);
    expect(result.current.getThumbMaxValue(2)).toBe(200);

    act(() => result.current.setThumbValue(1, 80));
    expect(result.current.values).toEqual([50, 80, 90]);
    expect(result.current.getThumbMinValue(2)).toBe(80);

    act(() => result.current.setThumbValue(1, 100));
    expect(result.current.values).toEqual([50, 90, 90]);
    expect(result.current.getThumbMinValue(2)).toBe(90);
  });

  it('should round values to nearest step with two thumbs', () => {
    let result = renderHook(() => useSliderState({
      minValue: 1,
      maxValue: 15,
      step: 2.5,
      defaultValue: [1, 13],
      numberFormatter
    })).result;

    expect(result.current.values).toEqual([1, 13.5]);
    expect(result.current.getThumbMinValue(1)).toBe(1);

    act(() => result.current.setThumbValue(0, 3));
    expect(result.current.values).toEqual([3.5, 13.5]);
    expect(result.current.getThumbMinValue(1)).toBe(3.5);
    expect(result.current.getThumbMaxValue(0)).toBe(13.5);

    act(() => result.current.setThumbValue(1, 5));
    expect(result.current.values).toEqual([3.5, 6]);
    expect(result.current.getThumbMaxValue(0)).toBe(6);
  });

  it('should round values to nearest step with three thumbs', () => {
    let result = renderHook(() => useSliderState({
      minValue: 1,
      maxValue: 15,
      step: 2.5,
      defaultValue: [1, 6, 13],
      numberFormatter
    })).result;

    expect(result.current.values).toEqual([1, 6, 13.5]);
    expect(result.current.getThumbMinValue(1)).toBe(1);
    expect(result.current.getThumbMinValue(2)).toBe(6);

    act(() => result.current.setThumbValue(0, 3));
    expect(result.current.values).toEqual([3.5, 6, 13.5]);
    expect(result.current.getThumbMinValue(2)).toBe(6);
    expect(result.current.getThumbMinValue(1)).toBe(3.5);
    expect(result.current.getThumbMaxValue(0)).toBe(6);
    expect(result.current.getThumbMaxValue(1)).toBe(13.5);

    act(() => result.current.setThumbValue(2, 5));
    expect(result.current.values).toEqual([3.5, 6, 6]);
    expect(result.current.getThumbMaxValue(0)).toBe(6);
    expect(result.current.getThumbMaxValue(1)).toBe(6);
  });

  it('should call onChange and onChangeEnd appropriately', () => {
    let onChangeEndSpy = jest.fn();
    let onChangeSpy = jest.fn();
    let result = renderHook(() => useSliderState({
      onChangeEnd: onChangeEndSpy,
      onChange: onChangeSpy,
      numberFormatter
    })).result;

    expect(result.current.values).toEqual([0]);
    act(() => result.current.setThumbDragging(0, true));
    act(() => result.current.setThumbValue(0, 50));
    act(() => result.current.setThumbDragging(0, false));
    expect(onChangeSpy).toHaveBeenLastCalledWith([50]);
    expect(onChangeEndSpy).toHaveBeenLastCalledWith([50]);

    onChangeEndSpy.mockClear();

    act(() => result.current.setThumbDragging(0, true));
    expect(result.current.isThumbDragging(0)).toBe(true);
    act(() => result.current.setThumbValue(0, 55));
    expect(onChangeSpy).toHaveBeenLastCalledWith([55]);
    expect(onChangeEndSpy).not.toHaveBeenCalled();
    act(() => result.current.setThumbValue(0, 60));
    expect(onChangeSpy).toHaveBeenLastCalledWith([60]);
    expect(onChangeEndSpy).not.toHaveBeenCalled();
    act(() => result.current.setThumbValue(0, 65));
    act(() => result.current.setThumbDragging(0, false));
    expect(onChangeSpy).toHaveBeenLastCalledWith([65]);
    expect(onChangeEndSpy).toHaveBeenLastCalledWith([65]);
  });

  it('should not call onChange and onChangeEnd if not being moved', () => {
    let onChangeEndSpy = jest.fn();
    let onChangeSpy = jest.fn();
    let result = renderHook(() => useSliderState({
      onChangeEnd: onChangeEndSpy,
      onChange: onChangeSpy,
      numberFormatter
    })).result;

    expect(result.current.values).toEqual([0]);
    act(() => result.current.setThumbValue(0, 0));
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(onChangeEndSpy).not.toHaveBeenCalled();
  });
});
