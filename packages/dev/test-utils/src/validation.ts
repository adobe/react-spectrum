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

import {ValidationResult} from '@react-types/shared';

export function createValidationResult(errors: string[], ...types: string[]): ValidationResult {
  let validationDetails = {
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
    valid: errors.length === 0
  };

  if (!validationDetails.valid) {
    if (types.length === 0) {
      types = ['customError'];
    }

    for (let type of types) {
      validationDetails[type] = true;
    }
  }

  return {
    isInvalid: errors.length > 0,
    errors,
    validationDetails
  };
}
