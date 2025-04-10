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

import React, {forwardRef, Ref, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import {TextFieldBase} from './TextFieldBase';
import {useFormProps} from '@react-spectrum/form';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria-nutrient/textfield';

/**
 * TextFields are text inputs that allow users to input custom text entries
 * with a keyboard. Various decorations can be displayed around the field to
 * communicate the entry requirements.
 */
export const TextField = forwardRef(function TextField(props: SpectrumTextFieldProps, ref: Ref<TextFieldRef>) {
  props = useProviderProps(props);
  props = useFormProps(props);

  let inputRef = useRef<HTMLInputElement>(null);
  let result = useTextField(props, inputRef);

  if (props.placeholder && process.env.NODE_ENV !== 'production') {
    console.warn('Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text');
  }

  return (
    <TextFieldBase
      {...props}
      {...result}
      ref={ref}
      inputRef={inputRef} />
  );
});
