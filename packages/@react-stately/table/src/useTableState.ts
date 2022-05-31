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

// import {AffectedColumnWidths} from './useTableColumnResizeState';
import {CollectionBase, Node, SelectionMode, Sortable, SortDescriptor, SortDirection} from '@react-types/shared';
// import {GridNode} from '@react-types/grid';
import {GridState, useGridState} from '@react-stately/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key, useMemo} from 'react';
import {MultipleSelectionStateProps} from '@react-stately/selection';
import {TableCollection} from './TableCollection';
import {useCollection} from '@react-stately/collections';

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  /** A collection of rows and columns in the table. */
  collection: ITableCollection<T>,
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes: boolean,
  /** The current sorted column and direction. */
  sortDescriptor: SortDescriptor,
  /** Calls the provided onSortChange handler with the provided column key and sort direction. */
  sort(columnKey: Key, direction?: 'ascending' | 'descending'): void
  // /** A map of all the column widths by key. */
  // columnWidths: MutableRefObject<Map<Key, number>>,
  // /** Boolean for if a column is being resized. */
  // isResizingColumn: boolean,
  // /** Getter for column width. */
  // getColumnWidth(key: Key): number,
  //   /** Getter for column min width. */
  // getColumnMinWidth(key: Key): number,
  //   /** Getter for column max widths. */
  // getColumnMaxWidth(key: Key): number,
  // /** Trigger a resize and recalc. */
  // onColumnResize: (column: GridNode<T>, width: number) => void,
  // /** Runs at the start of resizing. */
  // onColumnResizeStart: () => void,
  // /** Triggers the onColumnResizeEnd prop. */
  // onColumnResizeEnd: () => void,
  // /** Need to be able to set the table width so that it can be used to calculate the column widths, this will trigger a recalc. */
  // setTableWidth: (width: number) => void
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface TableStateProps<T> extends CollectionBase<T>, MultipleSelectionStateProps, Sortable {
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes?: boolean
  // /** Function for determining the default width of columns. */
  // getDefaultWidth?: (props) => string | number,
  // /** Callback that is invoked during the entirety of the resize event. */
  // onColumnResize?: (affectedColumnWidths: AffectedColumnWidths) => void,
  // /** Callback that is invoked when the resize event is ended. */
  // onColumnResizeEnd?: (affectedColumnWidths: AffectedColumnWidths) => void
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
  let {selectionMode = 'none'} = props;

  let context = useMemo(() => ({
    showSelectionCheckboxes: props.showSelectionCheckboxes && selectionMode !== 'none',
    selectionMode,
    columns: []
  }), [props.children, props.showSelectionCheckboxes, selectionMode]);

  let collection = useCollection<T, TableCollection<T>>(
    props,
    (nodes, prev) => new TableCollection(nodes, prev, context),
    context
  );
  let {disabledKeys, selectionManager} = useGridState({...props, collection});

  // const tableColumnResizeState = useTableColumnResizeState({columns: collection.columns, getDefaultWidth: props.getDefaultWidth, onColumnResize: props.onColumnResize, onColumnResizeEnd: props.onColumnResizeEnd});


  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: props.sortDescriptor,
    sort(columnKey: Key, direction?: 'ascending' | 'descending') {
      props.onSortChange({
        column: columnKey,
        direction: direction ?? (props.sortDescriptor?.column === columnKey
          ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
          : 'ascending')
      });
    }
    // ...tableColumnResizeState
  };
}
