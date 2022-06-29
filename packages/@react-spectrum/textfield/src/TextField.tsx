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

import React, {forwardRef, RefObject, useCallback, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import {TextFieldBase} from './TextFieldBase';
import {useLayoutEffect} from '@react-aria/utils';
import {useProviderProps} from '@react-spectrum/provider';
import {useTextField} from '@react-aria/textfield';

function TextField(props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    isReadOnly = false
  } = props;

  let inputRef = useRef<HTMLInputElement>();

  // called only when isReadOnly to adjust the height to display all the text 
  let onHeightChange = useCallback(() => {
    if (isReadOnly) {
      let input = inputRef.current;
      let prevAlignment = input.style.alignSelf;
      input.style.alignSelf = 'start';
      // input.style.height = 'auto'; // again not really sure why this line of code is causing there to be extra whitespace 
      input.style.height = `${input.scrollHeight}px`;
      input.style.alignSelf = prevAlignment;
    }
  }, [isReadOnly, inputRef]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, inputRef]);

  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField(props, inputRef);

  if (props.placeholder) {
    console.warn('Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/TextField.html#help-text');
  }

  return (
    <TextFieldBase
      {...props}
      labelProps={labelProps}
      inputProps={inputProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      ref={ref}
      inputRef={inputRef} />
  );
}

/**
 * TextFields are text inputs that allow users to input custom text entries
 * with a keyboard. Various decorations can be displayed around the field to
 * communicate the entry requirements.
 */
const _TextField = forwardRef(TextField);
export {_TextField as TextField};
