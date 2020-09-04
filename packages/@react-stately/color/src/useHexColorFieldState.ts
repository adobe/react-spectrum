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

import {Color, parseColorToInt, parseColor} from './Color';
import {ColorInput, HexColorFieldProps} from '@react-types/color';
import {NumberFieldState} from '@react-stately/numberfield';
import {useCallback, useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface HexColorFieldState extends NumberFieldState {
  colorValue: Color,
  setColorValue: (color: Color) => void
}

/**
 * Manages state for a color object, represented in hex, 
 * and provides methods for manipulating the color value.
 */
export function useHexColorFieldState(
  props: HexColorFieldProps
): HexColorFieldState {
  const {
    minValue = '#000000',
    maxValue = '#ffffff',
    step = 1,
    value,
    defaultValue,
    onChange
  } = props;

  const [colorInputValue, setColorInputValue] = useControlledState<ColorInput>(value, defaultValue || minValue, onChange);
  const initialInputIsValid = isInputValueValid(colorInputValue, maxValue, minValue);
  let colorValue;
  let initialInputValue;
  if (initialInputIsValid) {
    colorValue = parseColor(colorInputValue);
    initialInputValue = colorValue.toString('hex');
  }
  const [inputValue, setInputValue] = useState(initialInputValue || '');
  const [isValid, setIsValid] = useState(initialInputIsValid);

  const increment = () => {
    setColorInputValue((previousValue) => {
      const colorInt = parseColorToInt(previousValue);
      const maxColorInt = parseColorToInt(maxValue);
      const newValue = `#${Math.min(colorInt + step, maxColorInt).toString(16).padStart(6, '0').toUpperCase()}`;
      const newColor = new Color(newValue);
      updateValidation(newColor);
      setInputValue(newValue);
      return newColor;
    });
  };

  const incrementToMax = useCallback(() => {
    if (maxValue != null) {
      const maxColor = parseColor(maxValue);
      setColorInputValue(maxColor);
      setInputValue(maxColor.toString('hex'));
    }
  }, [maxValue, setColorInputValue, setInputValue]);

  const decrement = () => {
    setColorInputValue((previousValue) => {
      const colorInt = parseColorToInt(previousValue);
      const minColorInt = parseColorToInt(minValue);
      const newValue = `#${Math.max(colorInt - step, minColorInt).toString(16).padStart(6, '0').toUpperCase()}`;
      const newColor = new Color(newValue);
      updateValidation(newColor);
      setInputValue(newValue);
      return newColor;
    });
  };

  const decrementToMin = useCallback(() => {
    if (minValue != null) {
      const minColor = parseColor(minValue);
      setColorInputValue(minColor);
      setInputValue(minColor.toString('hex'));
    }
  }, [minValue, setColorInputValue, setInputValue]);

  const setColorValue = (color: Color) => {
    updateValidation(color);
    setColorInputValue(color);
    setInputValue(color.toString('hex'));
  };

  const updateValidation = (value: Color) => {
    setIsValid(isInputValueValid(value, maxValue, minValue));
  };

  const commitInputValue = () => {
    if (!inputValue.length) { return; }
    updateValidation(colorValue);
    setInputValue(colorValue.toString('hex'));
  };

  return {
    colorValue,
    setColorValue,
    value: null,
    setValue: null,
    inputValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    commitInputValue,
    validationState: !isValid ? 'invalid' : null
  };
}

function isInputValueValid(value: ColorInput, max: ColorInput, min: ColorInput): boolean {
  let colorInt;
  try {
    colorInt = parseColorToInt(value);
  } catch { return false; }

  const maxColorInt = parseColorToInt(max);
  const minColorInt = parseColorToInt(min);
  return (
    colorInt <= maxColorInt &&
    colorInt >= minColorInt
  );
}
