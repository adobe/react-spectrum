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
import {HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {RadioGroupProps} from '@react-types/radio';
import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';

interface RadioGroupAria {
  radioGroupProps: HTMLAttributes<HTMLElement>,
  labelProps: LabelHTMLAttributes<HTMLElement>,
  radioProps: InputHTMLAttributes<HTMLInputElement>
}

export function useRadioGroup(props: RadioGroupProps): RadioGroupAria {
  let defaultGroupId = `${useId()}-group`;
  let {
    name = defaultGroupId
  } = props;
  let {labelProps, fieldProps} = useLabel(props);

  return {
    radioGroupProps: {
      role: 'radiogroup',
      ...fieldProps
    },
    labelProps,
    radioProps: {
      name
    }
  };
}
