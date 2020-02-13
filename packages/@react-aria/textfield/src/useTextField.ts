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
import {ChangeEvent, InputHTMLAttributes, LabelHTMLAttributes} from 'react';
import {TextFieldProps} from '@react-types/textfield';
import {TextInputDOMProps} from '@react-types/shared';
import {useFocusable} from '@react-aria/focus';
import {useLabel} from '@react-aria/label';

interface TextFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  textFieldProps: InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>
}

export function useTextField(
  props: TextFieldProps & TextInputDOMProps
): TextFieldAria {
  let {
    isDisabled = false,
    isRequired = false,
    isReadOnly = false,
    autoFocus = false,
    validationState,
    type = 'text',
    onChange = () => {}
  } = props;
  let {focusableProps} = useFocusable(props);
  let {labelProps, fieldProps} = useLabel(props);

  return {
    labelProps,
    textFieldProps: {
      type,
      disabled: isDisabled,
      readOnly: isReadOnly,
      'aria-required': isRequired || undefined,
      'aria-invalid': validationState === 'invalid' || undefined,
      onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      autoFocus,
      ...focusableProps,
      ...fieldProps
    }
  };
}
