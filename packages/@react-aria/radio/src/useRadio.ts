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

import {AriaRadioProps} from '@react-types/radio';
import {filterDOMProps, mergeProps, useFormReset} from '@react-aria/utils';
import {InputHTMLAttributes, LabelHTMLAttributes, RefObject} from 'react';
import {radioGroupData} from './utils';
import {RadioGroupState} from '@react-stately/radio';
import {useFocusable} from '@react-aria/focus';
import {useFormValidation} from '@react-aria/form';
import {usePress} from '@react-aria/interactions';

export interface RadioAria {
  /** Props for the label wrapper element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Whether the radio is disabled. */
  isDisabled: boolean,
  /** Whether the radio is currently selected. */
  isSelected: boolean,
  /** Whether the radio is in a pressed state. */
  isPressed: boolean
}

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 * @param props - Props for the radio.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 * @param ref - Ref to the HTML input element.
 */
export function useRadio(props: AriaRadioProps, state: RadioGroupState, ref: RefObject<HTMLInputElement>): RadioAria {
  let {
    value,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  const isDisabled = props.isDisabled || state.isDisabled;

  let hasChildren = children != null;
  let hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }

  let checked = state.selectedValue === value;

  let onChange = (e) => {
    e.stopPropagation();
    state.setSelectedValue(value);
  };

  let {pressProps, isPressed} = usePress({
    isDisabled
  });

  // iOS does not toggle radios if you drag off and back onto the label, so handle it ourselves.
  let {pressProps: labelProps, isPressed: isLabelPressed} = usePress({
    isDisabled,
    onPress() {
      state.setSelectedValue(value);
    }
  });

  let {focusableProps} = useFocusable(mergeProps(props, {
    onFocus: () => state.setLastFocusedValue(value)
  }), ref);
  let interactions = mergeProps(pressProps, focusableProps);
  let domProps = filterDOMProps(props, {labelable: true});
  let tabIndex: number | undefined = -1;
  if (state.selectedValue != null) {
    if (state.selectedValue === value) {
      tabIndex = 0;
    }
  } else if (state.lastFocusedValue === value || state.lastFocusedValue == null) {
    tabIndex = 0;
  }
  if (isDisabled) {
    tabIndex = undefined;
  }

  let {name, descriptionId, errorMessageId, validationBehavior} = radioGroupData.get(state)!;
  useFormReset(ref, state.selectedValue, state.setSelectedValue);
  useFormValidation({validationBehavior}, state, ref);

  return {
    labelProps: mergeProps(labelProps, {onClick: e => e.preventDefault()}),
    inputProps: mergeProps(domProps, {
      ...interactions,
      type: 'radio',
      name,
      tabIndex,
      disabled: isDisabled,
      required: state.isRequired && validationBehavior === 'native',
      checked,
      value,
      onChange,
      'aria-describedby': [
        props['aria-describedby'],
        state.isInvalid ? errorMessageId : null,
        descriptionId
      ].filter(Boolean).join(' ') || undefined
    }),
    isDisabled,
    isSelected: checked,
    isPressed: isPressed || isLabelPressed
  };
}
