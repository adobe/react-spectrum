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

import {DOMAttributes, RefObject} from '@react-types/shared';
import {GridRowProps} from '@react-aria/grid';
import {tableNestedRows} from '@react-stately/flags';
import {TableState} from '@react-stately/table';

export interface TableHeaderRowAria {
  /** Props for the grid row element. */
  rowProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a header row in a table.
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useTableHeaderRow<T>(props: GridRowProps<T>, state: TableState<T>, ref: RefObject<Element | null>): TableHeaderRowAria {
  let {node, isVirtualized} = props;
  let rowProps = {
    role: 'row'
  };

  if (isVirtualized && !(tableNestedRows() && 'expandedKeys' in state)) {
    rowProps['aria-rowindex'] = node.index + 1; // aria-rowindex is 1 based
  }

  return {
    rowProps
  };
}
