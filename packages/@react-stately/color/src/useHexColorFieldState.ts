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
import {useState} from 'react';

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
  
  let {color: initialValue} = useColor(value);
  let {color: initialDefaultValue} = useColor(defaultValue);
  let [colorValue, setColorValue] = useControlledState<Color>(initialValue, initialDefaultValue, onChange);

  let initialInputValue = (value || defaultValue) && colorValue ? colorValue.toString('hex') : '';
  let [inputValue, setInputValue] = useState(initialInputValue);

  let increment = () => {
    setColorValue((prevColor: Color) => {
      let newColor = prevColor;
      let prevColorInt = prevColor ? prevColor.toHexInt() : MIN_COLOR_INT;
      let newColorString = prevColor ? prevColor.toString('hex') : '';
      if (prevColorInt < MAX_COLOR_INT) {
        newColorString = `#${Math.min(prevColorInt + step, MAX_COLOR_INT).toString(16).padStart(6, '0').toUpperCase()}`;
        newColor = new Color(newColorString);
      }
      setInputValue(newColorString);
      return newColor;
    });
  };

  let incrementToMax = () => {
    setColorValue((prevColor: Color) => {
      let newColor = MAX_COLOR;
      if (prevColor && prevColor.toHexInt() === MAX_COLOR_INT) {
        newColor = prevColor;
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  };

  let decrement = () => {
    setColorValue((prevColor: Color) => {
      let newColor = prevColor ? prevColor : MIN_COLOR;
      let newColorString = newColor.toString('hex');
      if (prevColor) {
        let prevColorInt = prevColor.toHexInt();
        if (prevColorInt > MIN_COLOR_INT) {
          newColorString = `#${Math.max(prevColorInt - step, MIN_COLOR_INT).toString(16).padStart(6, '0').toUpperCase()}`;
          newColor = new Color(newColorString);
        }
      }
      setInputValue(newColorString);
      return newColor;
    });
  };

  let decrementToMin = () => {
    setColorValue((prevColor: Color) => {
      let newColor = MIN_COLOR;
      if (prevColor && prevColor.toHexInt() === MIN_COLOR_INT) {
        newColor = prevColor;
      }
      setInputValue(newColor.toString('hex'));
      return newColor;
    });
  };

  let setFieldInputValue = (value: string) => {
    value = value.replace(/[^#0-9a-f]/ig, '');
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
