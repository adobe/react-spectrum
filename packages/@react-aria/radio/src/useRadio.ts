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

import {InputHTMLAttributes, RefObject} from 'react';
import {mergeProps, useLabels} from '@react-aria/utils';
import {RadioGroupState} from '@react-stately/radio';
import {RadioProps} from '@react-types/radio';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';
import {SwitchProps} from "@react-types/switch";
import {DOMProps} from "@react-types/shared";

interface RadioAriaProps extends RadioProps {
  isRequired?: boolean,
  isReadOnly?: boolean
}

interface RadioAria {
  /** Props for the input element */
  inputProps: InputHTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 * @param props - props for the radio
 * @param state - state for the radio group, as returned by `useRadioGroupState`
 * @param ref - ref to the HTML input element
 */
export function useRadio(props: RadioAriaProps & Omit<DOMProps, 'aria-owns'>, state: RadioGroupState, ref: RefObject<HTMLElement>): RadioAria {
  let {
    value,
    isRequired,
    isReadOnly,
    isDisabled,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  let checked = state.selectedValue === value;

  let onChange = (e) => {
    e.stopPropagation();
    state.setSelectedValue(value);
  };

  let {pressProps} = usePress({
    isDisabled
  });

  let hasChildren = children != null;
  let hasAriaLabel = ariaLabel != null || ariaLabelledby != null;
  if (!hasChildren && !hasAriaLabel) {
    console.warn('If you do not provide children, you must specify an aria-label for accessibility');
  }

  let {focusableProps} = useFocusable(mergeProps(props, {
    onFocus: () => state.setFocusableRadio(value)
  }), ref);
  let interactions = mergeProps(pressProps, focusableProps);
  let labelProps = useLabels(props);

  return {
    inputProps: {
      ...labelProps,
      type: 'radio',
      name: state.name,
      tabIndex: state.focusableRadio === value || state.focusableRadio == null ? 0 : -1,
      disabled: isDisabled,
      readOnly: isReadOnly,
      required: isRequired,
      checked,
      'aria-checked': checked,
      'aria-describedby': props['aria-describedby'],
      onChange,
      ...interactions
    }
  };
}
