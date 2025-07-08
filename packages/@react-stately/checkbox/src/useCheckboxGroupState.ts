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
import {FormValidationState, mergeValidation, useFormValidationState} from '@react-stately/form';
import {useControlledState} from '@react-stately/utils';
import {useRef, useState} from 'react';
import {ValidationResult, ValidationState} from '@react-types/shared';

export interface CheckboxGroupState extends FormValidationState {
  /** Current selected values. */
  readonly value: readonly string[],
  /** Default selected values. */
  readonly defaultValue: readonly string[],

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
  let [initialValues] = useState(selectedValues);
  let isRequired = !!props.isRequired && selectedValues.length === 0;

  let invalidValues = useRef(new Map<string, ValidationResult>());
  let validation = useFormValidationState({
    ...props,
    value: selectedValues
  });

  let isInvalid = validation.displayValidation.isInvalid;
  const state: CheckboxGroupState = {
    ...validation,
    value: selectedValues,
    defaultValue: props.defaultValue ?? initialValues,
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
        selectedValues = selectedValues.concat(value);
        setValue(selectedValues);
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
    setInvalid(value, v) {
      let s = new Map(invalidValues.current);
      if (v.isInvalid) {
        s.set(value, v);
      } else {
        s.delete(value);
      }

      invalidValues.current = s;
      validation.updateValidation(mergeValidation(...s.values()));
    },
    validationState: props.validationState ?? (isInvalid ? 'invalid' : null),
    isInvalid,
    isRequired
  };

  return state;
}
