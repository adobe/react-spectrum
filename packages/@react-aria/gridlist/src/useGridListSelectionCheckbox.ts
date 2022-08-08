/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaGridSelectionCheckboxProps, GridSelectionCheckboxAria, useGridSelectionCheckbox} from '@react-aria/grid';
import {getRowId} from './utils';
import type {ListState} from '@react-stately/list';

/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a grid list.
 * @param props - Props for the selection checkbox.
 * @param state - State of the list, as returned by `useListState`.
 */
export function useGridListSelectionCheckbox<T>(props: AriaGridSelectionCheckboxProps, state: ListState<T>): GridSelectionCheckboxAria {
  let {key} = props;
  const {checkboxProps} = useGridSelectionCheckbox(props, state as any);

  return {
    checkboxProps: {
      ...checkboxProps,
      'aria-labelledby': `${checkboxProps.id} ${getRowId(state, key)}`
    }
  };
}
