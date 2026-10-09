/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FormValidationState} from 'react-stately/private/form/useFormValidationState';

import {getActiveElement, getEventTarget} from '../utils/shadowdom/DOMFunctions';
import {RefObject, Validation, ValidationResult} from '@react-types/shared';
import {setInteractionModality} from '../interactions/useFocusVisible';
import {useEffect, useRef} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useLayoutEffect} from '../utils/useLayoutEffect';

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormValidationProps<T> extends Validation<T> {
  focus?: () => void;
  /**
   * Whether the field, or any part of a composite field, is currently focused.
   * Used to detect external value changes in complex components where
   * the validated input is not the visually active element.
   */
  isFocusWithin?: boolean | (() => boolean);
}

export function useFormValidation<T>(
  props: FormValidationProps<T>,
  state: FormValidationState,
  ref: RefObject<ValidatableElement | null> | undefined
): void {
  let {validationBehavior, focus, isFocusWithin} = props;
  let lastValue = useRef<string | undefined>(undefined);

  // This is a useLayoutEffect so that it runs before the useEffect in useFormValidationState, which commits the validation change.
  useLayoutEffect(() => {
    if (
      validationBehavior === 'native' &&
      ref?.current &&
      'setCustomValidity' in ref.current &&
      !ref.current.disabled
    ) {
      let currentValue = ref.current.value;
      let valueChanged = lastValue.current !== undefined && lastValue.current !== currentValue;
      lastValue.current = currentValue;

      // Clear custom validity to accurately read the raw DOM state.
      ref.current.setCustomValidity('');

      let validityDetails = getValidity(ref.current);
      let isProgrammaticViolation = validityDetails.tooLong || validityDetails.tooShort;

      // Use native validity to block form submission if constraints fail.
      // Fall back to React state for server/custom errors.
      let errorMessage = '';
      if (isProgrammaticViolation) {
        if (validityDetails.tooLong) {
          errorMessage = `Please shorten this text to ${ref.current.getAttribute('maxlength')} characters or less (you are currently using ${ref.current.value.length} characters).`;
        } else if (validityDetails.tooShort) {
          errorMessage = `Please lengthen this text to ${ref.current.getAttribute('minlength')} characters or more (you are currently using ${ref.current.value.length} characters).`;
        }
      } else if (state.realtimeValidation.isInvalid) {
        errorMessage = state.realtimeValidation.validationErrors.join(' ') || 'Invalid value.';
      }
      ref.current.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
      if (!ref.current.hasAttribute('title')) {
        ref.current.title = '';
      }

      let nativeValidity = getNativeValidity(ref.current);
      if (!state.realtimeValidation.isInvalid || isProgrammaticViolation) {
        state.updateValidation(nativeValidity);
      }

      // Commit validation immediately if the value changes while the field is unfocused.
      // This clears stale errors or displays programmatic constraint violations.
      let isFocused =
        (typeof isFocusWithin === 'function' ? isFocusWithin() : isFocusWithin) ??
        (typeof document !== 'undefined' && getActiveElement() === ref.current);

      if (valueChanged && !isFocused) {
        let isNowValid = !nativeValidity.isInvalid && !state.realtimeValidation.isInvalid;
        if (isNowValid || isProgrammaticViolation) {
          state.commitValidation();
        }
      }
    }
  });

  let isIgnoredReset = useRef(false);
  let onReset = useEffectEvent(() => {
    if (!isIgnoredReset.current) {
      state.resetValidation();
    }
  });

  let onInvalid = useEffectEvent((e: Event) => {
    // Only commit validation if we are not already displaying one.
    // This avoids clearing server errors that the user didn't actually fix.
    if (!state.displayValidation.isInvalid) {
      state.commitValidation();
    }

    // Auto focus the first invalid input in a form, unless the error already had its default prevented.
    let form = ref?.current?.form;
    if (!e.defaultPrevented && ref && form && getFirstInvalidInput(form) === ref.current) {
      if (focus) {
        focus();
      } else {
        ref.current?.focus();
      }

      // Always show focus ring.
      setInteractionModality('keyboard');
    }

    // Prevent default browser error UI from appearing.
    e.preventDefault();
  });

  let onChange = useEffectEvent(() => {
    state.commitValidation();
  });

  useEffect(() => {
    let input = ref?.current;
    if (!input) {
      return;
    }

    let form = input.form;

    let reset = form?.reset;
    if (form) {
      // Try to detect React's automatic form reset behavior so we don't clear
      // validation errors that are returned by server actions.
      // To do this, we ignore programmatic form resets that occur outside a user event.
      // This is best-effort. There may be false positives, e.g. setTimeout.
      // oxlint-disable-next-line react/react-compiler
      form.reset = () => {
        // React uses MessageChannel for scheduling, so ignore 'message' events.
        isIgnoredReset.current =
          !window.event ||
          (window.event.type === 'message' && getEventTarget(window.event) instanceof MessagePort);
        reset?.call(form);
        isIgnoredReset.current = false;
      };
    }

    // 'change' and 'reset' do not compose across shadow DOM boundaries, but these listeners are
    // intentionally scoped to this specific input/form element (not a global target), so shadow
    // root propagation does not apply here.
    input.addEventListener('invalid', onInvalid);
    // oxlint-disable-next-line rsp-rules/no-non-composing-event-listener
    input.addEventListener('change', onChange);
    // oxlint-disable-next-line rsp-rules/no-non-composing-event-listener
    form?.addEventListener('reset', onReset);
    return () => {
      input!.removeEventListener('invalid', onInvalid);
      input!.removeEventListener('change', onChange);
      form?.removeEventListener('reset', onReset);
      if (form) {
        // @ts-ignore
        form.reset = reset;
      }
    };
  }, [ref, validationBehavior]);
}

