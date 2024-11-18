/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAttributes, createContext, useContext} from 'react';
import {InputBase, Validation, ValidationResult} from '@react-types/shared';
import {VALID_VALIDITY_STATE} from '@react-stately/form';

export interface GroupProps extends InputBase, Pick<Validation<any>, 'isInvalid'>, AriaAttributes {

}

export interface GroupState extends ValidationResult {
  /** Whether the group is invalid. */
  isInvalid: boolean,
  /** Whether the group is disabled. */
  isDisabled: boolean,
  /** Whether the group is read-only. */
  isReadOnly: boolean
}

export const GroupStateContext = createContext<Partial<GroupState>>({});

/**
 * Provides the state for a group of fields.
 * @param props - Props for the Group.
 */
export function useGroupState(props: GroupProps): GroupState  {
  let groupState = useContext(GroupStateContext);
  
  let ariaInvalid = !!props['aria-invalid'] && props['aria-invalid'] !== 'false';
  let ariaDisabled = !!props['aria-disabled'] && props['aria-disabled'] !== 'false';
  let ariaReadOnly = !!props['aria-readonly'] && props['aria-readonly'] !== 'false';
  let {isInvalid = ariaInvalid, isDisabled = ariaDisabled, isReadOnly = ariaReadOnly} = props;

  return {
    isInvalid,
    isDisabled,
    isReadOnly,
    ...groupState,
    validationErrors: [],
    validationDetails: {
      ...VALID_VALIDITY_STATE, 
      customError: isInvalid, 
      valid: !isInvalid
    }
  };
}
