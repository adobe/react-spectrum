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

import {AriaHexColorFieldProps} from '@react-types/color';
import {HexColorFieldState} from '@react-stately/color';
import {HTMLAttributes, LabelHTMLAttributes, RefObject, useState} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {useFocus} from '@react-aria/interactions';
import {useTextField} from '@react-aria/textfield';

interface HexColorFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputFieldProps: HTMLAttributes<HTMLInputElement>
}

export function useHexColorField(
  props: AriaHexColorFieldProps,
  state: HexColorFieldState,
  ref: RefObject<HTMLInputElement>
): HexColorFieldAria {
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    autoFocus
  } = props;

  let {
    colorValue,
    setColorValue,
    inputValue,
    validationState,
    commitInputValue,
    increment,
    incrementToMax,
    decrement,
    decrementToMin,
  } = state;

  const inputId = useId();
  let {focusProps} = useFocus({
    onFocus: () => {
      ref.current.value = inputValue;
      ref.current.select();
    },
    onBlur: () => {
      // Set input value to normalized valid value
      commitInputValue();
    }
  });

  const {
    labelProps, 
    inputProps: inputFieldProps
  } = useTextField(
    mergeProps(focusProps, {
      autoFocus,
      isDisabled,
      isReadOnly,
      isRequired,
      validationState,
      value: inputValue,
      autoComplete: 'off',
      'aria-label': props['aria-label'] || null,
      'aria-labelledby': props['aria-labelledby'] || null,
      id: inputId,
      // placeholder: formatMessage('TO DO'),
      type: 'text',
      onChange: setColorValue
    }), ref);

  return {
    labelProps,
    inputFieldProps
  };
}
