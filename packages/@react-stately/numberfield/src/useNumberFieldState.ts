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
import {useCallback, useMemo, useRef, useState} from 'react';
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
  let {minValue = -Infinity, maxValue = Infinity, step = 1, formatOptions, value, defaultValue, onChange} = props;
  let [currentNumeralSystem, setCurrentNumeralSystem] = useState('latin');

  let numberParser = useNumberParser();
  let inputValueFormatter = useNumberFormatter(formatOptions);

  let symbols = useMemo(() => {
    // Get the minus sign of the current locale to filter the input value
    // Automatically updates the minus sign when numberFormatter changes
    // won't work for currency accounting, what to do
    let minusSign = inputValueFormatter.formatToParts(-11).find(p => p.type === 'minusSign').value;
    let decimal = inputValueFormatter.formatToParts(1.1).find(p => p.type === 'decimal').value;
    return {minusSign, decimal};
  }, [inputValueFormatter]);
  let minusSign = symbols.minusSign;
  let decimal = symbols.decimal;

  let [numberValue, setNumberValue] = useControlledState<number>(value, isNaN(defaultValue) ? NaN : defaultValue, onChange);
  let tempNum = useRef<number>(NaN);
  let initialInputValue = isNaN(numberValue) ? '' : inputValueFormatter.format(numberValue);
  let [inputValue, setInputValue] = useState(initialInputValue);

  let textValue = inputValueFormatter.format(numberValue);

  let increment = () => {
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

      setInputValue(inputValueFormatter.format(newValue));
      return newValue;
    });
  };

  let incrementToMax = useCallback(() => {
    if (maxValue != null) {
      setNumberValue(maxValue);
      setInputValue(inputValueFormatter.format(maxValue));
    }
  }, [inputValueFormatter, maxValue, setNumberValue]);

  let decrement = () => {
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

      setInputValue(inputValueFormatter.format(newValue));
      return newValue;
    });
  };

  let decrementToMin = useCallback(() => {
    if (minValue != null) {
      setNumberValue(minValue);
      setInputValue(inputValueFormatter.format(minValue));
    }
  }, [inputValueFormatter, minValue, setNumberValue]);

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
  }

  // if minus sign or parens is typed, auto switch the sign?
  // take some inspiration from datepicker to display parts?
  let setValue = (value: string) => {
    if (value === '') {
      setNumberValue(NaN);
      setInputValue('');
      return;
    }
    let numeralSystem = determineNumeralSystem(value);
    let strippedValue = value.replace(new RegExp(`[^${minusSign}${numberingSystems[numeralSystem].join('')}${decimal}]`), '');
    const newValue = numberParser.parse(strippedValue);

    // If new value is a number less than max and more than min then update the number value
    if (!isNaN(newValue) && newValue < maxValue && newValue > minValue) {
      let roundedValue = roundValueUsingFormatter(newValue)
      setNumberValue(roundedValue);
      tempNum.current = NaN;
    } else if (!isNaN(newValue)) {
      tempNum.current = newValue;
    }

    // Update the input value if value:
    // 1) is not NaN or
    // 2) is equal to minus sign or
    // 3) is empty
    if (!isNaN(newValue) || value === minusSign  || value.length === 0) {
      setInputValue(value);
    }
  };

  // Mostly used in onBlur event to set the input value to
  // formatted numberValue. e.g. user types `-` then blurs.
  // instead of leaving the only minus sign we set the input value back to valid value
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
    let newValue = inputValueFormatter.format(clampedValue);
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
