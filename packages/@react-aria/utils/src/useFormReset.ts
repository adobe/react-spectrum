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
import {ExternalValidationState, FormValidationEvent, ValidationState, ValidationStateProp} from '@react-types/shared';
import {ReactNode, RefObject, useEffect, useMemo, useRef, useState} from 'react';
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
    let form = ref?.current?.form;
    form?.addEventListener('reset', handleReset);
    return () => {
      form?.removeEventListener('reset', handleReset);
    };
  }, [ref, handleReset]);
}

export interface FormValidationResult {
  /** The validation state of the input. */
  validationState: ValidationState,
  /** The form validation error message for the input. */
  errorMessage: ReactNode,
  /** The native form validation details for the input element. */
  validationDetails: ValidityState
}

export function useFormValidation<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  validationState: ValidationStateProp<T>,
  errorMessage: ReactNode,
  validationBehavior: 'native' | 'aria',
  value: T,
  onValidationChange?: (value: FormValidationEvent) => void
): FormValidationResult {
  let [currentValidationState, currentErrorMessage] = useMemo(() => {
    if (typeof validationState === 'function') {
      return [validationState(value), errorMessage];
    } else if (typeof validationState === 'object') {
      let error = validationState.validate(value);
      return [error ? 'invalid' : undefined, error];
    } else {
      return [validationState, errorMessage];
    }
  }, [validationState, value, errorMessage]);
  useEffect(() => {
    if (validationBehavior === 'native') {
      // Use the provided error message if available, otherwise use a default string.
      // This is usually not shown to the user because there is often a custom UI for error messages,
      // but it is required to mark the input as invalid and prevent form submission.
      let error = '';
      if (currentValidationState === 'invalid') {
        error = typeof currentErrorMessage === 'string' && currentErrorMessage ? currentErrorMessage : 'Invalid value.';
      }
      ref.current?.setCustomValidity(error);
    }
  }, [validationBehavior, currentValidationState, currentErrorMessage, ref]);

  let [result, setValidity] = useFormValidationState(validationState, errorMessage, validationBehavior, value);
  useInputValidity(validationBehavior === 'native' ? ref : null, (validity) => {
    setValidity(validity);
    if (onValidationChange) {
      onValidationChange({
        isInvalid: !validity.validationDetails.valid,
        errorMessage: validity.errorMessage,
        validationDetails: validity.validationDetails
      });
    }
  });

  return result;
}

interface InputValidity {
  validationDetails: ValidityState,
  errorMessage: string
}

