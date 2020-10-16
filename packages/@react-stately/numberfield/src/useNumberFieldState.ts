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
import {NumberFieldProps} from '@react-types/numberfield';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useNumberFormatter, useNumberParser} from '@react-aria/i18n';

export interface NumberFieldState {
  setValue: (val: number | string) => void,
  increment: () => void,
  decrement: () => void,
  incrementToMax: () => void,
  decrementToMin: () => void,
  commitInputValue: () => void,
  value: number,
  inputValue: string,
  textValue?: string,
  currentNumeralSystem?: string
}

let numberingSystems = {
  arab: [...('٠١٢٣٤٥٦٧٨٩')],
  hanidec: [...('〇一二三四五六七八九')],
  latin: [...('0123456789')]
};

export function useNumberFieldState(
  props: NumberFieldProps
): NumberFieldState {
  let {minValue = Number.MIN_SAFE_INTEGER, maxValue = Number.MAX_SAFE_INTEGER, step = 1, formatOptions, value, defaultValue, onChange} = props;
  let [currentNumeralSystem, setCurrentNumeralSystem] = useState('latin');

  let numberParser = useNumberParser();
  let inputValueFormatter = useNumberFormatter(formatOptions);

  let symbols = useMemo(() => {
    // Get the minus sign of the current locale to filter the input value
    // Automatically updates the minus sign when numberFormatter changes
    // won't work for currency accounting, but we have validCharacters for that in the pattern
    let allParts = inputValueFormatter.formatToParts(-1000.1);
    let minusSign = allParts.find(p => p.type === 'minusSign')?.value;
    minusSign = minValue >= 0 || !minusSign ? '' : minusSign;
    let decimal = allParts.find(p => p.type === 'decimal')?.value;
    // this is a string ready for any regex so we can identify allowed characters, minus is excluded because of the way it can be handled
    let validCharacters = allParts.reduce((chars, p) => p.type === 'fraction' || p.type === 'integer' || p.type === 'minusSign' ? chars : chars + '\\' + p.value, '');
    let literals = allParts.reduce((chars, p) => p.type === 'decimal' || p.type === 'fraction' || p.type === 'integer' || p.type === 'minusSign' ? chars : chars + '\\' + p.value, '');
    return {minusSign, decimal, validCharacters, literals};
  }, [inputValueFormatter, minValue, maxValue]);
  let {minusSign, decimal, validCharacters, literals} = symbols;

  // javascript doesn't recognize NaN === NaN, so multiple onChanges will get fired if we don't ignore consecutive ones
  let lastValDispatched = useRef(NaN);
  let smartOnChange = useCallback((val) => {
    if (!isNaN(val) || !isNaN(lastValDispatched.current)) {
      onChange?.(val);
    }
    lastValDispatched.current = val;
  }, [lastValDispatched]);
  let [numberValue, setNumberValue] = useControlledState<number>(value, isNaN(defaultValue) ? NaN : defaultValue, smartOnChange);
  let tempNum = useRef<number>(NaN);
  let initialInputValue = isNaN(numberValue) ? '' : inputValueFormatter.format(numberValue);
  let [inputValue, setInputValue] = useState(initialInputValue);

  useEffect(() => {
    setInputValue(isNaN(numberValue) ? '' : inputValueFormatter.format(numberValue));
  }, [inputValueFormatter, setInputValue]);

  let textValue = inputValueFormatter.format(numberValue);

  let increment = useCallback(() => {
    setNumberValue((previousValue) => {
      // TODO: should NaN default to zero for empty fields? what about min > 0?
      let prev = previousValue;
      if (isNaN(prev)) {
        prev = 0;
      }
      if (!isNaN(tempNum.current)) {
        prev = tempNum.current;
        tempNum.current = NaN;
      }
      const newValue = clamp(
        handleDecimalOperation('+', prev, step),
        minValue,
        maxValue
      );

      if (isNaN(value)) {
        setInputValue(inputValueFormatter.format(newValue));
      }
      return newValue;
    });
  }, [setNumberValue, setInputValue, tempNum, handleDecimalOperation, inputValueFormatter, value, minValue, maxValue, step]);

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumberValue(maxValue);
      if (isNaN(value)) {
        setInputValue(inputValueFormatter.format(maxValue));
      }
    }
  }, [inputValueFormatter, maxValue, setNumberValue, value]);

  let decrement = useCallback(() => {
    setNumberValue((previousValue) => {
      let prev = previousValue;
      if (isNaN(prev)) {
        prev = 0;
      }
      if (!isNaN(tempNum.current)) {
        prev = tempNum.current;
        tempNum.current = NaN;
      }
      const newValue = clamp(
        handleDecimalOperation('-', prev, step),
        minValue,
        maxValue
      );

      if (isNaN(value)) {
        setInputValue(inputValueFormatter.format(newValue));
      }
      return newValue;
    });
  }, [setNumberValue, setInputValue, tempNum, handleDecimalOperation, inputValueFormatter, value, minValue, maxValue, step]);

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumberValue(minValue);
      if (isNaN(value)) {
        setInputValue(inputValueFormatter.format(minValue));
      }
    }
  }, [inputValueFormatter, minValue, setNumberValue, value]);

  // if too slow, use string diffing, but i doubt these will be strings THAT large
  // should i check more than just the first character matches?
  let determineNumeralSystem = (value: string): string => {
    for (let system in numberingSystems) {
      let numerals = numberingSystems[system];
      if ([...value].some(char => numerals.some(numeral => numeral === char))) {
        setCurrentNumeralSystem(system);
        return system;
      }
    }
    // TODO: how should we handle this?
    // console.log('could not determine system, defaulting to latin');
    return 'latin';
  };

  // not sure best way to go about this given that numbers can have
  // max/min sigfigs and decimals, and some of the
  // formats have defaults, like currency
  // so take the approach of formatting our value
  // then joining together the relevant parts
  // then parsing that joined result back to a number
  // this should round us as the formatter does
  let roundValueUsingFormatter = (value: number): number => {
    let parts = inputValueFormatter.formatToParts(value);
    let result = parts.map((part) => {
      switch (part.type) {
        case 'currency':
        case 'nan':
        case 'plusSign':
        case 'percentSign':
        case 'group':
        case 'infinity':
        case 'literal':
          return '';
        case 'minusSign':
        case 'decimal':
        case 'fraction':
        case 'integer':
        default:
          return part.value;
      }
    }).join('');
    return numberParser.parse(result);
  };

  let replaceAllButFirstOccurrence = (val: string, char: string) => {
    let first = val.indexOf(char);
    let prefix = val.substring(0, first + 1);
    let suffix = val.substring(first + 1).replace(char, '');
    return prefix + suffix;
  };

  let setValue = (value: string) => {
    if (value === '') {
      setNumberValue(NaN);
      setInputValue('');
      return;
    }
    let numeralSystem = determineNumeralSystem(value);

    let strippedValue = value.replace(new RegExp(`[^${minusSign}${numberingSystems[numeralSystem].join('')}${validCharacters}]`, 'g'), '');
    strippedValue = replaceAllButFirstOccurrence(strippedValue, minusSign);
    strippedValue = replaceAllButFirstOccurrence(strippedValue, decimal);

    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want -10.40 not -10.40 USD
    let newValue = numberParser.parse(strippedValue.replace(new RegExp(`[${literals}]`, 'g'), ''));
    if (!isNaN(newValue) && (newValue > maxValue || newValue < minValue)) {
      return;
    }

    // If new value is a number less than max and more than min then update the number value
    if (!isNaN(newValue) && newValue <= maxValue && newValue >= minValue) {
      let roundedValue = roundValueUsingFormatter(newValue);
      setNumberValue(roundedValue);
      tempNum.current = NaN;
    }

    setInputValue(strippedValue);
  };

  // Mostly used in onBlur event to set the input value to
  // formatted numberValue. e.g. user types `-` then blurs.
  // instead of leaving the only minus sign we set the input value back to valid value
  // sometimes this acts funny, take story and enter -10, then delete the 0 and 1 in that order, blur, it'll repopulate with -1
  let commitInputValue = () => {
    // Do nothing if input value is empty
    if (!inputValue.length) {
      return;
    }
    let clampedValue;
    if (!isNaN(tempNum.current)) {
      clampedValue = clamp(tempNum.current, minValue, maxValue);
      tempNum.current = NaN;
    } else {
      clampedValue = clamp(numberValue, minValue, maxValue);
    }
    let newValue = isNaN(clampedValue) ? '' : inputValueFormatter.format(clampedValue);
    setNumberValue(clampedValue);
    setInputValue(newValue);
  };

  return {
    setValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    value: numberValue,
    inputValue,
    commitInputValue,
    textValue: textValue === 'NaN' ? '' : textValue,
    currentNumeralSystem
  };
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

// eslint-disable-next-line jsdoc/require-description-complete-sentence
/**
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
 */
