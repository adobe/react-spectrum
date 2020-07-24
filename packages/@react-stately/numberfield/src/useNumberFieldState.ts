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
import {useCallback, useRef} from 'react';
import {useControlledState} from '@react-stately/utils';
import {ValidationState} from '@react-types/shared';

export interface NumberFieldState {
  setValue: (val: string, ...args: any) => void,
  increment: (...args: any) => void,
  decrement: (...args: any) => void,
  incrementToMax: (...args: any) => void,
  decrementToMin: (...args: any) => void,
  value: number,
  validationState: ValidationState
}

interface UseNumberFieldStateProps {
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number | string;
  onChange?: (value: string) => void;
  value?: string | number;
}

export function useNumberFieldState(
  props: UseNumberFieldStateProps
): NumberFieldState {
  let {minValue, maxValue, step = 1, value, defaultValue = 0, onChange} = props;

  let [numValue, setNumValue] = useControlledState<string | number>(
    value,
    String(defaultValue),
    onChange
  );
  let isValid = useRef(!isInputValueInvalid(numValue, maxValue, minValue));
  const lastValidValue = useRef(defaultValue);

  let increment = () => {
    setNumValue((previousValue) => {
      let newValue = isNaN(Number(previousValue))
        ? lastValidValue.current
        : Number(previousValue);

      newValue = clamp(
        handleDecimalOperation('+', newValue, step),
        minValue,
        maxValue
      );

      updateValidation(newValue);
      lastValidValue.current = newValue;
      return String(newValue);
    });
  };

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumValue(String(maxValue));
    }
  }, [maxValue, setNumValue]);

  let decrement = () => {
    setNumValue((previousValue) => {
      let newValue = isNaN(Number(previousValue))
        ? lastValidValue.current
        : Number(previousValue);

      newValue = clamp(
        handleDecimalOperation('-', newValue, step),
        minValue,
        maxValue
      );

      updateValidation(newValue);
      lastValidValue.current = newValue;
      return String(newValue);
    });
  };

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumValue(String(minValue));
    }
  }, [minValue, setNumValue]);

  let setValue = (value: string) => {
    updateValidation(value);

    setNumValue(String(value));
  };

  let updateValidation = (value) => {
    isValid.current = !isInputValueInvalid(value, maxValue, minValue);
  };

  let validate = () => {
    const validValue = getValidValue(
      numValue,
      lastValidValue.current,
      maxValue,
      minValue
    );

    lastValidValue.current = validValue;
    setValue(validValue);
  };

  return {
    setValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    value: numValue,
    validate,
    validationState: !isValid.current ? 'invalid' : null
  };
}

const getValidValue = (value, lastValidValue, max, min) => {
  if (value === null || value.trim().length === 0 || isNaN(Number(value))) {
    return lastValidValue;
  }
  const newValue = clamp(Number(value), min, max);
  return newValue;
};

function isInputValueInvalid(value, max, min): boolean {
  const numeric = Number(value);
  return (
    value === null ||
    String(value).trim().length === 0 ||
    isNaN(numeric) ||
    numeric > max ||
    numeric < min
  );
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
