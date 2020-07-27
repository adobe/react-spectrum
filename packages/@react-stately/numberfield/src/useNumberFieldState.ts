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
  setValue: (val: number | string) => void,
  increment: () => void,
  decrement: () => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  validateInputValue: () => void,
  numberValue: number,
  inputValue: string,
  validationState: ValidationState,
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
  const textValueFormatter = useNumberFormatter(formatOptions)
  const inputValueFormatter = useNumberFormatter()

  const [numberValue, setNumberValue] = useControlledState<number>(value, defaultValue || 0, onChange);
  const [inputValue, setInputValue] = useState(defaultValue ? inputValueFormatter.format(defaultValue) : '')
  const [isValid, setIsValid] = useState(isInputValueValid(numberValue, maxValue, minValue));

  const minusSign = useRef('-')

  useEffect(()=> {
    // Get the minus sign of the current locale to filter the input value
    // Automatically updates the minus sign when numberFormatter changes
    minusSign.current = inputValueFormatter.formatToParts(-11).find(p => p.type === 'minusSign').value
  }, [inputValueFormatter])

  let increment = () => {
    setNumberValue((previousValue) => {
      const newValue = clamp(
        handleDecimalOperation('+', previousValue, step),
        minValue,
        maxValue
      );

      updateValidation(newValue);
      setInputValue(inputValueFormatter.format(newValue))
      return newValue;
    });
  };

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumberValue(maxValue);
      setInputValue(inputValueFormatter.format(maxValue))
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
      setInputValue(inputValueFormatter.format(newValue))
      return newValue;
    });
  };

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumberValue(minValue);
      setInputValue(inputValueFormatter.format(minValue))
    }
  }, [minValue, setNumberValue]);

  let setValue = (value: number | string) => {
    value = value.toString().trim()
    const newValue = numberParser.parse(value)

    // If new value is not NaN then update the number value
    if (!isNaN(newValue)) {
      setNumberValue(newValue);
    }
    
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
    setIsValid(isInputValueValid(value, maxValue, minValue))
  };

  // Mostly used in onBlur event to set the input value to
  // formatted numberValue. e.g. user types `-` then blurs. 
  // instead of leaving the only minus sign we set the input value back to valid value
  const validateInputValue = () => {
    // Do nothing if input value is empty
    if(!inputValue.length) return 

    const newValue = inputValueFormatter.format(numberValue)
    updateValidation(newValue); 
    setInputValue(newValue)
  }
  
  return {
    setValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    numberValue,
    inputValue,
    validateInputValue,
    textValue: inputValue.length > 0 ? textValueFormatter.format(numberValue) : '',
    validationState: !isValid ? 'invalid' : null
  };
}

function isInputValueValid(value:number, max, min): boolean {
  return (
    value !== null &&
    !isNaN(value) &&
    (max !== undefined ? value <= max : true) &&
    (min !== undefined ? value >= min : true) 
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
