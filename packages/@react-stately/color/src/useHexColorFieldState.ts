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
import {useControlledState} from '@react-stately/utils';

export interface HexColorFieldState extends Omit<NumberFieldState, 'value' | 'setValue'> {
  colorValue: Color,
  setInputValue: (value: string) => void
}

export const defaultMinValue = '#000000';
export const defaultMaxValue = '#FFFFFF';

export function useHexColorFieldState(
  props: HexColorFieldProps
): HexColorFieldState {
  const {
    minValue = defaultMinValue,
    maxValue = defaultMaxValue,
    step = 1,
    value,
    defaultValue,
    onChange,
    validationState
  } = props;

  const minColor = Color.parse(minValue);
  const maxColor = Color.parse(maxValue);
  const minColorInt = minColor.toHexInt();
  const maxColorInt = maxColor.toHexInt();

  const clampColor = useCallback((value: ColorInput) => {
    try {
      const color = Color.parse(value);
      const colorInt = color.toHexInt();
      if (colorInt < minColorInt) { return minColor; }
      if (colorInt > maxColorInt) { return maxColor; }
      return color;
    } catch (err) {
      return undefined;
    }
  }, [minColorInt, maxColorInt]);

  const initialValue = clampColor(value);
  const initialDefaultValue = clampColor(defaultValue);
  const [colorValue, setColorValue] = useControlledState<Color>(initialValue, initialDefaultValue, onChange);

  const initialInputValue = (value || defaultValue) && colorValue ? colorValue.toString('hex') : '';
  const [inputValue, setInputValue] = useState(initialInputValue);

  const increment = () => {
    setColorValue((previousValue: Color) => {
      const colorInt = previousValue ? previousValue.toHexInt() : minColorInt;
      const newValue = `#${Math.min(colorInt + step, maxColorInt).toString(16).padStart(6, '0')}`;
      const newColor = new Color(newValue);
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  };

  const incrementToMax = useCallback(() => {
    if (maxValue) {
      setColorValue(maxColor);
      setInputValue(maxColor.toString('hex'));
    }
  }, [maxValue, maxColor, setColorValue, setInputValue]);

  const decrement = () => {
    setColorValue((previousValue: Color) => {
      if (!previousValue) { return minColor; }
      const colorInt = previousValue.toHexInt();
      const newValue = `#${Math.max(colorInt - step, minColorInt).toString(16).padStart(6, '0')}`;
      const newColor = new Color(newValue);
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  };

  const decrementToMin = useCallback(() => {
    if (minValue) {
      setColorValue(minColor);
      setInputValue(minColor.toString('hex'));
    }
  }, [minValue, minColor, setColorValue, setInputValue]);

  const setFieldInputValue = (value: string) => {
    setInputValue(value);
    value = value.trim();
    if (!value.length) { return; }
    if (!value.startsWith('#')) {
      value = `#${value}`;
    }
    try {
      const color = clampColor(value);
      if (color) {
        setColorValue(color);
      }
    } catch (err) {
      // ignore
    }
  };

  const commitInputValue = () => {
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
