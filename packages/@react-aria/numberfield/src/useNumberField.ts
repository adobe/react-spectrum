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
import {clearAnnouncer} from '@react-aria/live-announcer';
import {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {NumberFieldState} from '@react-stately/numberfield';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {useFocus, useFocusWithin} from '@react-aria/interactions';
import {useLocale, useMessageFormatter, useNumberFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

interface NumberFieldProps extends AriaNumberFieldProps, SpinButtonProps {
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

export function useNumberField(props: NumberFieldProps, state: NumberFieldState, ref: RefObject<HTMLInputElement>): NumberFieldAria {
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
    decrementRef
  } = props;

  let {
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
    value,
    commitInputValue,
    textValue
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

  let [isFocusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setFocusWithin,
    onBlurWithin: () => {
      clearAnnouncer('assertive');
    }
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
      // use prop min/maxValue so that aria doesn't read off huge numbers in default case
      maxValue,
      minValue,
      onIncrement: increment,
      onIncrementToMax: incrementToMax,
      onDecrement: decrement,
      onDecrementToMin: decrementToMin,
      value,
      textValue
    }
  );

  useEffect(() => {
    // if the focus is within the numberfield and it's not the input, then it's on one of the buttons
    // if the value is at the boundary min/max, then move the focus back to the input because the button
    // they are on has become disabled
    if (isFocusWithin && ref.current && document.activeElement !== ref.current) {
      if (value <= minValue || value >= maxValue) {
        ref.current.focus();
      }
    }
  }, [isFocusWithin, ref, value, minValue, maxValue]);

  incrementAriaLabel = incrementAriaLabel || formatMessage('Increment');
  decrementAriaLabel = decrementAriaLabel || formatMessage('Decrement');
  const cannotStep = isDisabled || isReadOnly;

  // pressing the stepper buttons should send focus to the input except in the case of touch
  // so that pressing and holding on the steppers will auto step after a delay
  let onPressStart = (e) => {
    if (e.pointerType !== 'virtual') {
      ref.current.focus();
    }
  };

  const incrementButtonProps: AriaButtonProps = mergeProps(incButtonProps, {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    // use state min/maxValue because otherwise in default story, steppers will never disable
    isDisabled: cannotStep || value >= state.maxValue,
    onPressStart
  });
  const decrementButtonProps: AriaButtonProps = mergeProps(decButtonProps, {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    isDisabled: cannotStep || value <= state.minValue,
    onPressStart
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

  /**
   * Selection is to track where the cursor is in the input so we can restore that position + some offset after render.
   * The reason we have to do this is because the user is not as limited when the field is empty, the set of allowed characters
   * is at the maximum amount. Once a user enters a numeral, we determine the system and close off the allowed set.
   * This means we can't block the values before they make it to state and cause a render, thereby moving selection to an
   * undesirable location.
   */
  let selection = useRef({selectionStart: state.inputValue.length, selectionEnd: state.inputValue.length, value: state.inputValue, forward: false});

  /**
   * This forces a rerender if a value was entered that "changed" the input
   * we may already have that value in state and are using the clean version for display though
   * as a result we wouldn't render and the cursor would fly to the end of the string.
   * Example: start with '$10.00' in the input, place cursor after `1`, type an invalid character
   * 'a', the text field looks the same, but without this, the cursor will move the end.
   */
  let [isReRender, setReRender] = useState({});
  let onChange = (e) => {
    let changed = state.setValue(e);
    if (!changed) {
      setReRender({});
    }
  };

  useEffect(() => {
    // Used to make sure we don't try to set selection if the cursor isn't in the field. It causes Safari to autofocus the field.
    if (!isFocused.current) {
      return;
    }
    let inTextField = selection.current.value || '';
    let newTextField = state.inputValue;
    if (selection.current.forward) {
      ref.current.setSelectionRange(
        selection.current.selectionStart,
        selection.current.selectionStart
      );
    } else {
      ref.current.setSelectionRange(
        selection.current.selectionEnd + newTextField.length - inTextField.length,
        selection.current.selectionEnd + newTextField.length - inTextField.length
      );
    }
  }, [ref, state.inputValue, selection, isFocused, isReRender]);

  /**
   * The Delete key is special, it removes the character in front of it, we need to take note of which direction we're affecting
   * characters.
   */
  let setSelection = (e) => {
    let forward = false;
    if (e.key === 'Delete') {
      forward = true;
    }
    selection.current = {
      selectionStart: e.target.selectionStart,
      selectionEnd: e.target.selectionEnd,
      value: state.inputValue,
      forward
    };
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
      inputMode: hasDecimals ? 'decimal' : 'numeric',
      onChange,
      onKeyDown: setSelection,
      onPaste: setSelection
    }, ref);

  const inputFieldProps = mergeProps(
    spinButtonProps,
    inputProps,
    focusProps,
    {
      onWheel,
      // override the spinbutton role, we can't focus a spin button with VO
      role: 'textfield',
      'aria-roledescription': formatMessage('Spin button number field')
    }
  );
  return {
    numberFieldProps: {
      role: 'group',
      'aria-disabled': isDisabled,
      'aria-invalid': validationState === 'invalid' ? 'true' : undefined,
      ...focusWithinProps
    },
    labelProps,
    inputFieldProps,
    incrementButtonProps,
    decrementButtonProps
  };
}
