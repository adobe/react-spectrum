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

import {announce} from '@react-aria/live-announcer';
import {getColumnHeaderId} from './utils';
import {GridNode} from '@react-types/grid';
import {HTMLAttributes, RefObject, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useDescription, useUpdateEffect} from '@react-aria/utils';
import {TableState} from '@react-stately/table';
import {useFocusable} from '@react-aria/focus';
import {useGridCell} from '@react-aria/grid';
import {useMessageFormatter} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';

interface ColumnHeaderProps {
  /** An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader). Contains all the relevant information that makes up the column header. */
  node: GridNode<unknown>,
  /** Whether the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) is contained in a virtual scroller. */
  isVirtualized?: boolean
}

interface ColumnHeaderAria {
  /** Props for the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) element. */
  columnHeaderProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a column header in a table.
 * @param props - Props for the column header.
 * @param state - State of the table, as returned by `useTableState`.
 * @param ref - The ref attached to the column header element.
 */
export function useTableColumnHeader<T>(props: ColumnHeaderProps, state: TableState<T>, ref: RefObject<HTMLElement>): ColumnHeaderAria {
  let {node} = props;
  let allowsSorting = node.props.allowsSorting;
  let {gridCellProps} = useGridCell(props, state, ref);

  let isSelectionCellDisabled = node.props.isSelectionCell && state.selectionManager.selectionMode === 'single';
  let {pressProps} = usePress({
    isDisabled: !allowsSorting || isSelectionCellDisabled,
    onPress() {
      state.sort(node.key);
    }
  });

  // Needed to pick up the focusable context, enabling things like Tooltips for example
  let {focusableProps} = useFocusable({}, ref);

  let formatMessage = useMessageFormatter(intlMessages);
  let sortDescription;
  let isSortedColumn = state.sortDescriptor?.column === node.key;
  let sortDirection = state.sortDescriptor?.direction;
  let lastSortDirection = useRef(isSortedColumn ? sortDirection : 'none');
  if (allowsSorting) {
    // TODO should it announce "sortable none" when a column is sortable but doesn't have sort order applied or is "sortable" enough?
    sortDescription = `${formatMessage('sortable')}`;
    if (isSortedColumn && sortDirection) {
      sortDescription = `${sortDescription}, ${formatMessage(sortDirection)}`;
    }
  }

  useUpdateEffect(() => {
    if (allowsSorting && isSortedColumn && sortDirection !== lastSortDirection.current) {
      // TODO is it enough to simply announce "ascending"/"descending" or should I include the node.textValue? If the latter, then will need to require the user to pass in textValue
      announce(`${node.textValue} ${formatMessage(sortDirection)}`, 'assertive', 500);
      lastSortDirection.current = sortDirection;
    }
  }, [allowsSorting, isSortedColumn, sortDirection, node.textValue]);

  let descriptionProps = useDescription(sortDescription);

  return {
    columnHeaderProps: {
      ...mergeProps(gridCellProps, pressProps, focusableProps, descriptionProps),
      role: 'columnheader',
      id: getColumnHeaderId(state, node.key),
      'aria-colspan': node.colspan && node.colspan > 1 ? node.colspan : null,
      'aria-disabled': isSelectionCellDisabled || undefined
    }
  };
}
