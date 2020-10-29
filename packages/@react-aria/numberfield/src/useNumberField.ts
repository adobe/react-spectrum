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
import {clearAnnouncer} from '@react-aria/live-announcer';
import {
  HTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {NumberFieldProps} from '@react-types/numberfield';
import {NumberFieldState} from '@react-stately/numberfield';
import {useFocus, useFocusWithin} from '@react-aria/interactions';
import {useLocale, useMessageFormatter, useNumberFormatter} from '@react-aria/i18n';
import {useSpinButton} from '@react-aria/spinbutton';
import {useTextField} from '@react-aria/textfield';

/**
 * From https://github.com/filamentgroup/formcore/blob/master/js/numeric-input.js#L20.
 * Can't use this because with type="number" we can't have things like $ in the field and they just stay blank.
 */

interface NumberFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: HTMLAttributes<HTMLInputElement>,
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
    formatOptions
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

  let {focusProps} = useFocus({
    onBlur: () => {
      // Set input value to normalized valid value
      commitInputValue();
    }
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
  const canStep = isDisabled || isReadOnly;

  // pressing the stepper buttons should send focus to the input except in the case of touch
  let onPressStart = (e) => {
    if (e.pointerType !== 'virtual') {
      ref.current.focus();
    }
  };

  const incrementButtonProps: AriaButtonProps = mergeProps(incButtonProps, {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    isDisabled: canStep || value >= maxValue,
    onPressStart
  });
  const decrementButtonProps: AriaButtonProps = mergeProps(decButtonProps, {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    isDisabled: canStep || value <= minValue,
    onPressStart
  });

  let onWheel = useCallback((e) => {
    // If the input isn't supposed to receive input, do nothing.
    // If the ctrolKey is pressed, this is a zoom event, do nothing.
    // TODO: add focus
    if (isDisabled || isReadOnly || e.ctrlKey) {
      return;
    }

    let isRTL = direction === 'rtl';
    if (e.deltaY < 0 || (isRTL ? e.deltaX < 0 : e.deltaX > 0)) {
      increment();
    } else {
      decrement();
    }
  }, [isReadOnly, isDisabled, decrement, increment, direction]);

  /**
   * General outline for figuring out what to parse in on change
   * use previous formatted text that was in the input
   * new character is typed, match 'parts' from format to parts in previous text
   * the first 'part' that's an integer to the last 'part' that's an integer or fraction, minus any 'groups' should be the new number we want to parse (not sure about minus sign vs parens).
   */

  /**
   * General outline for cursor position
   * focus, select everything from first 'part' that's an integer to last 'part' that's integer or fraction
   * after typing a character, place cursor after that character, helps to know previous position, maybe get from keyup? Or maybe keydown, though not optimal
   * what happens if a selection is made and a chunk is deleted or replaced out of the number? What if it includes the currency symbol or one paren out of two used in accounting representation.
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
  let selection = useRef({selectionStart: state.inputValue.length - 1, selectionEnd: state.inputValue.length - 1, value: state.inputValue});

  useLayoutEffect(() => {
    let inTextField = selection.current.value || '';
    let newTextField = state.inputValue;
    ref.current.setSelectionRange(selection.current.selectionEnd + newTextField.length - inTextField.length, selection.current.selectionEnd + newTextField.length - inTextField.length);
  },[ref, state.inputValue, selection.current]);

  let setSelection = (e) => {
    selection.current = {
      selectionStart: e.target.selectionStart,
      selectionEnd: e.target.selectionEnd,
      value: state.inputValue
    };
  };

  /**
   * This forces a rerender if a value was entered that "changed" the input
   * we may already have that value in state and are using the clean version for display though
   * as a result we wouldn't render and the cursor would fly to the end of the string.
   */
  let [, setReRender] = useState({});
  let onChange = (e) => {
    let changed = state.setValue(e);
    if (!changed) {
      setReRender({});
    }
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
      type: 'text',
      inputMode: hasDecimals ? 'decimal' : 'numeric',
      onChange,
      onKeyDown: setSelection
    }, ref);

  const inputFieldProps = mergeProps(spinButtonProps, inputProps, focusProps, {onWheel});
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
