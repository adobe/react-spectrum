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
  useEffect,
  useMemo,
  useRef
} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isAndroid, isIOS, isIPhone, mergeProps, useId} from '@react-aria/utils';
import {NumberFieldState} from '@react-stately/numberfield';
import {SpinButtonProps, useSpinButton} from '@react-aria/spinbutton';
import {TextInputDOMProps} from '@react-types/shared';
import {useFocus} from '@react-aria/interactions';
import {
  useMessageFormatter,
  useNumberFormatter
} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

interface NumberFieldProps extends AriaNumberFieldProps, SpinButtonProps {
  inputRef?:  RefObject<HTMLInputElement>,
  decrementAriaLabel?: string,
  incrementAriaLabel?: string
}

interface NumberFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: InputHTMLAttributes<HTMLInputElement>,
  numberFieldProps: HTMLAttributes<HTMLDivElement>,
  incrementButtonProps: AriaButtonProps,
  decrementButtonProps: AriaButtonProps
}

function supportsNativeBeforeInputEvent() {
  return typeof window !== 'undefined' &&
    window.InputEvent &&
    // @ts-ignore
    typeof InputEvent.prototype.getTargetRanges === 'function';
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

  const inputId = useId();

  let {focusProps} = useFocus({
    onBlur: () => {
      // Set input value to normalized valid value
      commitInputValue();
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
      value: numberValue,
      textValue: state.inputValue
    }
  );

  let onButtonPressStart = (e) => {
    // If focus is already on the input, keep it there so we don't hide the
    // software keyboard when tapping the increment/decrement buttons.
    if (document.activeElement === inputRef.current) {
      return;
    }

    // Otherwise, when using a mouse, move focus to the input.
    // On touch, or with a screen reader, focus the button so that the software
    // keyboard does not appear and the screen reader cursor is not moved off the button.
    if (e.pointerType === 'mouse') {
      inputRef.current.focus();
    } else {
      e.target.focus();
    }
  };

  incrementAriaLabel = incrementAriaLabel || formatMessage('Increment');
  decrementAriaLabel = decrementAriaLabel || formatMessage('Decrement');

  const incrementButtonProps: AriaButtonProps = mergeProps(incButtonProps, {
    'aria-label': incrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    isDisabled: !state.canIncrement,
    onPressStart: onButtonPressStart
  });

  const decrementButtonProps: AriaButtonProps = mergeProps(decButtonProps, {
    'aria-label': decrementAriaLabel,
    'aria-controls': inputId,
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    isDisabled: !state.canDecrement,
    onPressStart: onButtonPressStart
  });

  let onWheel = useCallback((e) => {
    // If the input isn't supposed to receive input, do nothing.
    // If the ctrlKey is pressed, this is a zoom event, do nothing.
    if (isDisabled || isReadOnly || e.ctrlKey) {
      return;
    }

    // stop scrolling the page
    e.preventDefault();

    if (e.deltaY > 0) {
      increment();
    } else if (e.deltaY < 0) {
      decrement();
    }
  }, [isReadOnly, isDisabled, decrement, increment]);
  useScrollWheel({onScroll: onWheel, capture: false}, inputRef);

  // The inputMode attribute influences the software keyboard that is shown on touch devices.
  // Browsers and operating systems are quite inconsistent about what keys are available, however.
  // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
  // and based on testing on various devices to determine what keys are available in each inputMode.
  let numberFormatter = useNumberFormatter(formatOptions);
  let intlOptions = useMemo(() => numberFormatter.resolvedOptions(), [numberFormatter]);
  let hasDecimals = intlOptions.maximumFractionDigits > 0;
  let hasNegative = isNaN(state.minValue) || state.minValue < 0;
  let inputMode: TextInputDOMProps['inputMode'] = 'numeric';
  if (isIPhone()) {
    // iPhone doesn't have a minus sign in either numeric or decimal.
    // Note this is only for iPhone, not iPad, which always has both
    // minus and decimal in numeric.
    if (hasNegative) {
      inputMode = 'text';
    } else if (hasDecimals) {
      inputMode = 'decimal';
    }
  } else if (isAndroid()) {
    // Android numeric has both a decimal point and minus key.
    // decimal does not have a minus key.
    if (hasNegative) {
      inputMode = 'numeric';
    } else if (hasDecimals) {
      inputMode = 'decimal';
    }
  }

  let stateRef = useRef(state);
  stateRef.current = state;

  // All browsers implement the 'beforeinput' event natively except Firefox
  // (currently behind a flag as of Firefox 84). React's polyfill does not
  // run in all cases that the native event fires, e.g. when deleting text.
  // Use the native event if available so that we can prevent invalid deletions.
  // We do not attempt to polyfill this in Firefox since it would be very complicated,
  // the benefit of doing so is fairly minor, and it's going to be natively supported soon.
  useEffect(() => {
    if (!supportsNativeBeforeInputEvent()) {
      return;
    }

    let input = inputRef.current;

    let onBeforeInput = (e: InputEvent) => {
      let state = stateRef.current;

      // Compute the next value of the input if the event is allowed to proceed.
      // See https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes for a full list of input types.
      let nextValue: string;
      switch (e.inputType) {
        case 'historyUndo':
        case 'historyRedo':
          // Explicitly allow undo/redo. e.data is null in this case, but there's no need to validate,
          // because presumably the input would have already been validated previously.
          return;
        case 'deleteContent':
        case 'deleteByCut':
        case 'deleteByDrag':
          nextValue = input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);
          break;
        case 'deleteContentForward':
          // This is potentially incorrect, since the browser may actually delete more than a single UTF-16
          // character. In reality, a full Unicode grapheme cluster consisting of multiple UTF-16 characters
          // or code points may be deleted. However, in our currently supported locales, there are no such cases.
          // If we support additional locales in the future, this may need to change.
          nextValue = input.selectionEnd === input.selectionStart
            ? input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd + 1)
            : input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);
          break;
        case 'deleteContentBackward':
          nextValue = input.selectionEnd === input.selectionStart
            ? input.value.slice(0, input.selectionStart - 1) + input.value.slice(input.selectionStart)
            : input.value.slice(0, input.selectionStart) + input.value.slice(input.selectionEnd);
          break;
        default:
          if (e.data != null) {
            nextValue =
              input.value.slice(0, input.selectionStart) +
              e.data +
              input.value.slice(input.selectionEnd);
          }
          break;
      }

      // If we did not compute a value, or the new value is invalid, prevent the event
      // so that the browser does not update the input text, move the selection, or add to
      // the undo/redo stack.
      if (nextValue == null || !state.validate(nextValue)) {
        e.preventDefault();
      }
    };

    input.addEventListener('beforeinput', onBeforeInput, false);
    return () => {
      input.removeEventListener('beforeinput', onBeforeInput, false);
    };
  }, [inputRef, stateRef]);

  let onBeforeInput = !supportsNativeBeforeInputEvent()
    ? e => {
      let nextValue =
        e.target.value.slice(0, e.target.selectionStart) +
        e.data +
        e.target.value.slice(e.target.selectionEnd);

      if (!state.validate(nextValue)) {
        e.preventDefault();
      }
    }
    : null;

  let onChange = value => {
    state.setInputValue(value);
  };

  let compositionStartState = useRef(null);
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
      type: 'text', // Can't use type="number" because then we can't have things like $ in the field.
      inputMode,
      onChange,
      onBeforeInput,
      onCompositionStart() {
        // Chrome does not implement Input Events Level 2, which specifies the insertFromComposition
        // and deleteByComposition inputType values for the beforeinput event. These are meant to occur
        // at the end of a composition (e.g. Pinyin IME, Android auto correct, etc.), and crucially, are
        // cancelable. The insertCompositionText and deleteCompositionText input types are not cancelable,
        // nor would we want to cancel them because the input from the user is incomplete at that point.
        // In Safari, insertFromComposition/deleteFromComposition will fire, however, allowing us to cancel
        // the final composition result if it is invalid. As a fallback for Chrome and Firefox, which either
        // don't support Input Events Level 2, or beforeinput at all, we store the state of the input when
        // the compositionstart event fires, and undo the changes in compositionend (below) if it is invalid.
        // Unfortunately, this messes up the undo/redo stack, but until insertFromComposition/deleteByComposition
        // are implemented, there is no other way to prevent composed input.
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=1022204
        let {value, selectionStart, selectionEnd} = inputRef.current;
        compositionStartState.current = {value, selectionStart, selectionEnd};
      },
      onCompositionEnd() {
        if (!state.validate(inputRef.current.value)) {
          // Restore the input value in the DOM immediately so we can synchronously update the selection position.
          // But also update the value in React state as well so it is correct for future updates.
          let {value, selectionStart, selectionEnd} = compositionStartState.current;
          inputRef.current.value = value;
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
          state.setInputValue(value);
        }
      }
    }, inputRef);

  const inputFieldProps = mergeProps(
    spinButtonProps,
    inputProps,
    focusProps,
    {
      // override the spinbutton role, we can't focus a spin button with VO
      role: null,
      // ignore aria-roledescription on iOS so that required state will announce when it is present
      'aria-roledescription': (!isIOS() ? formatMessage('Number field') : null),
      'aria-valuemax': null,
      'aria-valuemin': null,
      'aria-valuenow': null,
      'aria-valuetext': null,
      autoCorrect: 'off',
      spellCheck: 'false'
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

// scroll wheel needs to be added not passively so it's cancelable, small helper hook to remember that
function useScrollWheel({onScroll, capture}: {onScroll: (e) => void, capture: boolean}, ref: RefObject<HTMLElement>) {
  useEffect(() => {
    let elem = ref.current;
    elem.addEventListener('wheel', onScroll, capture);

    return () => {
      elem.removeEventListener('wheel', onScroll, capture);
    };
  }, [onScroll, ref, capture]);
}
