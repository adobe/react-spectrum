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

import {clamp, roundToStep} from '@react-aria/utils';
import {
  determineNumeralSystem,
  NumeralSystem,
  useLocale,
  useNumberFormatter,
  useNumberParser
} from '@react-aria/i18n';
import {NumberFieldProps} from '@react-types/numberfield';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface NumberFieldState {
  setValue: (val: number | string) => void,
  increment: (isSpinning?: boolean) => void,
  decrement: (isSpinning?: boolean) => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  commitInputValue: () => void,
  minValue: number,
  maxValue: number,
  value: number,
  inputValue: string,
  textValue?: string,
  currentNumeralSystem?: string
}

// for two decimal points of precision
let MAX_SAFE_FLOAT = (Number.MAX_SAFE_INTEGER + 1) / 128 - 1;
let MIN_SAFE_FLOAT = (Number.MIN_SAFE_INTEGER - 1) / 128 + 1;

export function useNumberFieldState(
  props: NumberFieldProps
): NumberFieldState {
  let {locale} = useLocale();
  let {minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER, step, formatOptions, value, defaultValue, onChange} = props;

  let [currentNumeralSystem, setCurrentNumeralSystem] = useState<NumeralSystem | undefined>();

  let inputValueFormatter = useNumberFormatter({...formatOptions, numeralSystem: currentNumeralSystem});
  let numberParser = useNumberParser({...formatOptions, numeralSystem: currentNumeralSystem});
  let intlOptions = useMemo(() => inputValueFormatter.resolvedOptions(), [inputValueFormatter]);

  // Number.MAX_SAFE_INTEGER - 0.01 is still Number.MAX_SAFE_INTEGER, so decrement/increment won't work on it for the percent formatting
  // anything with a step smaller than 1 will have this problem
  // unfortunately, finding the safe max/min is non-trivial, so we'll need to rely on people setting max/min correctly for their step size
  // we can include it for percent though
  // can look for a method to run locally to figure it out https://stackoverflow.com/questions/45929493/node-js-maximum-safe-floating-point-number
  if (intlOptions.style === 'percent' && isNaN(step)) {
    maxValue = isNaN(props.maxValue) ? MAX_SAFE_FLOAT : props.maxValue;
    minValue = isNaN(props.minValue) ? MIN_SAFE_FLOAT : props.maxValue;
  }


  let {minusSign, plusSign} = numberParser.symbols;

  // javascript doesn't recognize NaN === NaN, so multiple onChanges will get fired if we don't ignore consecutive ones
  // in addition, if the input starts with a number, then we'll count that as the last val dispatched, we only need to calculate it the first time
  let startingValue = useMemo(() => {
    if (!isNaN(value)) {
      return value;
    } else if (!isNaN(defaultValue)) {
      return defaultValue;
    }
    return NaN;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  let lastValDispatched = useRef(startingValue);
  let smartOnChange = useCallback((val) => {
    if (!isNaN(val) || !isNaN(lastValDispatched.current)) {
      onChange?.(val);
    }
    lastValDispatched.current = val;
  }, [lastValDispatched, onChange]);


  let [numberValue, setNumberValue] = useControlledState<number>(value, isNaN(defaultValue) ? NaN : defaultValue, smartOnChange);

  let textValue = inputValueFormatter.format(numberValue);
  let [inputValue, setInputValue] = useState(() => isNaN(numberValue) ? '' : textValue);


  // this updates the field only if the formatter or number has changed,
  // this should only run after increment, decrement, blur
  // or when the formatter changes, but not because of the overrides, which is why we run on formatOptions
  // I doubt that the formatOptions will change while a user is typing a number, but that might cause a problem
  useEffect(() => {
    setInputValue(isNaN(numberValue) ? '' : textValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatOptions, setInputValue, numberValue, locale]);

  let parse = useCallback((value: string): number => {
    // Set to empty state if input value is empty
    if (!value.length) {
      return NaN;
    }
    let newValue = numberParser.parse(value);
    // if it failed to parse, then reset input to formatted version of current number
    if (isNaN(newValue)) {
      return NaN;
    }

    return newValue;
  }, [numberParser]);

  // this removes any not allowed characters from the input value
  let cleanInputValue = useMemo(() => numberParser.clean(inputValue), [numberParser, inputValue]);
  // Number parser doesn't know about min/max, so we must remove it ourselves
  if (minValue >= 0) {
    cleanInputValue = cleanInputValue.replace(minusSign, '');
  }
  if (maxValue <= 0) {
    cleanInputValue = cleanInputValue.replace(plusSign, '');
  }
  let currentlyParsed = useMemo(() => parse(cleanInputValue), [parse, cleanInputValue]);


  let setValue = (value: string) => {
    let numeralSystem = determineNumeralSystem(value);
    setCurrentNumeralSystem(numeralSystem);
    setInputValue(value);
  };

  let commitInputValue = () => {
    // Set to empty state if input value is empty
    if (!inputValue.length) {
      setNumberValue(NaN);
      setInputValue('');
      return;
    }
    // if it failed to parse, then reset input to formatted version of current number
    if (isNaN(currentlyParsed)) {
      setInputValue(inputValueFormatter.format(numberValue));
      return;
    }

    let clampedValue;
    if (!isNaN(currentlyParsed)) {
      clampedValue = clamp(currentlyParsed, minValue, maxValue);
    } else {
      clampedValue = clamp(numberValue, minValue, maxValue);
    }
    clampedValue = roundToStep(clampedValue, step);
    clampedValue = numberParser.round(clampedValue);
    let result = isNaN(clampedValue) ? '' : inputValueFormatter.format(clampedValue);
    setNumberValue(clampedValue);
    // in a controlled state, the numberValue won't change, so we won't go back to our old input without help
    if (value === undefined) {
      setInputValue(result);
    } else {
      setInputValue(inputValueFormatter.format(numberValue));
    }
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

  let increment = useCallback((isSpinning: boolean = false) => {
    setNumberValue((previousValue) => {
      let prev = !isSpinning ? currentlyParsed : previousValue;
      if (isNaN(prev)) {
        // if the input is empty, start from 0
        prev = 0;
        if (!isNaN(props.minValue) && prev < props.minValue) {
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
        setInputValue(inputValueFormatter.format(newValue));
      }
      return newValue;
    });
  }, [setNumberValue, currentlyParsed, safeNextStep, inputValueFormatter]);

  let decrement = useCallback((isSpinning: boolean = false) => {
    setNumberValue((previousValue) => {
      let prev = !isSpinning ? currentlyParsed : previousValue;
      // if the input is empty, start from the max value when decrementing
      if (isNaN(prev)) {
        prev = 0;
        // unless zero is greater than the max value, then start well above it so we clamp to the max
        if (!isNaN(props.maxValue) && prev > maxValue) {
          prev = Infinity;
        }
      }
      let newValue = safeNextStep('-', prev);

      if (newValue === previousValue) {
        setInputValue(inputValueFormatter.format(newValue));
      }
      return newValue;
    });
  }, [setNumberValue, currentlyParsed, safeNextStep, inputValueFormatter]);

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

  return {
    setValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    minValue,
    maxValue,
    value: numberValue,
    inputValue: cleanInputValue,
    commitInputValue,
    textValue: textValue === 'NaN' ? '' : textValue,
    currentNumeralSystem
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

// eslint-disable-next-line jsdoc/require-description-complete-sentence
/**
 * These are handy examples of what formatToParts gives for anyone working on this file.
 * example -3500 in accounting
 * 0: {type: "literal", value: "("}
 * 1: {type: "currency", value: "€"}
 * 2: {type: "integer", value: "3"}
 * 3: {type: "group", value: ","}
 * 4: {type: "integer", value: "500"}
 * 5: {type: "decimal", value: "."}
 * 6: {type: "fraction", value: "00"}
 * 7: {type: "literal", value: ")"}
 *
 * example -3500 in normal
 * 0: {type: "minusSign", value: "-"}
 * 1: {type: "integer", value: "3"}
 * 2: {type: "group", value: "."}
 * 3: {type: "integer", value: "500"}
 * 4: {type: "decimal", value: ","}
 * 5: {type: "fraction", value: "00"}
 * 6: {type: "literal", value: " "}
 * 7: {type: "currency", value: "€"}
 *
 * example 3500 in always show sign
 * 0: {type: "plusSign", value: "+"}
 * 1: {type: "integer", value: "3"}
 * 2: {type: "group", value: "."}
 * 3: {type: "integer", value: "500"}
 * 4: {type: "decimal", value: ","}
 * 5: {type: "fraction", value: "00"}
 * 6: {type: "literal", value: " "}
 * 7: {type: "currency", value: "€"}
 */
