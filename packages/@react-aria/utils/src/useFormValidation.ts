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

import {createContext, RefObject, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useEffectEvent} from './useEffectEvent';
import {Validation, ValidationErrors, ValidationResult} from '@react-types/shared';

type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export const FormValidationContext = createContext<ValidationErrors>({});

interface FormValidationProps<T> extends Validation<T> {
  name?: string
}

export function useFormValidation<T>(props: FormValidationProps<T>, value: T, ref: RefObject<ValidatableElement>): ValidationResult {
  let {isInvalid, validationState, name, validate, validationBehavior, onValidationChange} = props;

  // backward compatibility.
  if (validationState) {
    isInvalid ||= validationState === 'invalid';
  }

  // If the isInvalid prop is true, update validation result in realtime (controlled).
  let controlledError: ValidationResult | null = isInvalid ? {
    isInvalid: true,
    errors: [],
    validationDetails: CUSTOM_VALIDATION_DETAILS
  } : null;

  // Perform custom client side validation.
  let clientErrors = useMemo(() => {
    if (typeof validate === 'function') {
      let error = validate(value);
      if (error && typeof error !== 'boolean') {
        return Array.isArray(error) ? error : [error];
      }
    }

    return [];
  }, [value, validate]);

  let clientError: ValidationResult | null = useMemo(() => {
    return clientErrors.length ? {
      isInvalid: true,
      errors: clientErrors,
      validationDetails: CUSTOM_VALIDATION_DETAILS
    } : null;
  }, [clientErrors]);

  // Clear server errors when the user changes the value.
  let [isServerErrorCleared, setServerErrorCleared] = useState(false);
  useEffect(() => {
    let input = ref.current!;
    let form = input.form;
    let onReset = () => setServerErrorCleared(true);
    let onChange = (e) => {
      // Clear if any input with the same name is updated (e.g. in a checkbox/radio group).
      if (e.target.name === name) {
        setServerErrorCleared(true);
      }
    };
    input.addEventListener('change', onChange);
    form?.addEventListener('change', onChange);
    form?.addEventListener('reset', onReset);
    return () => {
      input.removeEventListener('change', onChange);
      form?.removeEventListener('change', onChange);
      form?.removeEventListener('reset', onReset);
    };
  }, [ref, name]);

  // Get relevant server errors from the form.
  let serverErrors = useContext(FormValidationContext);
  let serverErrorMessages = useMemo(() => {
    if (name) {
      setServerErrorCleared(false);
      let errors = serverErrors[name];
      if (!errors) {
        return [];
      }
      return Array.isArray(errors) ? errors : [errors];
    }
    return [];
  }, [serverErrors, name]);

  let serverError: ValidationResult | null = useMemo(() => {
    return serverErrorMessages.length && !isServerErrorCleared ? {
      isInvalid: true,
      errors: serverErrorMessages,
      validationDetails: CUSTOM_VALIDATION_DETAILS
    } : null;
  }, [isServerErrorCleared, serverErrorMessages]);

  // Update the native element's validity based on custom client and server validation.
  let lastError = useRef(null);
  useEffect(() => {
    if (validationBehavior === 'native') {
      let errorMessage = '';
      if (isInvalid) {
        // This is not shown to the user, it's just there to prevent form submission.
        // A custom localized string should be provided to the component the the errorMessage prop/slot.
        errorMessage = 'Invalid value.';
      } else {
        errorMessage = serverError ? serverError.errors.join(' ') : clientErrors.join(' ');
      }
      ref.current?.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=605277
      if (!ref.current.hasAttribute('title')) {
        ref.current.title = '';
      }

      // Report server errors immediately.
      if (serverError !== lastError.current && ref.current) {
        lastError.current = serverError;
        updateNativeValidity(getNativeValidity(ref.current));
      }
    } else {
      let e = serverError || clientError || DEFAULT_VALIDITY;
      if (e !== lastError.current) {
        lastError.current = e;
        onValidationChange?.(e);
      }
    }
  });

  // Track native element validity for built in validation (e.g. required).
  let [nativeValidity, setNativeValidity] = useState(DEFAULT_VALIDITY);
  let updateNativeValidity = e => {
    // Use serverError/clientError if set so we get the original (separate) error messages.
    e = serverError || clientError || e;
    setNativeValidity(e);
    onValidationChange?.(e);
  };

  useInputValidity(validationBehavior === 'native' ? ref : null, updateNativeValidity);

  if (validationBehavior === 'native') {
    return controlledError || serverError || nativeValidity;
  } else {
    return controlledError || serverError || clientError || DEFAULT_VALIDITY;
  }
}

const DEFAULT_VALIDATION_DETAILS: ValidityState = {
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
};

const CUSTOM_VALIDATION_DETAILS: ValidityState = {
  ...DEFAULT_VALIDATION_DETAILS,
  customError: true,
  valid: false
};

const DEFAULT_VALIDITY: ValidationResult = {
  isInvalid: false,
  validationDetails: DEFAULT_VALIDATION_DETAILS,
  errors: []
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
  inputRef: RefObject<ValidatableElement> | null,
  onValidationChange?: (value: ValidationResult) => void
) {
  let validation = useRef(DEFAULT_VALIDITY);
  let updateValidation = useEffectEvent((newValidation: ValidationResult) => {
    // Ignore duplicate events.
    if (
      validation.current.errors[0] === newValidation.errors[0] &&
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

    let input = inputRef.current!;
    let form = input.form;
    let onInvalid = (e: Event) => {
      e.preventDefault();
      updateValidation(getNativeValidity(input));
    };

    let onChange = () => {
      if (input.validity.valid || !validation.current.validationDetails.valid) {
        updateValidation(getNativeValidity(input));
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

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    errors: input.validationMessage ? [input.validationMessage] : []
  };
}
