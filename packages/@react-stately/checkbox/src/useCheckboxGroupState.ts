/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CheckboxGroupProps} from '@react-types/checkbox';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ValidationResult, ValidationState} from '@react-types/shared';

export interface CheckboxGroupState {
  /** Current selected values. */
  readonly value: readonly string[],

  /** Whether the checkbox group is disabled. */
  readonly isDisabled: boolean,

  /** Whether the checkbox group is read only. */
  readonly isReadOnly: boolean,

  /**
   * The current validation state of the checkbox group.
   * @deprecated Use `isInvalid` instead.
   */
  readonly validationState: ValidationState | null,

  /** Whether the checkbox group is invalid. */
  readonly isInvalid: boolean,

  /** A list of group level validation error messages resulting from the `validate` prop. */
  readonly groupValidationErrors: string[],

  /** The aggregated error messages for the group and all checkboxes. */
  readonly validationErrors: string[],

  /** The aggregated validation details for all checkboxes in the group. */
  readonly validationDetails: ValidityState,

  /**
   * Whether the checkboxes in the group are required.
   * This changes to false once at least one item is selected.
   */
  readonly isRequired: boolean,

  /** Returns whether the given value is selected. */
  isSelected(value: string): boolean,

  /** Sets the selected values. */
  setValue(value: string[]): void,

  /** Adds a value to the set of selected values. */
  addValue(value: string): void,

  /** Removes a value from the set of selected values. */
  removeValue(value: string): void,

  /** Toggles a value in the set of selected values. */
  toggleValue(value: string): void,

  /** Sets whether one of the checkboxes is invalid. */
  setInvalid(value: string, validation: ValidationResult): void
}

/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useCheckboxGroupState(props: CheckboxGroupProps = {}): CheckboxGroupState {
  let [selectedValues, setValue] = useControlledState(props.value, props.defaultValue || [], props.onChange);
  let [invalidValues, setInvalidValues] = useState(new Map<string, ValidationResult>());
  let isRequired = props.isRequired && selectedValues.length === 0;

  let {validate, onValidationChange} = props;
  let groupValidationErrors = useMemo(() => {
    if (typeof validate === 'function') {
      let e = validate(selectedValues);
      if (e && typeof e !== 'boolean') {
        return Array.isArray(e) ? e : [e];
      }
    }

    return [];
  }, [validate, selectedValues]);

  // Aggregate errors from all invalid checkboxes for checkbox group level validation.
  let aggregatedValidation = useMemo(() => aggregateValidation(invalidValues), [invalidValues]);
  let isInvalid = props.isInvalid || props.validationState === 'invalid' || aggregatedValidation.isInvalid;

  let lastValidation = useRef(aggregatedValidation);
  useEffect(() => {
    if (aggregatedValidation !== lastValidation.current) {
      lastValidation.current = aggregatedValidation;
      onValidationChange?.(aggregatedValidation);
    }
  });

  const state: CheckboxGroupState = {
    value: selectedValues,
    setValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setValue(value);
    },
    isDisabled: props.isDisabled || false,
    isReadOnly: props.isReadOnly || false,
    isSelected(value) {
      return selectedValues.includes(value);
    },
    addValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (!selectedValues.includes(value)) {
        setValue(selectedValues.concat(value));
      }
    },
    removeValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (selectedValues.includes(value)) {
        setValue(selectedValues.filter(existingValue => existingValue !== value));
      }
    },
    toggleValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (selectedValues.includes(value)) {
        setValue(selectedValues.filter(existingValue => existingValue !== value));
      } else {
        setValue(selectedValues.concat(value));
      }
    },
    setInvalid(value, validation) {
      setInvalidValues(invalidValues => {
        let s = new Map(invalidValues);
        if (validation.isInvalid) {
          s.set(value, validation);
        } else {
          s.delete(value);
        }

        return s;
      });
    },
    validationState: props.validationState ?? (isInvalid ? 'invalid' : null),
    isInvalid,
    groupValidationErrors,
    isRequired,
    validationErrors: aggregatedValidation.errors,
    validationDetails: aggregatedValidation.validationDetails
  };

  return state;
}

function aggregateValidation(invalidValues: Map<string, ValidationResult>): ValidationResult {
  let errors = new Set<string>();
  let isInvalid = invalidValues.size > 0;
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
    valid: !isInvalid
  };

  for (let v of invalidValues.values()) {
    for (let e of v.errors) {
      errors.add(e);
    }

    // Only these properties apply for checkboxes.
    validationDetails.valueMissing ||= v.validationDetails.valueMissing;
    validationDetails.customError ||= v.validationDetails.customError;
  }

  return {
    isInvalid,
    errors: [...errors],
    validationDetails
  };
}
