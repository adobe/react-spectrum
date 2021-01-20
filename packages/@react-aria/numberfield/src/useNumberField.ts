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

import {AriaButtonProps} from '@react-types/button';
import {AriaNumberFieldProps} from '@react-types/numberfield';
import {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
  useCallback,
  useMemo,
  useRef
} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {NumberFieldState} from '@react-stately/numberfield';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {useFocus} from '@react-aria/interactions';
import {
  useLocale,
  useMessageFormatter,
  useNumberFormatter
} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

interface NumberFieldProps extends AriaNumberFieldProps, SpinButtonProps {
  inputRef?:  RefObject<HTMLInputElement>,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string,
  incrementRef?: RefObject<HTMLDivElement>,
  decrementRef?: RefObject<HTMLDivElement>
}

interface NumberFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: InputHTMLAttributes<HTMLInputElement>,
  numberFieldProps: HTMLAttributes<HTMLDivElement>,
  incrementButtonProps: AriaButtonProps,
  decrementButtonProps: AriaButtonProps
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
    autoFocus,
    validationState,
    label,
    formatOptions,
    incrementRef,
    decrementRef,
    inputRef
  } = props;

  let {
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    numberValue,
    commitInputValue
  } = state;

  const formatMessage = useMessageFormatter(intlMessages);
  let {direction} = useLocale();

  const inputId = useId();

  let isFocused = useRef(false);
  let {focusProps} = useFocus({
    onBlur: (e) => {
      let incrementButton = incrementRef.current;
      let decrementButton = decrementRef.current;
      if ((incrementButton && decrementButton) && (e.relatedTarget === incrementButton || e.relatedTarget === decrementButton)) {
        return;
      }
      // Set input value to normalized valid value
      commitInputValue();
    },
    onFocusChange: value => isFocused.current = value
  });

  const {
    spinButtonProps,
    incrementButtonProps: incButtonProps,
    decrementButtonProps: decButtonProps
  } = useSpinButton(
    {
      isDisabled,
      isReadOnly,
      isRequired,
      // Use min/maxValue prop instead of stately.
      maxValue,
      minValue,
      onIncrement: increment,
      onIncrementToMax: incrementToMax,
      onDecrement: decrement,
      onDecrementToMin: decrementToMin,
      value: numberValue
    }
  );

  incrementAriaLabel = incrementAriaLabel || formatMessage('Increment');
  decrementAriaLabel = decrementAriaLabel || formatMessage('Decrement');
  const cannotStep = isDisabled || isReadOnly;

  const incrementButtonProps: AriaButtonProps = mergeProps(incButtonProps, {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    // use state min/maxValue because otherwise in default story, steppers will never disable
    isDisabled: cannotStep || numberValue >= state.maxValue
  });
  const decrementButtonProps: AriaButtonProps = mergeProps(decButtonProps, {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    isDisabled: cannotStep || numberValue <= state.minValue
  });

  let onWheel = useCallback((e) => {
    // If the input isn't supposed to receive input, do nothing.
    // If the ctrlKey is pressed, this is a zoom event, do nothing.
    if (isDisabled || isReadOnly || e.ctrlKey) {
      return;
    }

    // stop scrolling the page
    e.preventDefault();

    let isRTL = direction === 'rtl';
    if (e.deltaY > 0 || (isRTL ? e.deltaX < 0 : e.deltaX > 0)) {
      increment();
    } else {
      decrement();
    }
  }, [isReadOnly, isDisabled, decrement, increment, direction]);

  /**
   * This block determines the inputMode, if hasDecimal then 'decimal', otherwise 'numeric'.
   * This will affect the software keyboard that is shown. 'decimal' has a decimal character on the keyboard
   * and 'numeric' does not.
   */
  let numberFormatter = useNumberFormatter(formatOptions);
  let intlOptions = useMemo(() => numberFormatter.resolvedOptions(), [numberFormatter]);
  let hasDecimals = intlOptions.maximumFractionDigits > 0;
  let inputMode: 'decimal' | 'numeric' | 'text' = hasDecimals ? 'decimal' : 'numeric';
  if (state.minValue < 0) { // iOS - neither allows negative signs, so use full keyboard
    inputMode = 'text';
  }

  let onBeforeInput = e => {
    let nextValue =
      e.target.value.slice(0, e.target.selectionStart) +
      e.data +
      e.target.value.slice(e.target.selectionEnd);

    if (!state.validate(nextValue)) {
      e.preventDefault();
    }
  };

  let onChange = value => {
    state.setInputValue(value);
  };

  let {labelProps, inputProps} = useTextField(
    {
      label,
      autoFocus,
      isDisabled,
      isReadOnly,
      isRequired,
      validationState,
      value: state.inputValue,
      autoComplete: 'off',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      id: inputId,
      placeholder: formatMessage('Enter a number'),
      type: 'text', // Can't use type="number" because then we can't have things like $ in the field.
      inputMode,
      onChange,
      onBeforeInput
    }, inputRef);

  const inputFieldProps = mergeProps(
    spinButtonProps,
    inputProps,
    focusProps,
    {
      onWheel,
      // override the spinbutton role, we can't focus a spin button with VO
      role: null,
      'aria-roledescription': formatMessage('Spin button number field'),
      'aria-valuemax': null,
      'aria-valuemin': null,
      'aria-valuenow': null,
      'aria-valuetext': null
    }
  );
  return {
    numberFieldProps: {
      role: 'group',
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid' ? 'true' : undefined
    },
    labelProps,
    inputFieldProps,
    incrementButtonProps,
    decrementButtonProps
  };
}
