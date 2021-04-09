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

export interface CheckboxGroupState {
  /** Current selected values. */
  readonly value: readonly string[],

  /** Whether the checkbox group is disabled. */
  readonly isDisabled: boolean,

  /** Whether the checkbox group is read only. */
  readonly isReadOnly: boolean,

  /** Returns whether the given value is selected. */
  isSelected(value: string): boolean,

  /** Sets the selected values. */
  setValue(value: string[]): void,

  /** Adds a value to the set of selected values. */
  addValue(value: string): void,

  /** Removes a value from the set of selected values. */
  removeValue(value: string): void,

  /** Toggles a value in the set of selected values. */
  toggleValue(value: string): void
}

/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useCheckboxGroupState(props: CheckboxGroupProps = {}): CheckboxGroupState {
  let [selectedValues, setValue] = useControlledState(props.value, props.defaultValue || [], props.onChange);

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
      setValue(values => {
        if (!values.includes(value)) {
          return values.concat(value);
        }
        return values;
      });
    },
    removeValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      setValue(values => {
        if (values.includes(value)) {
          return values.filter(existingValue => existingValue !== value);
        }
        return values;
      });
    },
    toggleValue(value) {
      if (props.isReadOnly || props.isDisabled) {
        return;
      }
      setValue(values => {
        if (values.includes(value)) {
          return values.filter(existingValue => existingValue !== value);
        }
        return values.concat(value);
      });
    }
  };

  return state;
}
