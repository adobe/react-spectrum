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

import {Color, ColorFieldProps} from '@react-types/color';
import {parseColor} from './Color';
import {useColor} from './useColor';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useState} from 'react';

export interface ColorFieldState {
  /**
   * The current text value of the input. Updated as the user types,
   * and formatted according to `formatOptions` on blur.
   */
  readonly inputValue: string,
  /**
   * The currently parsed color value, or null if the field is empty.
   * Updated based on the `inputValue` as the user types.
   */
  readonly colorValue: Color,
  /** Sets the current text value of the input. */
  setInputValue(value: string): void,
  /**
   * Updates the input value based on the currently parsed color value.
   * Typically this is called when the field is blurred.
   */
  commit(): void,
  /** Increments the current input value to the next step boundary, and fires `onChange`. */
  increment(): void,
  /** Decrements the current input value to the next step boundary, and fires `onChange`. */
  decrement(): void,
  /** Sets the current value to the maximum color value, and fires `onChange`. */
  incrementToMax(): void,
  /** Sets the current value to the minimum color value, and fires `onChange`. */
  decrementToMin(): void
}

const MIN_COLOR = parseColor('#000000');
const MAX_COLOR = parseColor('#FFFFFF');
const MIN_COLOR_INT = MIN_COLOR.toHexInt();
const MAX_COLOR_INT = MAX_COLOR.toHexInt();

/**
 * Provides state management for a color field component. Color fields allow
 * users to enter and adjust a hex color value.
 */
export function useColorFieldState(
  props: ColorFieldProps
): ColorFieldState {
  let {
    step = 1,
    value,
    defaultValue,
    onChange
  } = props;

  let initialValue = useColor(value);
  let initialDefaultValue = useColor(defaultValue);
  let [colorValue, setColorValue] = useControlledState<Color>(initialValue, initialDefaultValue, onChange);

  let initialInputValue = (value || defaultValue) && colorValue ? colorValue.toString('hex') : '';
  let [inputValue, setInputValue] = useState(initialInputValue);

  useEffect(() => {
    setInputValue(inputValue => {
      // Parse color from current inputValue.
      // Only update the input value if the parseColorValue is not equivalent.
      if (!inputValue.length && colorValue) { return colorValue.toString('hex'); }
      try {
        let currentColor = parseColor(inputValue.startsWith('#') ? inputValue : `#${inputValue}`);
        if (currentColor.toHexInt() !== colorValue?.toHexInt()) {
          return colorValue ? colorValue.toString('hex') : '';
        }
      } catch (err) {
        // ignore
      }
      return inputValue;
    });
  }, [inputValue, colorValue, setInputValue]);

  let increment = () => setColorValue((prevColor: Color) => addColorValue(prevColor, step));
  let decrement = () => setColorValue((prevColor: Color) => addColorValue(prevColor, -step));
  let incrementToMax = () => setColorValue((prevColor: Color) => addColorValue(prevColor, MAX_COLOR_INT));
  let decrementToMin = () => setColorValue((prevColor: Color) => addColorValue(prevColor, -MAX_COLOR_INT));

  let setFieldInputValue = (value: string) => {
    value = value.match(/^#?[0-9a-f]{0,6}$/i)?.[0];
    if (value !== undefined) {
      if (!value.length && colorValue) {
        setColorValue(null);
        return;
      }
      try {
        let newColor = parseColor(value.startsWith('#') ? value : `#${value}`);
        setColorValue((prevColor: Color) => {
          setInputValue(value);
          return prevColor && prevColor.toHexInt() === newColor.toHexInt() ? prevColor : newColor;
        });
      } catch (err) {
        setInputValue(value);
      }
    }
  };

  let commit = () => {
    setInputValue(colorValue ? colorValue.toString('hex') : '');
  };

  return {
    colorValue,
    inputValue,
    setInputValue: setFieldInputValue,
    commit,
    increment,
    incrementToMax,
    decrement,
    decrementToMin
  };
}

function addColorValue(color: Color, step: number) {
  let newColor = color ? color : MIN_COLOR;
  let colorInt = newColor.toHexInt();
  let newColorString = color ? color.toString('hex') : '';

  let clampInt = Math.min(Math.max(colorInt + step, MIN_COLOR_INT), MAX_COLOR_INT);
  if (clampInt !== colorInt) {
    newColorString = `#${clampInt.toString(16).padStart(6, '0').toUpperCase()}`;
    newColor = parseColor(newColorString);
  }
  return newColor;
}
