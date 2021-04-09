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

import {AriaCheckboxGroupItemProps} from '@react-types/checkbox';
import {CheckboxAria, useCheckbox} from './useCheckbox';
import {checkboxGroupNames} from './utils';
import {CheckboxGroupState} from '@react-stately/checkbox';
import {RefObject} from 'react';
import {useToggleState} from '@react-stately/toggle';

/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within a checkbox group.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckboxGroupItem(props: AriaCheckboxGroupItemProps, state: CheckboxGroupState, inputRef: RefObject<HTMLInputElement>): CheckboxAria {
  const toggleState = useToggleState({
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isSelected: state.isSelected(props.value),
    onChange(isSelected) {
      if (isSelected) {
        state.addValue(props.value);
      } else {
        state.removeValue(props.value);
      }

      if (props.onChange) {
        props.onChange(isSelected);
      }
    }
  });

  let {inputProps} = useCheckbox({
    ...props,
    isReadOnly: props.isReadOnly || state.isReadOnly,
    isDisabled: props.isDisabled || state.isDisabled,
    name: props.name || checkboxGroupNames.get(state)
  }, toggleState, inputRef);

  return {inputProps};
}
