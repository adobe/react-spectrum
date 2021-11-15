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

import {chain, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
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

  let {labelPosition} = otherProps;

  let fallbackRef = useRef<TextFieldRef>(null);
  if (!ref) {
    ref = fallbackRef;
  }

  // not in stately because this is so we know when to re-measure, which is a spectrum design
  let [inputValue, setInputValue] = useControlledState(props.value, props.defaultValue, () => {});

  let inputRef = useRef<HTMLTextAreaElement>();

  // Store styleProps to apply styles appropriately on height change.
  let {styleProps} = useStyleProps(props);
  let initialHeightsRef = useRef(null);

  let onHeightChange = useCallback(() => {
    let input = inputRef.current;
    let inputContainer = input.parentElement;
    let field = ref.current.UNSAFE_getDOMNode();

    // current offsetHeight of the textarea
    let inputOffsetHeight = input.offsetHeight;

    // Label or helpText height might change, so we have to recalculate
    let labelHeight = labelPosition !== 'side' && !field.firstElementChild.contains(input) ? (field.firstElementChild as HTMLElement).offsetHeight : 0;
    
    // With labelPosition === 'side', the TextArea and HelpText will be contained within a wrapper.
    let fieldWrapper = labelPosition === 'side' ? field.lastElementChild : field;
    let helpTextHeight = !fieldWrapper.lastElementChild.contains(input) ? (fieldWrapper.lastElementChild as HTMLElement).offsetHeight : 0;

    // store a ref containing the initial size values for comparison
    if (initialHeightsRef.current === null) {
      initialHeightsRef.current = {
        inputHeight: inputOffsetHeight,
        fieldHeight: field.offsetHeight
      };
    }
    let {inputHeight, fieldHeight} = initialHeightsRef.current;
    let calculatedFieldHeight = Math.max(inputHeight, inputOffsetHeight) + labelHeight + helpTextHeight;
    let heightStyles = Object.entries(
      ['height', 'maxHeight', 'minHeight']
      .reduce((obj, key) => {
        let value = styleProps.style[key];
        if (value && value !== '') {
          obj[key] = value;
        }
        return obj;
      }, {})
    );
    if (isQuiet) {
      let prevAlignment = input.style.alignSelf;
      input.style.alignSelf = 'start';
      input.style.height = 'auto';
      input.style.height = `${Math.max(input.scrollHeight, inputHeight)}px`;
      input.style.alignSelf = prevAlignment;
      inputContainer.style.flexGrow = '0';
      for (const [key, value] of heightStyles) {
        switch (key as string) {
          case 'height':
          case 'maxHeight':
            field.style[key as string] = calculatedFieldHeight <= fieldHeight ? value : '';
            break;
        }
      }
    } else {
      for (const [key, value] of heightStyles) {
        switch (key as string) {
          case 'height':
            if (inputOffsetHeight < inputHeight) {
              field.style[key] = `${helpTextHeight + inputOffsetHeight + labelHeight}px`;
            } else {
              field.style[key] = calculatedFieldHeight <= fieldHeight ? value : `${calculatedFieldHeight}px`;
            }
            break;
          case 'minHeight':
          case 'maxHeight':
            input.style[key] = `calc(${value} - ${labelHeight + helpTextHeight}px)`;
            break;
        }
      }
    }
  }, [isQuiet, inputRef, ref, styleProps, labelPosition]);

  useLayoutEffect(() => {
    if (inputRef.current) {
      onHeightChange();
    }
  }, [onHeightChange, inputValue, inputRef]);

  // captures drag to resize events user events
  useResizeObserver({
    ref: inputRef,
    onResize: onHeightChange
  });

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
