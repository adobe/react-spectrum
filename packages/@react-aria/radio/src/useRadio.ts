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

import {InputHTMLAttributes} from 'react';
import {RadioGroupState} from '@react-stately/radio';
import {RadioProps} from '@react-types/radio';
import {useFocusable} from '@react-aria/focus';

interface RadioAriaProps extends RadioProps {
  isRequired?: boolean,
  isReadOnly?: boolean
}

interface RadioAria {
  /** Props for the input element */
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

/**
 * Provides the behavior and accessibility implementation for an individual 
 * radio button in a radio group.
 * @param props - props for the radio
 * @param state - state for the radio group, as returned by `useRadioGroupState`
 */
export function useRadio(props: RadioAriaProps, state: RadioGroupState): RadioAria {
  let {
    value,
    isRequired,
    isReadOnly,
    isDisabled,
    autoFocus
  } = props;

  let checked = state.selectedValue === value;

  let onChange = (e) => {
    e.stopPropagation();
    state.setSelectedValue(value);
  };

  let {focusableProps} = useFocusable(props);

  return {
    inputProps: {
      type: 'radio',
      name: state.name,
      disabled: isDisabled,
      readOnly: isReadOnly,
      required: isRequired,
      checked,
      'aria-checked': checked,
      onChange,
      autoFocus,
      ...focusableProps
    }
  };
}
