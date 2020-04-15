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

import {HTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {RadioGroupState} from '@react-stately/radio';
import {useFocusWithin} from '@react-aria/interactions';
import {useLabel} from '@react-aria/label';

interface RadioGroupAria {
  /** Props for the radio group wrapper element. */
  radioGroupProps: HTMLAttributes<HTMLElement>,
  /** Props for the radio group's visible label (if any). */
  labelProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 * @param props - props for the radio group
 * @param state - state for the radio group, as returned by `useRadioGroupState`
 */
export function useRadioGroup(props: RadioGroupProps, state: RadioGroupState): RadioGroupAria {
  let {labelProps, fieldProps} = useLabel(props);

  // When the radio group loses focus, reset the focusable radio to null if
  // there is no selection. This allows tabbing into the group from either
  // direction to go to the first or last radio.
  let {focusWithinProps} = useFocusWithin({
    onBlurWithin() {
      if (!state.selectedValue) {
        state.setFocusableRadio(null);
      }
    }
  });

  return {
    radioGroupProps: {
      role: 'radiogroup',
      ...fieldProps,
      ...focusWithinProps
    },
    labelProps
  };
}
