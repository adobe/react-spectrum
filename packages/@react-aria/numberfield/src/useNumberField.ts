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

import {HTMLAttributes, useEffect} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {NumberFieldState} from '@react-stately/numberfield';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {useMessageFormatter} from '@react-aria/i18n';

interface NumberFieldProps extends SpinButtonProps {
  decrementAriaLabel?: string,
  incrementAriaLabel?: string
}

interface NumberFieldAria {
  inputFieldProps: HTMLAttributes<HTMLInputElement>,
  numberFieldProps: HTMLAttributes<HTMLDivElement>,
  incrementButtonProps: HTMLAttributes<HTMLButtonElement>,
  decrementButtonProps: HTMLAttributes<HTMLButtonElement>
}

export function useNumberField(props: NumberFieldProps, state: NumberFieldState): NumberFieldAria {
  let {
    decrementAriaLabel,
    incrementAriaLabel,
    isDisabled,
    isReadOnly,
    isRequired,
    minValue,
    maxValue,
    step
  } = props;

  let {
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    value,
    validationState
  } = state;

  const formatMessage = useMessageFormatter(intlMessages);
  const inputId = useId();

  const {spinButtonProps} = useSpinButton({
    isDisabled,
    isReadOnly,
    isRequired,
    maxValue,
    minValue,
    onIncrement: increment,
    onIncrementToMax: incrementToMax,
    onDecrement: decrement,
    onDecrementToMin: decrementToMin,
    value
  });

  incrementAriaLabel = incrementAriaLabel || formatMessage('Increment');
  decrementAriaLabel = decrementAriaLabel || formatMessage('Decrement');

  const incrementButtonProps = {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    tabIndex: -1,
    title: incrementAriaLabel,
    isDisabled: isDisabled || (value >= maxValue) || isReadOnly,
    onPress: increment,
    onMouseDown: e => e.preventDefault(),
    onMouseUp: e => e.preventDefault()
  };
  const decrementButtonProps = {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    tabIndex: -1,
    title: decrementAriaLabel,
    isDisabled: isDisabled || (value <= minValue || isReadOnly),
    onPress: decrement,
    onMouseDown: e => e.preventDefault(),
    onMouseUp: e => e.preventDefault()
  };

  useEffect(() => {
    const handleInputScrollWheel = e => {
      // If the input isn't supposed to receive input, do nothing.
      // TODO: add focus
      if (isDisabled || isReadOnly) {
        return;
      }

      e.preventDefault();
      if (e.deltaY < 0) {
        increment();
      } else {
        decrement();
      }
    };

    document.getElementById(inputId).addEventListener(
      'wheel',
      handleInputScrollWheel,
      {passive: false}
    );
    return () => {
      document.getElementById(inputId).removeEventListener(
        'wheel',
        handleInputScrollWheel
      );
    };
  }, [inputId, isReadOnly, isDisabled, decrement, increment]);

  return {
    numberFieldProps: {
      role: 'group',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid'
    },
    inputFieldProps: mergeProps(spinButtonProps, {
      autoComplete: 'off',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      id: inputId,
      isDisabled,
      isReadOnly,
      isRequired,
      min: minValue,
      max: maxValue,
      placeholder: formatMessage('Enter a number'),
      type: 'number',
      step
    }),
    incrementButtonProps,
    decrementButtonProps
  };
}
