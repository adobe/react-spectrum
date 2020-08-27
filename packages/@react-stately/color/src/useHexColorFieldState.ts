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
import {useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface HexColorFieldState extends NumberFieldState {
  colorValue: Color,
  setColorValue: (color: Color) => void,
}

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
  const colorValue = new Color(colorInputValue === 'string'? colorInputValue : colorInputValue.toString('hex'));
  let initialInputValue = colorValue.toString('hex');
  const [inputValue, setInputValue] = useState(initialInputValue);

  const setColorValue = (color: Color) => {
    // TO DO: put some validations here
    setColorInputValue(color);
  };

  return {
    colorValue,
    setColorValue,
    value: null,
    setValue: null,
    inputValue: inputValue,
    textValue: inputValue,
    increment: null,
    incrementToMax: null,
    decrement: null,
    decrementToMin: null,
    commitInputValue: null,
    validationState: null,
  };
}