const DEFAULT_VALIDITY: InputValidity = {
  validationDetails: {
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
  errorMessage: ''
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

function isEqual(a: ValidityState, b: ValidityState) {
  for (let key in a) {
    if (b[key] !== a[key]) {
      return false;
    }
  }

  return true;
}

function useInputValidity(
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  onValidationChange?: (value: InputValidity) => void
) {
  let validation = useRef(DEFAULT_VALIDITY);
  let updateValidation = useEffectEvent((newValidation: InputValidity) => {
    // Ignore custom errors. We don't want events for these.
    // if (newValidation.validationDetails.customError) {
    //   return;
    // }

    // Ignore duplicate events.
    if (
      validation.current.errorMessage === newValidation.errorMessage &&
      isEqual(validation.current.validationDetails, newValidation.validationDetails)
    ) {
      return;
    }

    validation.current = newValidation;
    if (onValidationChange) {
      onValidationChange(newValidation);
    }
  });

  useEffect(() => {
    if (!inputRef) {return;}

    let input = inputRef.current;
    let form = input.form;
    let onInvalid = (e: InputEvent) => {
      e.preventDefault();
      updateValidation({
        validationDetails: getValidity(input),
        errorMessage: input.validationMessage
      });
    };

    let onChange = () => {
      if (input.validity.valid || !validation.current.validationDetails.valid) {
        updateValidation({
          validationDetails: getValidity(input),
          errorMessage: input.validationMessage
        });
      }
    };

    let onReset = () => {
      updateValidation(DEFAULT_VALIDITY);
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
  }, [inputRef, updateValidation]);
}

function getValidationResult<T>(validity: InputValidity, validationState: ValidationStateProp<T>, errorMessage: ReactNode, validationBehavior: 'aria' | 'native', value: T): FormValidationResult {
  // if (!validationState && !validity.validationDetails.valid && !validity.validationDetails.customError) {
  //   // Use native error unless a custom one is provided.
  //   validationState = 'invalid';
  //   errorMessage = validity.errorMessage;
  // }

  // If using native validation behavior, only show validation state once the user submits a form
  // rather than in real-time. This is the default behavior for native validation, and we emulate it
  // when a custom validationState/errorMessage are provided as well. These props can be set by the
  // developer in real-time for ease of implementation, but only shown to the user on submit.
  if (validationBehavior === 'native') {
    // if (validity.validationDetails.valid) {
    //   // If the native input is valid, keep the validation state as "valid" to show green checkmark
    //   // if it is passed in as a prop, otherwise delay showing validation state.
    //   validationState = validationState === 'valid' ? 'valid' : undefined;
    //   errorMessage = undefined;
    // } else {
    //   validationState = 'invalid';
    //   if (!validity.validationDetails.customError && !errorMessage) {
    //     // Use native error message if a custom one is not provided.
    //     errorMessage = validity.errorMessage;
    //   }
    // }
    // if (typeof validationState !== 'string' && !validity.validationDetails.valid) {
    //   validationState = 'invalid';
    //   errorMessage = validity.errorMessage;
    // }
    if (typeof validationState === 'function' || !validationState) {
      validationState = validity.validationDetails.valid ? undefined : 'invalid';
      if (!validity.validationDetails.customError && !errorMessage) {
        errorMessage = validity.errorMessage;
      }
    }
  } else if (typeof validationState === 'function') {
    validationState = validationState(value);
  }

  // if (validity.validationDetails.valid) {
  //   validationState = undefined;
  // } else if (!errorMessage) {
  //   errorMessage = validity.errorMessage;
  // }

  return {
    validationState,
    errorMessage,
    validationDetails: validity.validationDetails
  };
}

export function useFormValidationState<T>(validationState: ValidationStateProp<T>, errorMessage: ReactNode, validationBehavior: 'aria' | 'native', value: T): [FormValidationResult, (validity: InputValidity) => void] {
  let [validation, setValidation] = useState<InputValidity>(DEFAULT_VALIDITY);

  if (typeof validationState === 'object') {
    return [validationState, validationState.setValidity]
  }

  return [getValidationResult(validation, validationState, errorMessage, validationBehavior, value), setValidation];
}

export function useValidationState<T>(validate: (value: T) => string): ExternalValidationState<T> {
  let [{validationState, errorMessage, validationDetails}, setValidation] = useState({
    validationState: undefined,
    errorMessage: '',
    validationDetails: DEFAULT_VALIDITY.validationDetails
  });
  return {
    validate,
    validationState,
    errorMessage,
    validationDetails,
    setValidity(validity: InputValidity) {
      let validationState;
      let errorMessage = '';
      if (!validity.validationDetails.valid) {
        validationState = 'invalid';
        errorMessage = validity.errorMessage;
      }

      setValidation({
        validationState,
        errorMessage,
        validationDetails: validity.validationDetails
      });
    },
    setError(errorMessage) {
      setValidation({
        validationState: 'invalid',
        errorMessage,
        validationDetails: {
          ...DEFAULT_VALIDITY.validationDetails,
          customError: true,
          valid: false
        }
      });
    },
    clear() {
      setValidation({
        validationState: undefined,
        errorMessage: '',
        validationDetails: DEFAULT_VALIDITY.validationDetails
      });
    }
  }
}

export function mergeValidity(a: ValidityState, b: ValidityState) {
  return {
    badInput: a.badInput || b.badInput,
    customError: a.customError || b.customError,
    patternMismatch: a.patternMismatch || b.patternMismatch,
    rangeOverflow: a.rangeOverflow || b.rangeOverflow,
    rangeUnderflow: a.rangeUnderflow || b.rangeUnderflow,
    stepMismatch: a.stepMismatch || b.stepMismatch,
    tooLong: a.tooLong || b.tooLong,
    tooShort: a.tooShort || b.tooShort,
    typeMismatch: a.typeMismatch || b.typeMismatch,
    valueMissing: a.valueMissing || b.valueMissing,
    valid: a.valid && b.valid
  };
}
