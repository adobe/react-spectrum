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

export const DEFAULT_VALIDATION_RESULT: ValidationResult = {
  isInvalid: false,
  validationDetails: VALID_VALIDITY_STATE,
  validationErrors: []
};

export const FormValidationContext = createContext<ValidationErrors>({});

export const privateValidationStateProp = '__formValidationState' + Date.now();

interface FormValidationProps<T> extends Validation<T> {
  builtinValidation?: ValidationResult,
  name?: string | string[],
  value: T
}

export interface FormValidationState {
  /** Realtime validation results, updated as the user edits the value. */
  realtimeValidation: ValidationResult,
  /** Currently displayed validation results, updated when the user commits their changes. */
  displayValidation: ValidationResult,
  /** Updates the current validation result. Not displayed to the user until `commitValidation` is called. */
  updateValidation(result: ValidationResult): void,
  /** Resets the displayed validation state to valid when the user resets the form. */
  resetValidation(): void,
  /** Commits the realtime validation so it is displayed to the user. */
  commitValidation(): void
}

export function useFormValidationState<T>(props: FormValidationProps<T>): FormValidationState {
  // Private prop for parent components to pass state to children.
  if (props[privateValidationStateProp]) {
    let {realtimeValidation, displayValidation, updateValidation, resetValidation, commitValidation} = props[privateValidationStateProp] as FormValidationState;
    return {realtimeValidation, displayValidation, updateValidation, resetValidation, commitValidation};
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFormValidationStateImpl(props);
}

function useFormValidationStateImpl<T>(props: FormValidationProps<T>): FormValidationState {
  let {isInvalid, validationState, name, value, builtinValidation, validate, validationBehavior = 'aria'} = props;

  // backward compatibility.
  if (validationState) {
    isInvalid ||= validationState === 'invalid';
  }

  // If the isInvalid prop is true, update validation result in realtime (controlled).
  let controlledError: ValidationResult | null = isInvalid ? {
    isInvalid: true,
    validationErrors: [],
    validationDetails: CUSTOM_VALIDITY_STATE
  } : null;

  // Perform custom client side validation.
  let clientError: ValidationResult | null = useMemo(() => getValidationResult(runValidate(validate, value)), [validate, value]);

  if (builtinValidation?.validationDetails.valid) {
    builtinValidation = null;
  }

  // Get relevant server errors from the form.
  let serverErrors = useContext(FormValidationContext);
  let serverErrorMessages = useMemo(() => {
    if (name) {
      return Array.isArray(name) ? name.flatMap(name => asArray(serverErrors[name])) : asArray(serverErrors[name]);
    }
    return [];
  }, [serverErrors, name]);

  // Show server errors when the form gets a new value, and clear when the user changes the value.
  let [lastServerErrors, setLastServerErrors] = useState(serverErrors);
  let [isServerErrorCleared, setServerErrorCleared] = useState(false);
  if (serverErrors !== lastServerErrors) {
    setLastServerErrors(serverErrors);
    setServerErrorCleared(false);
  }

  let serverError: ValidationResult | null = useMemo(() =>
    getValidationResult(isServerErrorCleared ? [] : serverErrorMessages),
    [isServerErrorCleared, serverErrorMessages]
  );

  // Track the next validation state in a ref until commitValidation is called.
  let nextValidation = useRef(DEFAULT_VALIDATION_RESULT);
  let [currentValidity, setCurrentValidity] = useState(DEFAULT_VALIDATION_RESULT);

  let lastError = useRef(DEFAULT_VALIDATION_RESULT);
  let commitValidation = () => {
    if (!commitQueued) {
      return;
    }

    setCommitQueued(false);
    let error = clientError || builtinValidation || nextValidation.current;
    if (!isEqualValidation(error, lastError.current)) {
      lastError.current = error;
      setCurrentValidity(error);
    }
  };

  let [commitQueued, setCommitQueued] = useState(false);
  useEffect(commitValidation);

  // realtimeValidation is used to update the native input element's state based on custom validation logic.
  // displayValidation is the currently displayed validation state that the user sees (e.g. on input change/form submit).
  // With validationBehavior="aria", all errors are displayed in realtime rather than on submit.
  let realtimeValidation = controlledError || serverError || clientError || builtinValidation || DEFAULT_VALIDATION_RESULT;
  let displayValidation = validationBehavior === 'native'
    ? controlledError || serverError || currentValidity
    : controlledError || serverError || clientError || builtinValidation || currentValidity;

  return {
    realtimeValidation,
    displayValidation,
    updateValidation(value) {
      // If validationBehavior is 'aria', update in realtime. Otherwise, store in a ref until commit.
      if (validationBehavior === 'aria' && !isEqualValidation(currentValidity, value)) {
        setCurrentValidity(value);
      } else {
        nextValidation.current = value;
      }
    },
    resetValidation() {
      // Update the currently displayed validation state to valid on form reset,
      // even if the native validity says it isn't. It'll show again on the next form submit.
      let error = DEFAULT_VALIDATION_RESULT;
      if (!isEqualValidation(error, lastError.current)) {
        lastError.current = error;
        setCurrentValidity(error);
      }

      // Do not commit validation after the next render. This avoids a condition where
      // useSelect calls commitValidation inside an onReset handler.
      if (validationBehavior === 'native') {
        setCommitQueued(false);
      }

      setServerErrorCleared(true);
    },
    commitValidation() {
      // Commit validation state so the user sees it on blur/change/submit. Also clear any server errors.
      // Wait until after the next render to commit so that the latest value has been validated.
      if (validationBehavior === 'native') {
        setCommitQueued(true);
      }
      setServerErrorCleared(true);
    }
  };
}

function asArray<T>(v: T | T[]): T[] {
  if (!v) {
    return [];
  }

  return Array.isArray(v) ? v : [v];
}

function runValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  if (typeof validate === 'function') {
    let e = validate(value);
    if (e && typeof e !== 'boolean') {
      return asArray(e);
    }
  }

  return [];
}

function getValidationResult(errors: string[]): ValidationResult | null {
  return errors.length ? {
    isInvalid: true,
    validationErrors: errors,
    validationDetails: CUSTOM_VALIDITY_STATE
  } : null;
}

function isEqualValidation(a: ValidationResult | null, b: ValidationResult | null): boolean {
  if (a === b) {
    return true;
  }

  return a && b
    && a.isInvalid === b.isInvalid
    && a.validationErrors.length === b.validationErrors.length
    && a.validationErrors.every((a, i) => a === b.validationErrors[i])
    && Object.entries(a.validationDetails).every(([k, v]) => b.validationDetails[k] === v);
}

export function mergeValidation(...results: ValidationResult[]): ValidationResult {
  let errors = new Set<string>();
  let isInvalid = false;
  let validationDetails = {
    ...VALID_VALIDITY_STATE
  };

  for (let v of results) {
    for (let e of v.validationErrors) {
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
    validationErrors: [...errors],
    validationDetails
  };
}
