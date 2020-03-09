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

import {HTMLAttributes, InputHTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';

interface RadioGroupAria {
  /** Props for the radio group wrapper element */
  radioGroupProps: HTMLAttributes<HTMLElement>,
  /** Props for the radio group's visible label (if any) */
  labelProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 * @param props - props for the radio group
 */
export function useRadioGroup(props: RadioGroupProps): RadioGroupAria {
  let {labelProps, fieldProps} = useLabel(props);

  return {
    radioGroupProps: {
      role: 'radiogroup',
      ...fieldProps
    },
    labelProps
  };
}
