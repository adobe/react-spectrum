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
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {InputHTMLAttributes, RefObject} from 'react';
import {radioGroupNames} from './utils';
import {RadioGroupState} from '@react-stately/radio';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';

interface RadioAria {
  /** Props for the input element. */
  inputProps: InputHTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 * @param props - Props for the radio.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 * @param ref - Ref to the HTML input element.
 */
export function useRadio(props: AriaRadioProps, state: RadioGroupState, ref: RefObject<HTMLElement>): RadioAria {
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

  let {pressProps} = usePress({
    isDisabled
  });

  let {focusableProps} = useFocusable(mergeProps(props, {
    onFocus: () => state.setLastFocusedValue(value)
  }), ref);
  let interactions = mergeProps(pressProps, focusableProps);
  let domProps = filterDOMProps(props, {labelable: true});
  let tabIndex = state.lastFocusedValue === value || state.lastFocusedValue == null ? 0 : -1;
  if (isDisabled) {
    tabIndex = undefined;
  }

  return {
    inputProps: mergeProps(domProps, {
      ...interactions,
      type: 'radio',
      name: radioGroupNames.get(state),
      tabIndex,
      disabled: isDisabled,
      checked,
      value,
      onChange
    })
  };
}
