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

import {FormValidationState} from '@react-stately/form';
import {RefObject, Validation, ValidationResult} from '@react-types/shared';
import {setInteractionModality} from '@react-aria/interactions';
import {useEffect} from 'react';
import {useEffectEvent, useLayoutEffect} from '@react-aria/utils';

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface FormValidationProps<T> extends Validation<T> {
  focus?: () => void
}

export function useFormValidation<T>(props: FormValidationProps<T>, state: FormValidationState, ref: RefObject<ValidatableElement | null> | undefined) {
  let {validationBehavior, focus} = props;

  // This is a useLayoutEffect so that it runs before the useEffect in useFormValidationState, which commits the validation change.
  useLayoutEffect(() => {
    if (validationBehavior === 'native' && ref?.current && !ref.current.disabled) {
      let errorMessage = state.realtimeValidation.isInvalid ? state.realtimeValidation.validationErrors.join(' ') || 'Invalid value.' : '';
      ref.current.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
      if (!ref.current.hasAttribute('title')) {
        ref.current.title = '';
      }

      if (!state.realtimeValidation.isInvalid) {
        state.updateValidation(getNativeValidity(ref.current));
      }
    }
  });

  let onReset = useEffectEvent(() => {
    state.resetValidation();
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
    input.addEventListener('invalid', onInvalid);
    input.addEventListener('change', onChange);
    form?.addEventListener('reset', onReset);
    return () => {
      input!.removeEventListener('invalid', onInvalid);
      input!.removeEventListener('change', onChange);
      form?.removeEventListener('reset', onReset);
    };
  }, [ref, onInvalid, onChange, onReset, validationBehavior]);
}

function getValidity(input: ValidatableElement) {
  // The native ValidityState object is live, meaning each property is a getter that returns the current state.
  // We need to create a snapshot of the validity state at the time this function is called to avoid unpredictable React renders.
  let validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : []
  };
}

function getFirstInvalidInput(form: HTMLFormElement): ValidatableElement | null {
  for (let i = 0; i < form.elements.length; i++) {
    let element = form.elements[i] as ValidatableElement;
    if (!element.validity.valid) {
      return element;
    }
  }

  return null;
}
