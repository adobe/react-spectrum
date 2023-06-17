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
import {ExternalValidationState, Validation, ValidationFunction, ValidationState} from '@react-types/shared';
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

interface FormValidationProps<T> extends Validation<T> {
  errorMessage?: ReactNode,
  fallbackValidity?: InputValidity
}

export function useFormValidation<T>(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  props: FormValidationProps<T>,
  value: T
): FormValidationResult {
  let {validationState, errorMessage, validate, validationBehavior, onValidationChange, fallbackValidity} = props;
  let [currentErrorMessage, validationReason] = useMemo(() => {
    // If a validationState prop is defined, it always takes precedence.
    if (validationState) {
      // Use the provided error message if available, otherwise use a default string.
      // This is usually not shown to the user because there is often a custom UI for error messages,
      // but it is required to mark the input as invalid and prevent form submission.
      let error = '';
      if (validationState === 'invalid') {
        error = typeof errorMessage === 'string' && errorMessage ? errorMessage : 'Invalid value.';
      }
      return [error, 'validationState'];
    }

    // Next, try a custom validation function.
    let error: string | true | null | undefined = '';
    if (typeof validate === 'function') {
      error = validate(value);
    } else if (typeof validate === 'object' && validate) {
      error = validate.validate(value);
    }

    if (error && typeof error === 'string') {
      return [error, 'validate'];
    }

    // If a component provided builtin validation beyond what the native input supports, use that.
    if (fallbackValidity && !fallbackValidity.validationDetails.valid) {
      return [fallbackValidity.errorMessage || '', 'fallback'];
    }

    // Valid.
    return ['', undefined];
  }, [validationState, value, errorMessage, validate]);

  let externalError = typeof validate === 'object' ? validate.errorMessage : '';
  let lastError = useRef('');
  let lastExternalError = useRef('');
  let lastValue = useRef(null);
  useEffect(() => {
    if (validationBehavior === 'native') {
      // If the value changed, use the latest client error message.
      // Otherwise, use the external error message (e.g. server error) if it changed.
      // The input should always have the latest validation error, even before it is shown to the user.
      if (value !== lastValue.current || currentErrorMessage !== lastError.current) {
        ref.current?.setCustomValidity(currentErrorMessage);
        lastValue.current = value;
        lastError.current = currentErrorMessage;
      } else if (externalError !== lastExternalError.current) {
        ref.current?.setCustomValidity(externalError);
        ref.current?.reportValidity();
        lastExternalError.current = externalError;
      }
    }
  });

  let [result, setValidity] = useFormValidationState(props, value);
  useInputValidity(validationBehavior === 'native' ? ref : null, (validity) => {
    // Ignore events for controlled validation.
    if (validationReason === 'validationState') {
      return;
    }

    // If the native input has a custom error, but we have the original validation details, use that instead.
    if (validity.validationDetails.customError && validationReason === 'fallback' && !props.fallbackValidity.validationDetails.valid) {
      validity.validationDetails = props.fallbackValidity.validationDetails;
    }

    if (typeof validate === 'object') {
      lastExternalError.current = validity.errorMessage;
    }

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
    if (!inputRef) {
      return;
    }

    let input = inputRef.current;
    let form = input.form;
    let onInvalid = (e: InputEvent) => {
      e.preventDefault();
      updateValidation({
        validationDetails: getValidity(input),
        errorMessage: input.validationMessage
      });
    };

    let onChange = (e) => {
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
    // form?.addEventListener('focusout', onChange);
    form?.addEventListener('reset', onReset);
    return () => {
      input.removeEventListener('invalid', onInvalid);
      form?.removeEventListener('change', onChange);
      form?.removeEventListener('focusout', onChange);
      form?.removeEventListener('reset', onReset);
    };
  }, [inputRef, updateValidation]);
}

export function useFormValidationState<T>(props: FormValidationProps<T>, value: T): [FormValidationResult, (validity: InputValidity) => void] {
  let {validationBehavior, validationState, errorMessage, validate} = props;
  let [validity, setValidation] = useState(DEFAULT_VALIDITY);
  let validationDetails = validity.validationDetails;

  // If an external validation state is provided, use that unless validationState overrides it.
  if (!validationState && typeof validate === 'object') {
    let state = validate;
    validationState = state.validationDetails.valid ? undefined : 'invalid';
    errorMessage = state.errorMessage;
    validationDetails = state.validationDetails;
    setValidation = (validity: InputValidity) => {
      state.setValidationDetails(validity.validationDetails, validity.errorMessage);
    };
  } else if (validationBehavior === 'native') {
    // If the validationState prop is provided, it overrides the native input validity.
    if (!validationState && !validity.validationDetails.valid) {
      validationState = 'invalid';
      errorMessage = validity.errorMessage;
    }
  } else if (typeof validate === 'function' && !validationState) {
    errorMessage = validate(value);
    validationState = errorMessage ? 'invalid' : undefined;
  }

  let result = {
    validationState,
    errorMessage,
    validationDetails
  };

  return [result, setValidation];
}

export function useValidationState<T>(validate: (value: T) => string): ExternalValidationState<T> {
  let [{errorMessage, validationDetails}, setValidation] = useState(DEFAULT_VALIDITY);

  return {
    validate,
    errorMessage,
    validationDetails,
    setValidationDetails(validationDetails, errorMessage) {
      setValidation({
        errorMessage,
        validationDetails
      });
    },
    setError(errorMessage) {
      setValidation({
        errorMessage,
        validationDetails: {
          ...DEFAULT_VALIDITY.validationDetails,
          customError: true,
          valid: false
        }
      });
    },
    clear() {
      setValidation(DEFAULT_VALIDITY);
    }
  }
}

export function composeValidate<T>(
  validate: ValidationFunction<T> | ExternalValidationState<T>,
  other: ValidationFunction<T>
): ValidationFunction<T> | ExternalValidationState<T> {
  if (typeof validate === 'function') {
    return composeValidationFunction(validate, other);
  } else if (validate && typeof validate === 'object') {
    return {
      ...validate,
      validate: composeValidationFunction(validate.validate, other)
    };
  } else {
    return other;
  }
}

function composeValidationFunction<T>(a: ValidationFunction<T>, b: ValidationFunction<T>): ValidationFunction<T> {
  return (value) => {
    let error = a(value);
    if (error && typeof error === 'string') {
      return error;
    }

    return b(value);
  };
}

export function mapValidate<T, U>(
  validate: ValidationFunction<U> | ExternalValidationState<U>,
  map: (value: T) => U
): ValidationFunction<T> | ExternalValidationState<T> {
  if (typeof validate === 'function') {
    return (value) => validate(map(value))
  } else if (validate && typeof validate === 'object') {
    return {
      ...validate,
      validate: (value) => validate.validate(map(value))
    };
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
