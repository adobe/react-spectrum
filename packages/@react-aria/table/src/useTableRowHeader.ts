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

import {getCellId} from './utils';
import {GridNode} from '@react-types/grid';
import {HTMLAttributes, RefObject} from 'react';
import {TableState} from '@react-stately/table';
import {useGridCell} from '@react-aria/grid';

interface RowHeaderProps {
  /** An object representing the row header. Contains all the relevant information that makes up the row header. */
  node: GridNode<unknown>,
  /** The ref attached to the row header. */
  ref: RefObject<HTMLElement>,
  /** Whether the row header is contained in a virtual scroller. */
  isVirtualized?: boolean,
  /** Whether the row header is disabled. */
  isDisabled?: boolean
}

interface RowHeaderAria {
  /** Props for the row header element. */
  rowHeaderProps: HTMLAttributes<HTMLElement>
}

export function useTableRowHeader<T>(props: RowHeaderProps, state: TableState<T>): RowHeaderAria {
  let {gridCellProps} = useGridCell(props, state);

  let columnKey = props.node.column.key;
  return {
    rowHeaderProps: {
      ...gridCellProps,
      role: 'rowheader',
      id: getCellId(state, props.node.parentKey, columnKey)
    }
  };
}
