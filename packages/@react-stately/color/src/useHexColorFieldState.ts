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

import {Color} from './Color';
import {ColorInput, HexColorFieldProps} from '@react-types/color';
import {NumberFieldState} from '@react-stately/numberfield';
import {useCallback, useState} from 'react';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';

export interface HexColorFieldState extends Omit<NumberFieldState, 'value' | 'setValue'> {
  colorValue: Color,
  setInputValue: (value: string) => void
}

export const defaultMinValue = new Color('#000000');
export const defaultMaxValue = new Color('#FFFFFF');
const minValueRange = [new Color('#000000'), new Color('#FFFFFE')];
const maxValueRange = [new Color('#000001'), new Color('#FFFFFF')];

export function useHexColorFieldState(
  props: HexColorFieldProps
): HexColorFieldState {
  let {
    minValue = defaultMinValue,
    maxValue = defaultMaxValue,
    step = 1,
    value,
    defaultValue,
    onChange,
    validationState
  } = props;

  let clampColor = (value: ColorInput, min: Color, max: Color) => {
    try {
      let color = typeof value === 'string' ? new Color(value) : value;
      let colorInt = color.toHexInt();
      if (colorInt < min.toHexInt()) { return min; }
      if (colorInt > max.toHexInt()) { return max; }
      return color;
    } catch (err) {
      return undefined;
    }
  };

  let {color: minColor, colorInt: minColorInt} = useColor(clampColor(minValue, minValueRange[0], minValueRange[1]));
  let {color: maxColor, colorInt: maxColorInt} = useColor(clampColor(maxValue, maxValueRange[0], maxValueRange[1]));

  let initialValue = clampColor(value, minColor, maxColor);
  let initialDefaultValue = clampColor(defaultValue, minColor, maxColor);
  let [colorValue, setColorValue] = useControlledState<Color>(initialValue, initialDefaultValue, onChange);

  let initialInputValue = (value || defaultValue) && colorValue ? colorValue.toString('hex') : '';
  let [inputValue, setInputValue] = useState(initialInputValue);

  let increment = useCallback(() => {
    setColorValue((prevColor: Color) => {
      let prevColorInt = prevColor ? prevColor.toHexInt() : minColorInt;
      let newColor = prevColor;
      if (prevColorInt < maxColorInt) {
        let newValue = `#${Math.min(prevColorInt + step, maxColorInt).toString(16).padStart(6, '0')}`;
        newColor = new Color(newValue);
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  }, [minColorInt, maxColorInt]);

  let incrementToMax = useCallback(() => {
    setColorValue((prevColor: Color) => {
      let newColor = maxColor;
      if (prevColor && prevColor.toHexInt() === maxColorInt) {
        newColor = prevColor;
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  }, [maxColor, maxColorInt, minColorInt, setColorValue, setInputValue]);

  let decrement = useCallback(() => {
    setColorValue((prevColor: Color) => {
      let newColor = prevColor ? prevColor : minColor;
      if (prevColor) {
        let prevColorInt = prevColor.toHexInt();
        if (prevColorInt > minColorInt) {
          let newValue = `#${Math.max(prevColorInt - step, minColorInt).toString(16).padStart(6, '0')}`;
          newColor = new Color(newValue);
        }
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  }, [minColor, minColorInt]);

  let decrementToMin = useCallback(() => {
    setColorValue((prevColor: Color) => {
      let newColor = minColor;
      if (prevColor && prevColor.toHexInt() === minColorInt) {
        newColor = prevColor;
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  }, [minColor, minColorInt, setColorValue, setInputValue]);

  let setFieldInputValue = (value: string) => {
    value = value.replace(/[^#0-9a-f]/ig, '');
    setInputValue(value);
    if (!value.length) { return; }
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }
    try {
      let newColor = clampColor(value, minColor, maxColor);
      if (newColor) {
        setColorValue((prevColor: Color) => {
          let prevColorInt = prevColor ? prevColor.toHexInt() : minColorInt;
          return prevColorInt === newColor.toHexInt() ? prevColor : newColor;
        });
      }
    } catch (err) {
      // ignore
    }
  };

  let commitInputValue = () => {
    setFieldInputValue(colorValue ? colorValue.toString('hex') : '');
  };

  return {
    colorValue,
    inputValue,
    setInputValue: setFieldInputValue,
    commitInputValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    validationState
  };
}
