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
import {
  HTMLAttributes,
  LabelHTMLAttributes,
  RefObject
} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {useSpinButton} from '@react-aria/spinbutton';
import {useTextField} from '@react-aria/textfield';

interface HexColorFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  inputProps: HTMLAttributes<HTMLInputElement>
}

export function useHexColorField(
  props: Omit<AriaHexColorFieldProps, 'value' | 'defaultValue' | 'onChange'>,
  state: HexColorFieldState,
  ref: RefObject<HTMLInputElement>
): HexColorFieldAria {
  let {
    isDisabled,
    isReadOnly,
    isRequired
  } = props;

  let {
    colorValue,
    inputValue,
    setInputValue,
    commit,
    increment,
    decrement,
    incrementToMax,
    decrementToMin
  } = state;

  let inputId = useId();
  let {spinButtonProps} = useSpinButton(
    {
      isDisabled,
      isReadOnly,
      isRequired,
      maxValue: 0xFFFFFF,
      minValue: 0,
      onIncrement: increment,
      onIncrementToMax: incrementToMax,
      onDecrement: decrement,
      onDecrementToMin: decrementToMin,
      value: colorValue ? colorValue.toHexInt() : undefined,
      textValue: colorValue ? colorValue.toString('hex') : undefined
    }
  );

  let onWheel = (e) => {
    if (isDisabled || isReadOnly) {
      return;
    }
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
  };

  let {labelProps, inputProps} = useTextField(
    mergeProps(props, {
      id: inputId,
      value: inputValue,
      type: 'text',
      autoComplete: 'off',
      onChange: setInputValue
    }), ref);

  return {
    labelProps,
    inputProps: mergeProps(inputProps, spinButtonProps, {
      role: 'textbox',
      'aria-valuemax': null,
      'aria-valuemin': null,
      'aria-valuenow': null,
      'aria-valuetext': null,
      autoCorrect: 'off',
      onBlur: commit,
      onWheel
    })
  };
}
