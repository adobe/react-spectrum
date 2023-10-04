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

import {AriaCheckboxProps} from '@react-types/checkbox';
import {InputHTMLAttributes, RefObject, useEffect} from 'react';
import {ToggleState} from '@react-stately/toggle';
import {useToggle} from '@react-aria/toggle';

export interface CheckboxAria {
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Whether the checkbox is selected. */
  isSelected: boolean,
  /** Whether the checkbox is in a pressed state. */
  isPressed: boolean,
  /** Whether the checkbox is disabled. */
  isDisabled: boolean,
  /** Whether the checkbox is read only. */
  isReadOnly: boolean,
  /** Whether the checkbox is invalid. */
  isInvalid: boolean
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useToggleState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckbox(props: AriaCheckboxProps, state: ToggleState, inputRef: RefObject<HTMLInputElement>): CheckboxAria {
  let {inputProps, isSelected, isPressed, isDisabled, isReadOnly, isInvalid} = useToggle(props, state, inputRef);

  let {isIndeterminate} = props;
  useEffect(() => {
    // indeterminate is a property, but it can only be set via javascript
    // https://css-tricks.com/indeterminate-checkboxes/
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  });

  return {
    inputProps: {
      ...inputProps,
      checked: isSelected
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly,
    isInvalid
  };
}
