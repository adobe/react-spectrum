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

import {clamp, roundToStep, useControlledState} from '@react-stately/utils';
import {getNumberFormatter, getNumberingSystem, isValidPartialNumber, parseNumber} from '@react-stately/i18n';
import {NumberFieldProps} from '@react-types/numberfield';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

export interface NumberFieldState {
  validate: (value: string) => boolean,
  increment: () => void,
  decrement: () => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  commitInputValue: () => void,
  minValue: number,
  maxValue: number,
  numberValue: number,
  setInputValue: (val: string) => void,
  inputValue: string
}

interface NumberFieldStateProps extends NumberFieldProps {
  locale: string
}

// for two decimal points of precision
const MAX_SAFE_FLOAT = (Number.MAX_SAFE_INTEGER + 1) / 128 - 1;
const MIN_SAFE_FLOAT = (Number.MIN_SAFE_INTEGER - 1) / 128 + 1;

export function useNumberFieldState(
  props: NumberFieldStateProps
): NumberFieldState {
  let {
    minValue = Number.MIN_SAFE_INTEGER,
    maxValue = Number.MAX_SAFE_INTEGER,
    step,
    formatOptions,
    value,
    defaultValue,
    onChange,
    locale
  } = props;

  let [numberValue, setNumberValue] = useControlledState<number>(value, isNaN(defaultValue) ? NaN : defaultValue, onChange);
  let [inputValue, setInputValue] = useState(() => isNaN(numberValue) ? '' : getNumberFormatter(locale, formatOptions).format(numberValue));

  let numberingSystem = useMemo(() => getNumberingSystem(inputValue), [inputValue]);
  let formatter = useMemo(() => getNumberFormatter(locale, {...formatOptions, numberingSystem}), [locale, formatOptions, numberingSystem]);
  let intlOptions = useMemo(() => formatter.resolvedOptions(), [formatter]);
  let format = useCallback((value: number) => isNaN(value) ? '' : formatter.format(value), [formatter]);

  // Number.MAX_SAFE_INTEGER - 0.01 is still Number.MAX_SAFE_INTEGER, so decrement/increment won't work on it for the percent formatting
  // anything with a step smaller than 1 will have this problem
  // unfortunately, finding the safe max/min is non-trivial, so we'll need to rely on people setting max/min correctly for their step size
  // we can include it for percent though
  // can look for a method to run locally to figure it out https://stackoverflow.com/questions/45929493/node-js-maximum-safe-floating-point-number
  if (intlOptions.style === 'percent') {
    maxValue = isNaN(props.maxValue) ? MAX_SAFE_FLOAT : props.maxValue;
    minValue = isNaN(props.minValue) ? MIN_SAFE_FLOAT : props.maxValue;
  }

  // Update the input value when the number value or format options change. This is done
  // in a useEffect so that the controlled behavior is correct and we only update the
  // textfield after prop changes.
  useEffect(() => {
    setInputValue(format(numberValue));
  }, [numberValue, locale, formatOptions]);

  // Store last parsed value in a ref so it can be used by increment/decrement below
  let parsed = useRef(0);
  parsed.current = useMemo(() => parseNumber(locale, formatOptions, inputValue), [locale, formatOptions, inputValue]);

  let commitInputValue = () => {
    // Set to empty state if input value is empty
    if (!inputValue.length) {
      setNumberValue(NaN);
      setInputValue('');
      return;
    }

    // if it failed to parse, then reset input to formatted version of current number
    if (isNaN(parsed.current)) {
      setInputValue(format(numberValue));
      return;
    }

    // Clamp to min and max, round to the nearest step, and round to specified number of
    // fraction digits according to formatOptions.
    let clampedValue = clamp(parsed.current, minValue, maxValue);
    clampedValue = roundToStep(clampedValue, step);
    clampedValue = parseNumber(locale, formatOptions, format(clampedValue));
    setNumberValue(clampedValue);

    // in a controlled state, the numberValue won't change, so we won't go back to our old input without help
    setInputValue(format(value === undefined ? clampedValue : numberValue));
  };

  let safeNextStep = useCallback((operation, prev) => {
    let clampStep = !isNaN(step) ? step : 1;
    if (intlOptions.style === 'percent' && isNaN(step)) {
      clampStep = 0.01;
    }
    let clampedValue = clamp(prev, minValue, maxValue);
    clampedValue = roundToStep(clampedValue, step);
    if (clampedValue > prev) {
      return clampedValue;
    }
    let newValue = clamp(
      handleDecimalOperation(operation, prev, clampStep),
      minValue,
      maxValue
    );
    newValue = roundToStep(newValue, step);
    return newValue;
  }, [minValue, maxValue, step, intlOptions]);

  let increment = useCallback(() => {
    setNumberValue((previousValue) => {
      let prev = parsed.current;
      if (isNaN(prev)) {
        // if the input is empty, start from 0
        prev = 0;
        if (!isNaN(minValue) && prev < minValue) {
          // unless zero is less than the min value, then start well below it so we clamp to the min
          prev = -Infinity;
        }
      }
      let newValue = safeNextStep('+', prev);

      // if we've arrived at the same value that was previously in the state, the
      // input value should be updated to match
      // ex type 4, press increment, highlight the number in the input, type 4 again, press increment
      // you'd be at 5, then incrementing to 5 again, so no re-render would happen and 4 would be left in the input
      if (newValue === previousValue) {
        setInputValue(format(newValue));
      }

      return newValue;
    });
  }, [setNumberValue, parsed, safeNextStep, format, minValue]);

  let decrement = useCallback(() => {
    setNumberValue((previousValue) => {
      let prev = parsed.current;
      // if the input is empty, start from the max value when decrementing
      if (isNaN(prev)) {
        prev = 0;
        // unless zero is greater than the max value, then start well above it so we clamp to the max
        if (!isNaN(maxValue) && prev > maxValue) {
          prev = Infinity;
        }
      }
      let newValue = safeNextStep('-', prev);

      if (newValue === previousValue) {
        setInputValue(format(newValue));
      }

      return newValue;
    });
  }, [setNumberValue, parsed, safeNextStep, format, maxValue]);

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumberValue(roundToStep(clamp(maxValue, minValue, maxValue), step));
    }
  }, [maxValue, setNumberValue, minValue, step]);

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumberValue(roundToStep(clamp(minValue, minValue, maxValue), step));
    }
  }, [minValue, setNumberValue, maxValue, step]);

  let validate = (value: string) => isValidPartialNumber(locale, formatOptions, value, minValue, maxValue);

  return {
    validate,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    minValue,
    maxValue,
    numberValue: parsed.current,
    setInputValue,
    inputValue,
    commitInputValue
  };
}

function handleDecimalOperation(operator: '-' | '+', value1: number, value2: number): number {
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
