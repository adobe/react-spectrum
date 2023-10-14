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

import {useMemo} from 'react';
import {ValidationFunction, ValidationResult} from '@react-types/shared';

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

export const CUSTOM_VALIDITY_STATE: ValidityState = {
  ...VALID_VALIDITY_STATE,
  customError: true,
  valid: false
};

export function isEqualValidation(a: ValidationResult, b: ValidationResult): boolean {
  if (a === b) {
    return true;
  }

  return a.isInvalid === b.isInvalid
    && a.errors.length === b.errors.length
    && a.errors.every((a, i) => a === b.errors[i])
    && Object.entries(a.validationDetails).every(([k, v]) => b.validationDetails[k] === v);
}

export function useValidate<T>(validate: ValidationFunction<T>, value: T): string[] {
  return useMemo(() => {
    if (typeof validate === 'function') {
      let e = validate(value);
      if (e && typeof e !== 'boolean') {
        return Array.isArray(e) ? e : [e];
      }
    }

    return [];
  }, [validate, value]);
}