function getValidity(input: ValidatableElement) {
  // The native ValidityState object is live, meaning each property is a getter that returns the current state.
  // We need to create a snapshot of the validity state at the time this function is called to avoid unpredictable React renders.
  let validity = input.validity;

  // Polyfill: Native DOM ignores programmatic maxLength violations.
  let tooLong = validity.tooLong;
  let maxLength = input.getAttribute('maxlength');
  if (maxLength !== null && input.value.length > parseInt(maxLength, 10)) {
    tooLong = true;
  }

  // Polyfill: Native DOM ignores programmatic minLength violations.
  // Note: minLength only applies if the value is not empty.
  let tooShort = validity.tooShort;
  let minLength = input.getAttribute('minlength');
  if (
    minLength !== null &&
    input.value.length > 0 &&
    input.value.length < parseInt(minLength, 10)
  ) {
    tooShort = true;
  }

  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: tooLong,
    tooShort: tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid && !tooLong && !tooShort
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  let validityDetails = getValidity(input);
  let isInvalid = !validityDetails.valid;

  let validationMessage = input.validationMessage;

  // Fallback for our polyfills since the native DOM doesn't generate a message for programmatic errors.
  if (isInvalid && !validationMessage) {
    if (validityDetails.tooLong) {
      validationMessage = `Please shorten this text to ${input.getAttribute('maxlength')} characters or less (you are currently using ${input.value.length} characters).`;
    } else if (validityDetails.tooShort) {
      validationMessage = `Please lengthen this text to ${input.getAttribute('minlength')} characters or more (you are currently using ${input.value.length} characters).`;
    }
  }

  return {
    isInvalid: isInvalid,
    validationDetails: validityDetails,
    validationErrors: validationMessage ? [validationMessage] : []
  };
}

function getFirstInvalidInput(form: HTMLFormElement): ValidatableElement | null {
  for (let i = 0; i < form.elements.length; i++) {
    let element = form.elements[i] as ValidatableElement;
    if (element.validity?.valid === false) {
      return element;
    }
  }

  return null;
}
