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

import {AriaColorFieldProps} from '@react-types/color';
import {ColorFieldState} from '@react-stately/color';
import {DOMAttributes, ValidationResult} from '@react-types/shared';
import {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
  useCallback,
  useState
} from 'react';
import {mergeProps, useId} from '@react-aria-nutrient/utils';
import {privateValidationStateProp} from '@react-stately/form';
import {useFocusWithin, useScrollWheel} from '@react-aria-nutrient/interactions';
import {useFormattedTextField} from '@react-aria-nutrient/textfield';
import {useSpinButton} from '@react-aria-nutrient/spinbutton';

export interface ColorFieldAria extends ValidationResult {
  /** Props for the label element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the text field's error message element, if any. */
  errorMessageProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a color field component.
 * Color fields allow users to enter and adjust a hex color value.
 */
export function useColorField(
  props: AriaColorFieldProps,
  state: ColorFieldState,
  ref: RefObject<HTMLInputElement | null>
): ColorFieldAria {
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    isWheelDisabled,
    validationBehavior = 'aria'
  } = props;

  let {
    colorValue,
    inputValue,
    increment,
    decrement,
    incrementToMax,
    decrementToMin,
    commit
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

  let [focusWithin, setFocusWithin] = useState(false);
  let {focusWithinProps} = useFocusWithin({isDisabled, onFocusWithinChange: setFocusWithin});

  let onWheel = useCallback((e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {
      return;
    }
    if (e.deltaY > 0) {
      increment();
    } else if (e.deltaY < 0) {
      decrement();
    }
  }, [decrement, increment]);
  // If the input isn't supposed to receive input, disable scrolling.
  let scrollingDisabled = isWheelDisabled || isDisabled || isReadOnly || !focusWithin;
  useScrollWheel({onScroll: onWheel, isDisabled: scrollingDisabled}, ref);

  let onChange = value => {
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  let {inputProps, ...otherProps} = useFormattedTextField({
    ...props,
    id: inputId,
    value: inputValue,
    defaultValue: undefined,
    validate: undefined,
    [privateValidationStateProp]: state,
    type: 'text',
    autoComplete: 'off',
    onChange
  }, state, ref);

  inputProps = mergeProps(inputProps, spinButtonProps, focusWithinProps, {
    role: 'textbox',
    'aria-valuemax': null,
    'aria-valuemin': null,
    'aria-valuenow': null,
    'aria-valuetext': null,
    autoCorrect: 'off',
    spellCheck: 'false',
    onBlur: commit
  });

  if (validationBehavior === 'native') {
    inputProps['aria-required'] = undefined;
  }

  return {
    inputProps,
    ...otherProps
  };
}
