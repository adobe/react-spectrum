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

import {clamp} from '@react-aria/utils';
import {useControlledState} from '@react-stately/utils';
import {useRef} from 'react';

export interface NumberFieldState {
  setValue: (val: string, ...args: any) => void,
  increment: (...args: any) => void,
  decrement: (...args: any) => void,
  incrementToMax: (...args: any) => void,
  decrementToMin: (...args: any) => void,
  value: number,
  validationState: string
}

export function useNumberFieldState(props) : NumberFieldState {
  let {
    minValue,
    maxValue,
    step = 1,
    value,
    defaultValue,
    onChange
  } = props;

  let [numValue, setNumValue] = useControlledState(value, defaultValue || '', onChange);
  let isValid = useRef(!isInputValueInvalid(numValue, maxValue, minValue));

  let increment = () => {
    setNumValue(previousValue => {
      let newValue = parseFloat(previousValue);
      if (isNaN(newValue)) {
        newValue = maxValue != null ? Math.min(step, maxValue) : step;
      } else {
        newValue = clamp(handleDecimalOperation('+', newValue, step), minValue, maxValue);
      }
      updateValidation(newValue);
      return newValue;
    });
  };

  let incrementToMax = () => {
    if (maxValue != null) {
      setNumValue(maxValue);
    }
  };

  let decrement = () => {
    setNumValue(previousValue => {
      let newValue = parseFloat(previousValue);
      if (isNaN(newValue)) {
        newValue = minValue != null ? Math.max(-step, minValue) : -step;
      } else {
        newValue = clamp(handleDecimalOperation('-', newValue, step), minValue, maxValue);
      }
      updateValidation(newValue);
      return newValue;
    });
  };

  let decrementToMin = () => {
    if (minValue != null) {
      setNumValue(minValue);
    }
  };

  let setValue = (value: string) => {
    const valueAsNumber = value === '' ? null : +value;
    const numeric = !isNaN(valueAsNumber);

    // They may be starting to type a negative number, we don't want to broadcast this to
    // the onChange handler, but we do want to update the value state.
    const resemblesNumber = numeric || value === '-' || value === '';

    isValid.current = !isInputValueInvalid(value, maxValue, minValue);
    if (resemblesNumber) {
      setNumValue(valueAsNumber);
    }
  };

  let updateValidation = (value) => {
    isValid.current = !isInputValueInvalid(value, maxValue, minValue);
  };

  return {
    setValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    value: numValue,
    validationState: !isValid.current && 'invalid'
  };
}

function isInputValueInvalid(value, max, min):boolean {
  return value !== '' && isNaN(+value)
    || (max !== null && value > max || min !== null && value < min);
}

function handleDecimalOperation(operator, value1, value2) {
  let result = operator === '+' ? value1 + value2 : value1 - value2;

  // Check if we have decimals
  if (value1 % 1 !== 0 || value2 % 1 !== 0) {
    const value1Decimal = value1.toString().split('.');
    const value2Decimal = value2.toString().split('.');
    const value1DecimalLength = (value1Decimal[1] && value1Decimal[1].length) || 0;
    const value2DecimalLength = (value2Decimal[1] && value2Decimal[1].length) || 0;
    const multiplier = Math.pow(10, Math.max(value1DecimalLength, value2DecimalLength));

    // Transform the decimals to integers based on the precision
    value1 = Math.round(value1 * multiplier);
    value2 = Math.round(value2 * multiplier);

    // Perform the operation on integers values to make sure we don't get a fancy decimal value
    result = operator === '+' ? value1 + value2 : value1 - value2;

    // Transform the integer result back to decimal
    result /= multiplier;
  }

  return result;
}
