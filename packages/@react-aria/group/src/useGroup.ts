/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaFieldProps, FieldAria, useField} from '@react-aria/label';
import {DOMAttributes, InputBase} from '@react-types/shared';
import {GroupState} from '@react-stately/group';
import {HTMLAttributes} from 'react';

export interface AriaGroupProps extends AriaFieldProps, InputBase, Pick<HTMLAttributes<HTMLElement>, 'aria-invalid' | 'aria-disabled' | 'aria-readonly'> {
  /** The HTML role for the group element. */
  role?: 'group' | 'presentation' | 'region'
}

export interface GroupAria extends Omit<FieldAria, 'fieldProps'> {
  /** Props for the group element. */
  groupProps: DOMAttributes
}

/**
 * Provides the accessibility implementation for a group of fields.
 * @param props - Props for the Group.
 */
export function useGroup(props: AriaGroupProps, state: GroupState): GroupAria {
  let {label, role = 'group'} = props;
  let {isInvalid, isDisabled, isReadOnly} = state;

  // We can suppress the missing label warning
  if (!props['aria-label'] && !props['aria-labelledby']) {
    props['aria-labelledby'] = ' ';
  }

  // We can treat the group as just another field for labeling purposes
  let {fieldProps, labelProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    label, 
    isInvalid,
    labelElementType: 'span'
  });

  return {
    labelProps,
    groupProps: {
      role,
      ...fieldProps,
      'aria-invalid': isInvalid,
      'aria-disabled': isDisabled,
      'aria-readonly': isReadOnly,
      'aria-labelledby': fieldProps['aria-labelledby'] || undefined
    },
    descriptionProps,
    errorMessageProps
  };
}
