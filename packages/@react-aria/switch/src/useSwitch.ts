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
import {SwitchProps} from '@react-types/switch';
import {ToggleState} from '@react-stately/toggle';
import {useToggle} from '@react-aria/toggle';

export interface SwitchAria {
  inputProps: InputHTMLAttributes<HTMLInputElement>
}

export function useSwitch(props: SwitchProps, state: ToggleState): SwitchAria {
  let {inputProps} = useToggle(props, state);
  let {isSelected} = state;

  return {
    inputProps: {
      ...inputProps,
      role: 'switch',
      checked: isSelected,
      'aria-checked': isSelected
    }
  };
}
