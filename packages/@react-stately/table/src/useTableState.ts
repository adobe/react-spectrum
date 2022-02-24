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

import {CollectionBase, Node, SelectionMode, Sortable, SortDescriptor, SortDirection} from '@react-types/shared';
import {GridNode} from '@react-types/grid';
import {GridState, useGridState} from '@react-stately/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key, MutableRefObject, useMemo} from 'react';
import {MultipleSelectionStateProps} from '@react-stately/selection';
import {TableCollection} from './TableCollection';
import {useCollection} from '@react-stately/collections';

import useColumnResizeWidthState from './useColumnResizeWidthState';

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  /** A collection of rows and columns in the table. */
  collection: ITableCollection<T>,
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes: boolean,
  /** The current sorted column and direction. */
  sortDescriptor: SortDescriptor,
  /** Calls the provided onSortChange handler with the provided column key and sort direction. */
  sort(columnKey: Key): void,
  /** A map of all the column widths by key. */
  columnWidths: MutableRefObject<Map<Key, number>>,
  /** Getter for column widths. */
  getColumnWidth(key: Key): number,
  /** Trigger a resize and recalc. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Triggers the onColumnResizeEnd prop. */
  onColumnResizeEnd: (column: GridNode<T>, width: number) => void,
  /** Need to be able to set the table width so that it can be used to calculate the column widths, this will trigger a recalc. */
  setTableWidth: (width: number) => void
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface TableStateProps<T> extends CollectionBase<T>, MultipleSelectionStateProps, Sortable {
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes?: boolean,
  /** Function for determining the default width of columns. */
  getDefaultWidth?: (props) => string | number,
  onColumnResize?: (affectedColumnWidths: { key: Key, width: number }[]) => void,
  onColumnResizeEnd?: (affectedColumnWidths: { key: Key, width: number }[]) => void
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
    
  // map of the columns and their width, key is the column key, value is the width
  // TODO: switch to useControlledState
  const [columnWidths, resizeColumn, setTableWidth] = useColumnResizeWidthState(collection.columns, props.getDefaultWidth);

  function getColumnWidth(key: Key): number {
    return columnWidths.current.get(key) ?? 0;
  }

  function onColumnResize(column: GridNode<T>, width: number) {
    let widthsObj = resizeColumn(column, width);
    props.onColumnResize && props.onColumnResize(widthsObj);
  }

  function onColumnResizeEnd(column: GridNode<T>, width: number) {
    if (props.onColumnResizeEnd) {
      let widthsObj = resizeColumn(column, width);
      props.onColumnResizeEnd(widthsObj);
    }
  }

  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: props.sortDescriptor,
    sort(columnKey: Key) {
      props.onSortChange({
        column: columnKey,
        direction: props.sortDescriptor?.column === columnKey
          ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
          : 'ascending'
      });
    },
    columnWidths,
    getColumnWidth,
    onColumnResize,
    onColumnResizeEnd,
    setTableWidth
  };
}
