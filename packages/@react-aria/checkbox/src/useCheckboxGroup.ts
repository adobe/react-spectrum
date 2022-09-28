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

import {AriaCheckboxGroupProps} from '@react-types/checkbox';
import {checkboxGroupDescriptionIds, checkboxGroupErrorMessageIds, checkboxGroupNames} from './utils';
import {CheckboxGroupState} from '@react-stately/checkbox';
import {DOMAttributes} from '@react-types/shared';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {useField} from '@react-aria/label';

export interface CheckboxGroupAria {
  /** Props for the checkbox group wrapper element. */
  groupProps: DOMAttributes,
  /** Props for the checkbox group's visible label (if any). */
  labelProps: DOMAttributes,
  /** Props for the checkbox group description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the checkbox group error message element, if any. */
  errorMessageProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function useCheckboxGroup(props: AriaCheckboxGroupProps, state: CheckboxGroupState): CheckboxGroupAria {
  let {isDisabled, name} = props;

  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    // Checkbox group is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: 'span'
  });
  checkboxGroupDescriptionIds.set(state, descriptionProps.id);
  checkboxGroupErrorMessageIds.set(state, errorMessageProps.id);

  let domProps = filterDOMProps(props, {labelable: true});

  // Pass name prop from group to all items by attaching to the state.
  checkboxGroupNames.set(state, name);

  return {
    groupProps: mergeProps(domProps, {
      role: 'group',
      'aria-disabled': isDisabled || undefined,
      ...fieldProps
    }),
    labelProps,
    descriptionProps,
    errorMessageProps
  };
}
