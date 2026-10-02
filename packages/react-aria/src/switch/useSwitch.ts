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

import {AriaToggleProps, useToggle} from '../toggle/useToggle';
import {
  DOMAttributesWithRef,
  InputDOMProps,
  RefObject,
  ValidationResult
} from '@react-types/shared';
import {InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {ToggleProps, ToggleState} from 'react-stately/useToggleState';

export interface SwitchProps extends ToggleProps {}

export interface AriaSwitchProps extends SwitchProps, InputDOMProps, AriaToggleProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current
   * element.
   */
  'aria-controls'?: string;
}

export interface SwitchAria extends ValidationResult {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  /** Props for the switch description element, if any. */
  descriptionProps: DOMAttributesWithRef<HTMLElement>;
  /** Props for the switch error message element, if any. */
  errorMessageProps: DOMAttributesWithRef<HTMLElement>;
  /** Whether the switch is selected. */
  isSelected: boolean;
  /** Whether the switch is in a pressed state. */
  isPressed: boolean;
  /** Whether the switch is disabled. */
  isDisabled: boolean;
  /** Whether the switch is read only. */
  isReadOnly: boolean;
}

/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 *
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `useToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function useSwitch(
  props: AriaSwitchProps,
  state: ToggleState,
  ref: RefObject<HTMLInputElement | null>
): SwitchAria {
  let {labelProps, inputProps, isSelected, ...states} = useToggle(props, state, ref);

  return {
    labelProps,
    inputProps: {
      ...inputProps,
      role: 'switch',
      checked: isSelected
    },
    isSelected,
    ...states
  };
}
