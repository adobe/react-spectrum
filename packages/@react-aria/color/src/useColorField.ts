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
import {
  HTMLAttributes,
  LabelHTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {mergeProps, useId} from '@react-aria/utils';
import {useFocusWithin, useScrollWheel} from '@react-aria/interactions';
import {useFormattedTextField} from '@react-aria/textfield';
import {useSpinButton} from '@react-aria/spinbutton';
import {ValidationResult} from '@react-types/shared';

export interface ColorFieldAria extends ValidationResult {
  /** Props for the label element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /** Props for the input element. */
  inputProps: HTMLAttributes<HTMLInputElement>
}

/**
 * Provides the behavior and accessibility implementation for a color field component.
 * Color fields allow users to enter and adjust a hex color value.
 */
export function useColorField(
  props: AriaColorFieldProps,
  state: ColorFieldState,
  ref: RefObject<HTMLInputElement>
): ColorFieldAria {
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    validate,
    validationBehavior = 'aria'
  } = props;

  let {
    colorValue,
    inputValue,
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
  let scrollingDisabled = isDisabled || isReadOnly || !focusWithin;
  useScrollWheel({onScroll: onWheel, isDisabled: scrollingDisabled}, ref);

  let onChange = value => {
    if (state.validate(value)) {
      state.setInputValue(value);
    }
  };

  let {labelProps, inputProps, ...validation} = useFormattedTextField(
    mergeProps(props, {
      id: inputId,
      value: inputValue,
      defaultValue: undefined,
      validate: useCallback(() => validate?.(state.colorValue), [state.colorValue, validate]),
      type: 'text',
      autoComplete: 'off',
      onChange
    }), state, ref);

  let valueOnFocus = useRef(state.colorValue);
  let didCommit = useRef(false);
  let commit = useCallback(() => {
    state.commit();
    didCommit.current = true;
  }, [state]);

  inputProps = mergeProps(inputProps, spinButtonProps, focusWithinProps, {
    role: 'textbox',
    'aria-valuemax': null,
    'aria-valuemin': null,
    'aria-valuenow': null,
    'aria-valuetext': null,
    autoCorrect: 'off',
    spellCheck: 'false',
    onFocus: () => {
      valueOnFocus.current = state.colorValue;
    },
    onBlur: commit
  });

  // After the value is committed, check if the value changed and emit a native "change" event for form validation to pick up.
  // NOTE: This useEffect must be last so that form validation effects have already run.
  useEffect(() => {
    if (didCommit.current) {
      didCommit.current = false;
      if (state.colorValue !== valueOnFocus.current) {
        ref.current?.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }
  });

  if (validationBehavior === 'native') {
    inputProps['aria-required'] = undefined;
  }

  return {
    labelProps,
    inputProps,
    ...validation
  };
}
