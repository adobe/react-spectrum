/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DOMAttributes} from '@react-types/shared';
import {getChildNodes, getFirstItem} from '@react-stately/collections';
import {GridNode} from '@react-types/grid';
import {TableState} from '@react-stately/table';
import {useId} from '@react-aria/utils';

export interface AriaTableSectionProps<T> {
  /** An object representing the table section. Contains all the relevant information that makes up the section. */
  node: GridNode<T>,
  /** Whether the cell is contained in a virtual scroller. */
  isVirtualized?: boolean
}

export interface TableSectionAria {
  /** Props for the table section's row group element. */
  rowGroupProps: DOMAttributes,
  /** Props for the table section's grid row element. */
  rowProps: DOMAttributes,
  /** Props for the table section's grid cell element. */
  gridCellProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a section in a table.
 * @param props - Props for the section.
 */
export function useTableSection<T>(props: AriaTableSectionProps<T>, state: TableState<T>): TableSectionAria {
  let {node, isVirtualized} = props;
  let headerId = useId();
  let rowIndex;

  if (isVirtualized) {
    rowIndex = (getFirstItem(getChildNodes(node, state.collection)) as GridNode<T>).rowIndex;
  }

  return {
    rowGroupProps: {
      // TODO: Chrome VO states "empty row group", doesn't happen in Safari VO. Doesn't happen in NVDA or TalkBack
      role: 'rowgroup',
      'aria-labelledby': headerId
    },
    rowProps: {
      role: 'row',
      'aria-rowindex': rowIndex
    },
    gridCellProps: {
      id: headerId,
      role: 'rowheader',
      'aria-colspan': node.colspan,
      'aria-label': node.textValue || undefined
    }
  };
}
