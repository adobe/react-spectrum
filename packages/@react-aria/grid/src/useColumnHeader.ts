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

import {getColumnHeaderId} from './utils';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, Key, RefObject} from 'react';
import {useGridCell} from './useGridCell';

interface ColumnHeaderProps {
  key: Key,
  ref: RefObject<HTMLElement>,
  isVirtualized?: boolean,
  colspan?: number
}

interface ColumnHeaderAria {
  columnHeaderProps: HTMLAttributes<HTMLElement>
}

export function useColumnHeader<T>(props: ColumnHeaderProps, state: GridState<T>): ColumnHeaderAria {
  let {key, colspan} = props;
  let {gridCellProps} = useGridCell(props, state);

  return {
    columnHeaderProps: {
      ...gridCellProps,
      role: 'columnheader',
      id: getColumnHeaderId(state, key),
      'aria-colspan': colspan && colspan > 1 ? colspan : null
      // 'aria-sort'
    }
  };
}
