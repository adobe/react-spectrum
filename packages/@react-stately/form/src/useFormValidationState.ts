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

import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Validation, ValidationErrors, ValidationFunction, ValidationResult} from '@react-types/shared';

export const VALID_VALIDITY_STATE: ValidityState = {
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

const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false
};

const DEFAULT_VALIDITY: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  errors: []
};

export const FormValidationContext = createContext<ValidationErrors>({});

export const privateValidationStateProp = '__formValidationState' + Date.now();

interface FormValidationProps<T> extends Validation<T> {
  builtinValidation?: ValidationResult,
  name?: string,
  value: T
}

export interface FormValidationState<T> {
  realtimeValidation: ValidationResult,
  displayValidation: ValidationResult,
  updateValidation(result: ValidationResult): void,
  commitValidation(nextValue?: T): void
}

export function useFormValidationState<T>(props: FormValidationProps<T>): FormValidationState<T> {
  if (props[privateValidationStateProp]) {
    let {realtimeValidation, displayValidation, updateValidation, commitValidation} = props[privateValidationStateProp] as FormValidationState<T>;
    return {realtimeValidation, displayValidation, updateValidation, commitValidation};
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFormValidationStateImpl(props);
}

function useFormValidationStateImpl<T>(props: FormValidationProps<T>): FormValidationState<T> {
  let {isInvalid, validationState, name, value, builtinValidation, validate, validationBehavior = 'aria', onValidationChange} = props;

  // backward compatibility.
  if (validationState) {
    isInvalid ||= validationState === 'invalid';
  }

  // If the isInvalid prop is true, update validation result in realtime (controlled).
  let controlledError: ValidationResult | null = isInvalid ? {
    isInvalid: true,
    errors: [],
    validationDetails: CUSTOM_VALIDITY_STATE
  } : null;

  // Perform custom client side validation.
  let clientError: ValidationResult | null = useMemo(() => getValidationResult(runValidate(validate, value)), [validate, value]);

  if (builtinValidation?.validationDetails.valid) {
    builtinValidation = null;
  }

  // Clear server errors when the user changes the value.
  let [isServerErrorCleared, setServerErrorCleared] = useState(false);

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

  let serverError: ValidationResult | null = useMemo(() => getValidationResult(isServerErrorCleared ? [] : serverErrorMessages), [isServerErrorCleared, serverErrorMessages]);

  let nativeValidity = useRef(DEFAULT_VALIDITY);
  let [currentValidity, setCurrentValidity] = useState(DEFAULT_VALIDITY);
  let lastError = useRef(DEFAULT_VALIDITY);
  let commitValidation = (value?: T) => {
    if (controlledError) {
      return;
    }

    let nextClientError = clientError;
    if (value !== undefined) {
      nextClientError = getValidationResult(runValidate(validate, value));
    }

    let error = nextClientError || builtinValidation || nativeValidity.current;
    if (!isEqualValidation(error, lastError.current)) {
      lastError.current = error;
      setCurrentValidity(error);
      onValidationChange?.(error);
    }
  };

  useEffect(() => {
    if (validationBehavior === 'aria' && onValidationChange) {
      commitValidation();
    }
  });

  let realtimeValidation = controlledError || serverError || clientError || builtinValidation || DEFAULT_VALIDITY;
  let displayValidation = validationBehavior === 'native'
    ? controlledError || serverError || currentValidity
    : realtimeValidation;

  return {
    realtimeValidation,
    displayValidation,
    updateValidation(value) {
      nativeValidity.current = value;
    },
    commitValidation(value) {
      commitValidation(value);
      setServerErrorCleared(true);
    }
  };
}

function runValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  if (typeof validate === 'function') {
    let e = validate(value);
    if (e && typeof e !== 'boolean') {
      return Array.isArray(e) ? e : [e];
    }
  }

  return [];
}

function getValidationResult(errors: string[]): ValidationResult | null {
  return errors.length ? {
    isInvalid: true,
    errors: errors,
    validationDetails: CUSTOM_VALIDITY_STATE
  } : null;
}

function isEqualValidation(a: ValidationResult | null, b: ValidationResult | null): boolean {
  if (a === b) {
    return true;
  }

  return a && b
    && a.isInvalid === b.isInvalid
    && a.errors.length === b.errors.length
    && a.errors.every((a, i) => a === b.errors[i])
    && Object.entries(a.validationDetails).every(([k, v]) => b.validationDetails[k] === v);
}

export function mergeValidation(...results: ValidationResult[]): ValidationResult {
  let errors = new Set<string>();
  let isInvalid = false;
  let validationDetails = {
    ...VALID_VALIDITY_STATE
  };

  for (let v of results) {
    for (let e of v.errors) {
      errors.add(e);
    }

    // Only these properties apply for checkboxes.
    isInvalid ||= v.isInvalid;
    for (let key in validationDetails) {
      validationDetails[key] ||= v.validationDetails[key];
    }
  }

  validationDetails.valid = !isInvalid;
  return {
    isInvalid,
    errors: [...errors],
    validationDetails
  };
}
