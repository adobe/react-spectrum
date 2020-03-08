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

import {CheckboxProps} from '@react-types/checkbox';
import {InputHTMLAttributes, RefObject, useEffect} from 'react';
import {ToggleState} from '@react-stately/toggle';
import {useToggle} from '@react-aria/toggle';

export interface CheckboxAria {
  /** Props for the input element */
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function useCheckbox(props: CheckboxProps, state: ToggleState, inputRef: RefObject<HTMLInputElement>): CheckboxAria {
  let {inputProps} = useToggle(props, state);
  let {isSelected} = state;

  let {isIndeterminate} = props;
  useEffect(() => {
    // indeterminate is a property, but it can only be set via javascript
    // https://css-tricks.com/indeterminate-checkboxes/
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [inputRef, isIndeterminate]);

  return {
    inputProps: {
      ...inputProps,
      checked: isSelected,
      'aria-checked': isIndeterminate ? 'mixed' : isSelected
    }
  };
}
