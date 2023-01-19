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

import {RadioGroupProps} from '@react-types/radio';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';
import {ValidationState} from '@react-types/shared';

export interface RadioGroupState {
  /**
   * The name for the group, used for native form submission.
   * @deprecated
   * @private
   */
  readonly name: string,

  /** Whether the radio group is disabled. */
  readonly isDisabled: boolean,

  /** Whether the radio group is read only. */
  readonly isReadOnly: boolean,

  /** The currently selected value. */
  readonly selectedValue: string | null,

  /** Sets the selected value. */
  setSelectedValue(value: string): void,

  /** The value of the last focused radio. */
  readonly lastFocusedValue: string | null,

  /** Sets the last focused value. */
  setLastFocusedValue(value: string): void,

  /** The current validation state of the radio group. */
  validationState: ValidationState
}

let instance = Math.round(Math.random() * 10000000000);
let i = 0;

/**
 * Provides state management for a radio group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useRadioGroupState(props: RadioGroupProps): RadioGroupState  {
  // Preserved here for backward compatibility. React Aria now generates the name instead of stately.
  let name = useMemo(() => props.name || `radio-group-${instance}-${++i}`, [props.name]);
  let [selectedValue, setSelected] = useControlledState(props.value, props.defaultValue, props.onChange);
  let [lastFocusedValue, setLastFocusedValue] = useState(null);

  let setSelectedValue = (value) => {
    if (!props.isReadOnly && !props.isDisabled) {
      setSelected(value);
    }
  };

  return {
    name,
    selectedValue,
    setSelectedValue,
    lastFocusedValue,
    setLastFocusedValue,
    isDisabled: props.isDisabled || false,
    isReadOnly: props.isReadOnly || false,
    validationState: props.validationState
  };
}
