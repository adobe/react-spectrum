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

import {AriaCheckboxProps} from '@react-types/checkbox';
import {getRowId} from './utils';
import {Key} from 'react';
import type {ListState} from '@react-stately/list';
import {useGridSelectionCheckbox} from '@react-aria/grid';

export interface SelectionCheckboxProps {
  /** A unique key for the checkbox. */
  key: Key
}

export interface SelectionCheckboxAria {
  /** Props for the row selection checkbox element. */
  checkboxProps: AriaCheckboxProps
}

/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a list.
 * @param props - Props for the selection checkbox.
 * @param state - State of the list, as returned by `useListState`.
 */
export function useListSelectionCheckbox<T>(props: SelectionCheckboxProps, state: ListState<T>): SelectionCheckboxAria {
  let {key} = props;
  const {checkboxProps} = useGridSelectionCheckbox(props, state as any);

  return {
    checkboxProps: {
      ...checkboxProps,
      'aria-labelledby': `${checkboxProps.id} ${getRowId(state, key)}`
    }
  };
}
