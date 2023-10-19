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
import {useFormValidationState, VALID_VALIDITY_STATE} from '@react-stately/form';
import {useMemo, useState} from 'react';
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

  realtimeValidation: ValidationResult,
  displayValidation: ValidationResult,

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

  // Keep realtime validation separate so we isolate group level validation from checkbox level validation.
  // This handles the isInvalid and validate props.
  let {realtimeValidation} = useFormValidationState({
    isInvalid: props.isInvalid,
    validationState: props.validationState,
    validate: props.validate,
    value: selectedValues
  });

  // Aggregate errors from all invalid checkboxes.
  let aggregatedValidation = useMemo(() => aggregateValidation(invalidValues), [invalidValues]);
  let isInvalid = props.isInvalid || props.validationState === 'invalid' || aggregatedValidation.isInvalid;

  // Get display validation for the group. This handles the aggregated errors from each checkbox,
  // along with server errors, and reports validation changes to the user.
  let validation = useFormValidationState({
    value: selectedValues,
    builtinValidation: aggregatedValidation,
    name: props.name,
    onValidationChange: props.onValidationChange
  });

  const state: CheckboxGroupState = {
    value: selectedValues,
    setValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      setValue(value);
      validation.commitValidation(value);
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
        let newValue = selectedValues.concat(value);
        setValue(newValue);
        validation.commitValidation(newValue);
      }
    },
    removeValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      if (selectedValues.includes(value)) {
        let newValue = selectedValues.filter(existingValue => existingValue !== value);
        setValue(newValue);
        validation.commitValidation(newValue);
      }
    },
    toggleValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }

      let newValue = selectedValues.includes(value)
        ? selectedValues.filter(existingValue => existingValue !== value)
        : selectedValues.concat(value);
      setValue(newValue);
      validation.commitValidation(newValue);
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
    realtimeValidation,
    displayValidation: validation.displayValidation,
    isRequired
  };

  return state;
}

function aggregateValidation(invalidValues: Map<string, ValidationResult>): ValidationResult {
  let errors = new Set<string>();
  let isInvalid = invalidValues.size > 0;
  let validationDetails = {
    ...VALID_VALIDITY_STATE,
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
