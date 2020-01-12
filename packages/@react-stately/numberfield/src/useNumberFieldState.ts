import {clamp} from '@react-aria/utils';
import {useCallback, useRef, useState} from 'react';

export interface NumberFieldState {
  setValue: (val: string, ...args: any) => void,
  onIncrement: (...args: any) => void,
  onDecrement: (...args: any) => void,
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

  let isValid = useRef(true);
  let [numValue, setNumValue] = useState(value || defaultValue || '');

  let triggerChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  let increment = () => {
    setNumValue(previousValue => {
      let newValue = +previousValue;
      if (isNaN(newValue)) {
        newValue = maxValue != null ? Math.min(step, maxValue) : step;
      } else {
        newValue = clamp(handleDecimalOperation('+', newValue, step), minValue, maxValue);
      }
      if (previousValue !== newValue) {
        triggerChange(newValue);
      }
      return newValue;
    });
  };

  let incrementToMax = () => {
    if (maxValue != null) {
      triggerChange(maxValue);
      setNumValue(maxValue);
    }
  };

  let decrement = () => {
    setNumValue(previousValue => {
      let newValue = +previousValue;
      if (isNaN(newValue)) {
        newValue = minValue != null ? Math.max(-step, minValue) : -step;
      } else {
        newValue = clamp(handleDecimalOperation('-', newValue, step), minValue, maxValue);
      }
      if (previousValue !== newValue) {
        triggerChange(newValue);
      }
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
      triggerChange(valueAsNumber);
      setNumValue(valueAsNumber);
    }
  };

  return {
    setValue,
    onIncrement: useCallback(increment, [maxValue, minValue, step]),
    incrementToMax,
    onDecrement: useCallback(decrement, [maxValue, minValue, step]),
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
