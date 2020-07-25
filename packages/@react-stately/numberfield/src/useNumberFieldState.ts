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
import {useCallback, useRef, useState, useEffect} from 'react';
import {useControlledState} from '@react-stately/utils';
import {ValidationState} from '@react-types/shared';
import { useNumberFormatter } from '@react-aria/i18n';
import { useNumberParser } from '@react-aria/i18n/src/useNumberParser';

export interface NumberFieldState {
  setValue: (val: number) => void,
  increment: () => void,
  decrement: () => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  numberValue: number,
  inputValue: string,
  validationState: ValidationState,
  validate:() =>void,
  textValue?: string
}

interface UseNumberFieldStateProps {
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number ;
  onChange?: (value: string | number) => void;
  value?: number;
  formatOptions?: Intl.NumberFormatOptions
}

export function useNumberFieldState(
  props: UseNumberFieldStateProps
): NumberFieldState {
  let {minValue, maxValue, step = 1, formatOptions, value, defaultValue, onChange} = props;

  const numberParser = useNumberParser()
  const numberFormatter = useNumberFormatter(formatOptions)

  const [numberValue, setNumberValue] = useControlledState<number>(value, defaultValue || 0, onChange);
  const [inputValue, setInputValue] = useState(defaultValue ? defaultValue.toString() : '')

  const minusSign = useRef('-')
  let isValid = useRef(!isInputValueInvalid(numberValue, maxValue, minValue));

  useEffect(()=> {
    minusSign.current = numberFormatter.formatToParts(-11).find(p => p.type === 'minusSign').value
  }, [])

  let increment = () => {
    setNumberValue((previousValue) => {
      const newValue = clamp(
        handleDecimalOperation('+', previousValue, step),
        minValue,
        maxValue
      );

      updateValidation(newValue);
      setInputValue(newValue.toString())
      return newValue;
    });
  };

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumberValue(maxValue);
      setInputValue(maxValue.toString())
    }
  }, [maxValue, setNumberValue]);

  let decrement = () => {
    setNumberValue((previousValue) => {
      const newValue = clamp(
        handleDecimalOperation('-', previousValue, step),
        minValue,
        maxValue
      );

      updateValidation(newValue);
      setInputValue(newValue.toString())
      return newValue;
    });
  };

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumberValue(minValue);
      setInputValue(minValue.toString())
    }
  }, [minValue, setNumberValue]);

  let setValue = (value: number | string) => {
    value = value.toString().trim()
    const newValue = numberParser.parse(value)

    // If new value is NaN then fallback to 0 or last valid value?
    setNumberValue(newValue || 0)
    
    updateValidation(newValue);

    // Update the input value if value:
    // 1) is not NaN or
    // 2) is equal to minus sign or
    // 3) is empty
    if(!isNaN(newValue) || value === minusSign.current  || value.length === 0) {
      setInputValue(value)
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
    numberValue,
    inputValue,
    validate: ()=>{},
    textValue: inputValue.length > 0 ? numberFormatter.format(numberValue) : '',
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

function isInputValueInvalid(value:number, max, min): boolean {
  return (
    value === null ||
    isNaN(value) ||
    value > max ||
    value < min
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
