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

import {DOMProps} from '@react-types/shared';
import {InputHTMLAttributes} from 'react';
import {mergeProps} from '@react-aria/utils';
import {SwitchProps} from '@react-types/switch';
import {ToggleState} from '@react-stately/toggle';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';

export interface ToggleAria {
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function useToggle(props: SwitchProps & DOMProps, state: ToggleState): ToggleAria {
  let {
    autoFocus = false,
    isDisabled = false,
    isRequired,
    isReadOnly,
    value,
    name,
    children,
    'aria-label': ariaLabel,
    validationState = 'valid'
  } = props;

  let onChange = (e) => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    e.stopPropagation();
    state.setSelected(e.target.checked);
  };

  let hasChildren = children !== null;
  let hasAriaLabel = ariaLabel !== null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }
  let isInvalid = validationState === 'invalid';

  let {pressProps} = usePress({
    // Safari does not focus buttons automatically when interacting with them, so do it manually
    onPressStart: (e) => e.target.focus(),
    onPressEnd: (e) => e.target.focus(),
    isDisabled
  });

  let {focusableProps} = useFocusable(props);
  let interactions = mergeProps(pressProps, focusableProps);

  return {
    inputProps: {
      'aria-label': ariaLabel,
      'aria-invalid': isInvalid,
      onChange,
      disabled: isDisabled,
      required: isRequired,
      readOnly: isReadOnly,
      value,
      name,
      type: 'checkbox',
      autoFocus,
      ...interactions
    }
  };
}
