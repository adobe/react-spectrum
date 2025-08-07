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

import {GridState, useGridState} from '@react-stately/grid';
import {TableCollection as ITableCollection, TableBodyProps, TableHeaderProps} from '@react-types/table';
import {Key, Node, SelectionMode, Sortable, SortDescriptor, SortDirection} from '@react-types/shared';
import {MultipleSelectionState, MultipleSelectionStateProps} from '@react-stately/selection';
import {ReactElement, useCallback, useMemo, useState} from 'react';
import {TableCollection} from './TableCollection';
import {useCollection} from '@react-stately/collections';

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  /** A collection of rows and columns in the table. */
  collection: ITableCollection<T>,
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes: boolean,
  /** The current sorted column and direction. */
  sortDescriptor: SortDescriptor | null,
  /** Calls the provided onSortChange handler with the provided column key and sort direction. */
  sort(columnKey: Key, direction?: 'ascending' | 'descending'): void,
  /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  isKeyboardNavigationDisabled: boolean,
  /** Set whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
  setKeyboardNavigationDisabled: (val: boolean) => void
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  showDragButtons: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface TableStateProps<T> extends MultipleSelectionStateProps, Sortable {
  /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
  children?: [ReactElement<TableHeaderProps<T>>, ReactElement<TableBodyProps<T>>],
  /** A list of row keys to disable. */
  disabledKeys?: Iterable<Key>,
  /** A pre-constructed collection to use instead of building one from items and children. */
  collection?: ITableCollection<T>,
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes?: boolean,
  /** Whether the row drag button should be displayed.
   * @private
   */
  showDragButtons?: boolean,
  /** @private - do not use unless you know what you're doing. */
  UNSAFE_selectionState?: MultipleSelectionState
}

const OPPOSITE_SORT_DIRECTION = {
  ascending: 'descending' as SortDirection,
  descending: 'ascending' as SortDirection
};

/**
 * Provides state management for a table component. Handles building a collection
 * of columns and rows from props. In addition, it tracks row selection and manages sort order changes.
 */
export function useTableState<T extends object>(props: TableStateProps<T>): TableState<T> {
  let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = useState(false);
  let {selectionMode = 'none', showSelectionCheckboxes, showDragButtons} = props;

  let context = useMemo(() => ({
    showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== 'none',
    showDragButtons: showDragButtons,
    selectionMode,
    columns: []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [props.children, showSelectionCheckboxes, selectionMode, showDragButtons]);

  let collection = useCollection<T, ITableCollection<T>>(
    props,
    useCallback((nodes) => new TableCollection(nodes, null, context), [context]),
    context
  );
  let {disabledKeys, selectionManager} = useGridState({
    ...props,
    collection,
    disabledBehavior: props.disabledBehavior || 'selection'
  });

  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: props.sortDescriptor ?? null,
    isKeyboardNavigationDisabled: collection.size === 0 || isKeyboardNavigationDisabled,
    setKeyboardNavigationDisabled,
    sort(columnKey: Key, direction?: 'ascending' | 'descending') {
      props.onSortChange?.({
        column: columnKey,
        direction: direction ?? (props.sortDescriptor?.column === columnKey
          ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
          : 'ascending')
      });
    }
  };
}

/**
 * Filters a collection using the provided filter function and returns a new TableState.
 */
export function UNSTABLE_useFilteredTableState<T extends object>(state: TableState<T>, filterFn: ((nodeValue: string, node: Node<T>) => boolean) | null | undefined): TableState<T> {
  let collection = useMemo(() => filterFn ? state.collection.filter!(filterFn) : state.collection, [state.collection, filterFn]) as ITableCollection<T>;
  let selectionManager = state.selectionManager.withCollection(collection);
  // TODO: handle focus key reset? That logic is in useGridState

  return {
    ...state,
    collection,
    selectionManager
  };
}
