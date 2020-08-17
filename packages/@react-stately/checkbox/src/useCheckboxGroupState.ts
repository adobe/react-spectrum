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
import {useMemo} from 'react';

export interface CheckboxGroupState {
  /** The name for the group, used for native form submission. */
  readonly name: string,

  /** Current selected values. */
  readonly value: readonly string[],

  /** Sets the selected values. */
  setValue(value: string[]): void,

  /** Adds a value to the set of selected values. */
  addValue(value: string): void,

  /** Removes a value from the set of selected values. */
  removeValue(value: string): void,

  /** Toggles a value in the set of selected values. */
  toggleValue(value: string): void
}

let instance = Math.round(Math.random() * 10000000000);
let i = 0;

/**
 * Provides state management for a checkbox group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useCheckboxGroupState(props: CheckboxGroupProps = {}): CheckboxGroupState {
  let name = useMemo(() => props.name || `checkbox-group-${instance}-${++i}`, [props.name]);
  let [selectedValue, setValue] = useControlledState(props.value, props.defaultValue || [], props.onChange);

  const state: CheckboxGroupState = {
    name,
    value: selectedValue,
    setValue,
    addValue(value) {
      if (props.isReadOnly) {
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
      if (props.isReadOnly) {
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
      if (props.isReadOnly) {
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
