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

import {chain, useLayoutEffect} from '@react-aria/utils';
import React, {RefObject, useCallback, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import {TextFieldBase} from './TextFieldBase';
import {useControlledState} from '@react-stately/utils';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/utils';
import {useTextField} from '@react-aria/textfield';

function TextArea(props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    isDisabled = false,
    isQuiet = false,
    isReadOnly = false,
    isRequired = false,
    onChange,
    ...otherProps
  } = props;

  let fallbackRef = useRef<TextFieldRef>(null);
  if (!ref) {
    ref = fallbackRef;
  }

  // not in stately because this is so we know when to re-measure, which is a spectrum design
  let [inputValue, setInputValue] = useControlledState(props.value, props.defaultValue, () => {});

  let inputRef = useRef<HTMLTextAreaElement>();

  // Store styleProps to apply styles appropriately on height change.
  let {styleProps} = useStyleProps(props);

  let onHeightChange = useCallback(() => {
    let input = inputRef.current;
    let field = ref.current.UNSAFE_getDOMNode();
    if (isQuiet) {
      let prevAlignment = input.style.alignSelf;
      input.style.alignSelf = 'start';
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
      input.style.alignSelf = prevAlignment;
      if (styleProps.style.height || styleProps.style.minHeight) {
        field.style.minHeight = `${styleProps.style.height || field.style.minHeight}`;
        field.style.height = '';
        field.style.maxHeight = '';
      } 
    } else {
      // So that resizing the textarea will resize its container, height, minHeight and maxHeight 
      // should be applied directly to the textarea element, and we should remove those properties 
      // from the Field container.
      for (const [key, value] of Object.entries(styleProps.style)) {
        switch (key) {
          case 'height':
          case 'maxHeight':
          case 'minHeight':
            if (field.style[key] === value) {
              input.style[key] = value;
              field.style[key] = '';
            }
            break;
        }
      }
    }
  }, [isQuiet, inputRef, ref, styleProps]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, inputValue, inputRef]);


  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField({
    ...props,
    onChange: chain(onChange, setInputValue),
    inputElementType: 'textarea'
  }, inputRef);

  return (
    <TextFieldBase
      {...otherProps}
      ref={ref}
      inputRef={inputRef}
      labelProps={labelProps}
      inputProps={inputProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      multiLine
      isDisabled={isDisabled}
      isQuiet={isQuiet}
      isReadOnly={isReadOnly}
      isRequired={isRequired} />
  );
}

/**
 * TextAreas are multiline text inputs, useful for cases where users have
 * a sizable amount of text to enter. They allow for all customizations that
 * are available to text fields.
 */
let _TextArea = React.forwardRef(TextArea);
export {_TextArea as TextArea};
