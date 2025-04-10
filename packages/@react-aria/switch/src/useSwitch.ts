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

import {AriaSwitchProps} from '@react-types/switch';
import {InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {RefObject} from '@react-types/shared';
import {ToggleState} from '@react-stately/toggle';
import {useToggle} from '@react-aria-nutrient/toggle';

export interface SwitchAria {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Whether the switch is selected. */
  isSelected: boolean,
  /** Whether the switch is in a pressed state. */
  isPressed: boolean,
  /** Whether the switch is disabled. */
  isDisabled: boolean,
  /** Whether the switch is read only. */
  isReadOnly: boolean
}

/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `useToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function useSwitch(props: AriaSwitchProps, state: ToggleState, ref: RefObject<HTMLInputElement | null>): SwitchAria {
  let {labelProps, inputProps, isSelected, isPressed, isDisabled, isReadOnly} = useToggle(props, state, ref);

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      role: 'switch',
      checked: isSelected
    },
    isSelected,
    isPressed,
    isDisabled,
    isReadOnly
  };
}
