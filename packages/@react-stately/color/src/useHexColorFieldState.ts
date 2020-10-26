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
import {HexColorFieldProps} from '@react-types/color';
import {NumberFieldState} from '@react-stately/numberfield';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useState} from 'react';

export interface HexColorFieldState extends Omit<NumberFieldState, 'value' | 'setValue'> {
  colorValue: Color,
  setInputValue: (value: string) => void
}

const MIN_COLOR = new Color('#000000');
const MAX_COLOR = new Color('#FFFFFF');
const MIN_COLOR_INT = MIN_COLOR.toHexInt();
const MAX_COLOR_INT = MAX_COLOR.toHexInt();

export function useHexColorFieldState(
  props: HexColorFieldProps
): HexColorFieldState {
  let {
    step = 1,
    value,
    defaultValue,
    onChange,
    validationState
  } = props;
  
  let initialValue = useColor(value);
  let initialDefaultValue = useColor(defaultValue);
  let [colorValue, setColorValue] = useControlledState<Color>(initialValue, initialDefaultValue, onChange);

  let initialInputValue = (value || defaultValue) && colorValue ? colorValue.toString('hex') : '';
  let [inputValue, setInputValue] = useState(initialInputValue);

  let addColorValue = (color: Color, step: number) => {
    let newColor = color ? color : MIN_COLOR;
    let colorInt = newColor.toHexInt();
    let newColorString = color ? color.toString('hex') : '';

    let clampInt = Math.min(Math.max(colorInt + step, MIN_COLOR_INT), MAX_COLOR_INT);
    if (clampInt !== colorInt) {
      newColorString = `#${clampInt.toString(16).padStart(6, '0').toUpperCase()}`;
      newColor = new Color(newColorString);
    }

    setInputValue(newColorString);
    return newColor;
  };

  let increment = () => setColorValue((prevColor: Color) => addColorValue(prevColor, step));
  let decrement = () => setColorValue((prevColor: Color) => addColorValue(prevColor, -step));
  let incrementToMax = () => setColorValue((prevColor: Color) => addColorValue(prevColor, MAX_COLOR_INT));
  let decrementToMin = () => setColorValue((prevColor: Color) => addColorValue(prevColor, -MAX_COLOR_INT));

  let setFieldInputValue = (value: string) => {
    value = value.match(/^#?[0-9a-f]{0,6}$/i)?.[0];
    if (value !== undefined) {
      setInputValue(value);
      if (!value.length && colorValue) {
        setColorValue(null);
        return;
      }
      if (!value.startsWith('#')) {
        value = `#${value}`;
      }
      try {
        let newColor = new Color(value);
        setColorValue((prevColor: Color) => prevColor && prevColor.toHexInt() === newColor.toHexInt() ? prevColor : newColor);
      } catch (err) {
        // ignore
      }
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
