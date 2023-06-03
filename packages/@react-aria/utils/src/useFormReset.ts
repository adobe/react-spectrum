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
import { Validation, ValidationState } from '@react-types/shared';
import {ReactNode, RefObject, useEffect, useRef, useState} from 'react';
import {useEffectEvent} from './useEffectEvent';

export function useFormReset<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  initialValue: T,
  onReset: (value: T) => void
) {
  let resetValue = useRef(initialValue);
  let handleReset = useEffectEvent(() => {
    if (onReset) {
      onReset(resetValue.current);
    }
  });

  useEffect(() => {
    ref?.current?.form?.addEventListener('reset', handleReset);
    return () => {
      ref?.current?.form?.removeEventListener('reset', handleReset);
    }
  }, [ref, handleReset]);
}

export interface FormValidationResult {
  validationState: ValidationState,
  errorMessage: ReactNode,
  validationDetails: ValidityState
}

export function useFormValidation(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  validationState: ValidationState,
  errorMessage: ReactNode,
  validationBehavior: 'native' | 'aria'
): FormValidationResult {
  useEffect(() => {
    if (validationBehavior === 'native') {
      // Use the provided error message if available, otherwise use a default string.
      // This is usually not shown to the user because there is often a custom UI for error messages,
      // but it is required to mark the input as invalid and prevent form submission.
      let error = validationState === 'invalid'
        ? (typeof errorMessage === 'string' && errorMessage ? errorMessage : 'Invalid value.')
        : '';
      ref.current?.setCustomValidity(error);
    }
  }, [validationBehavior, validationState, errorMessage]);

  return useInputValidity(ref, validationState, errorMessage, validationBehavior);
}

export interface InputValidity {
  validity: ValidityState,
  validationMessage: string
}

const DEFAULT_VALIDITY = {
  validity: {
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valueMissing: false,
    valid: true
  },
  validationMessage: ''
};

function getValidity(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
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

export function useInputValidity(
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  validationState: ValidationState,
  errorMessage: ReactNode,
  validationBehavior: 'native' | 'aria'
): FormValidationResult {
  let [{validity, validationMessage}, setValidation] = useState<InputValidity>(DEFAULT_VALIDITY);

  useEffect(() => {
    if (!inputRef || validationBehavior !== 'native') return;

    let input = inputRef.current;
    let form = input.form;
    let onInvalid = (e: InputEvent) => {
      e.preventDefault();
      setValidation({
        validity: getValidity(input),
        validationMessage: input.validationMessage
      });
    };

    let onChange = (e) => {
      if (input.validity.valid) {
        setValidation(validation => {
          if (validation.validity.valid) {
            return validation;
          }

          return {
            validity: getValidity(input),
            validationMessage: input.validationMessage
          };
        });
      }
    };

    let onReset = () => {
      setValidation(DEFAULT_VALIDITY);
    };

    input.addEventListener('invalid', onInvalid);
    form?.addEventListener('change', onChange);
    form?.addEventListener('focusout', onChange);
    form?.addEventListener('reset', onReset);
    return () => {
      input.removeEventListener('invalid', onInvalid);
      form?.removeEventListener('change', onChange);
      form?.removeEventListener('focusout', onChange);
      form?.removeEventListener('reset', onReset);
    };
  }, [inputRef, validationBehavior]);

  if (!validationState && !validity.valid && !validity.customError) {
    // Use native error unless a custom one is provided.
    validationState = 'invalid';
    errorMessage = validationMessage;
  }

  return {
    validationState,
    errorMessage,
    validationDetails: validity
  };
}
