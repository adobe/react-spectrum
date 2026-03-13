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

import {ColumnSize} from '@react-types/table';
import {GridNode} from '@react-types/grid';
import {Key} from '@react-types/shared';
import {TableColumnLayout} from './TableColumnLayout';
import {TableState} from './useTableState';
import {useCallback, useMemo, useState} from 'react';

export interface TableColumnResizeStateProps<T> {
  /**
   * Current width of the table or table viewport that the columns
   * should be calculated against.
   */
  tableWidth: number,
  /** A function that is called to find the default width for a given column. */
  getDefaultWidth?: (node: GridNode<T>) => ColumnSize | null | undefined,
  /** A function that is called to find the default minWidth for a given column. */
  getDefaultMinWidth?: (node: GridNode<T>) => ColumnSize | null | undefined
}
export interface TableColumnResizeState<T> {
  /**
   * Called to update the state that a resize event has occurred.
   * Returns the new widths for all columns based on the resized column.
   */
  updateResizedColumns: (key: Key, width: number) => Map<Key, ColumnSize>,
  /** Callback for when onColumnResize has started. */
  startResize: (key: Key) => void,
  /** Callback for when onColumnResize has ended. */
  endResize: () => void,
  /** Gets the current width for the specified column. */
  getColumnWidth: (key: Key) => number,
  /** Gets the current minWidth for the specified column. */
  getColumnMinWidth: (key: Key) => number,
  /** Gets the current maxWidth for the specified column. */
  getColumnMaxWidth: (key: Key) => number,
  /** Key of the currently resizing column. */
  resizingColumn: Key | null,
  /** A reference to the table state. */
  tableState: TableState<T>,
  /** A map of the current column widths. */
  columnWidths: Map<Key, number>
}

/**
 * Provides column width state management for a table component with column resizing support. Handles building
 * a map of column widths calculated from the table's width and any provided column width information from the collection.
 * In addition, it tracks the currently resizing column and provides callbacks for updating the widths upon resize operations.
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 */
export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps<T>, state: TableState<T>): TableColumnResizeState<T> {
  let {
    getDefaultWidth,
    getDefaultMinWidth,
    tableWidth = 0
  } = props;

  let [resizingColumn, setResizingColumn] = useState<Key | null>(null);
  let columnLayout = useMemo(
    () => new TableColumnLayout({
      getDefaultWidth,
      getDefaultMinWidth
    }),
    [getDefaultWidth, getDefaultMinWidth]
  );

  let [controlledColumns, uncontrolledColumns] = useMemo(() =>
      columnLayout.splitColumnsIntoControlledAndUncontrolled(state.collection.columns)
  , [state.collection.columns, columnLayout]);

  // uncontrolled column widths
  let [uncontrolledWidths, setUncontrolledWidths] = useState(() =>
    columnLayout.getInitialUncontrolledWidths(uncontrolledColumns)
  );

  // Update uncontrolled widths if the columns changed.
  let [lastColumns, setLastColumns] = useState(state.collection.columns);
  if (state.collection.columns !== lastColumns) {
    if (
      state.collection.columns.length !== lastColumns.length ||
      state.collection.columns.some((c, i) => c.key !== lastColumns[i].key)
    ) {
      let newUncontrolledWidths = columnLayout.getInitialUncontrolledWidths(uncontrolledColumns);
      setUncontrolledWidths(newUncontrolledWidths);
    }
    setLastColumns(state.collection.columns);
  }

  // combine columns back into one map that maintains same order as the columns
  let colWidths = useMemo(() =>
      columnLayout.recombineColumns(state.collection.columns, uncontrolledWidths, uncontrolledColumns, controlledColumns)
  , [state.collection.columns, uncontrolledWidths, uncontrolledColumns, controlledColumns, columnLayout]);

  let startResize = useCallback((key: Key) => {
    setResizingColumn(key);
  }, [setResizingColumn]);

  let updateResizedColumns = useCallback((key: Key, width: number): Map<Key, ColumnSize> => {
    let newSizes = columnLayout.resizeColumnWidth(state.collection, uncontrolledWidths, key, width);
    let map = new Map(Array.from(uncontrolledColumns).map(([key]) => [key, newSizes.get(key)!]));
    map.set(key, width);
    setUncontrolledWidths(map);
    return newSizes;
  }, [uncontrolledColumns, setUncontrolledWidths, columnLayout, state.collection, uncontrolledWidths]);

  let endResize = useCallback(() => {
    setResizingColumn(null);
  }, [setResizingColumn]);

  let columnWidths = useMemo(() =>
    columnLayout.buildColumnWidths(tableWidth, state.collection, colWidths)
  , [tableWidth, state.collection, colWidths, columnLayout]);

  return useMemo(() => ({
    resizingColumn,
    updateResizedColumns,
    startResize,
    endResize,
    getColumnWidth: (key: Key) =>
      columnLayout.getColumnWidth(key),
    getColumnMinWidth: (key: Key) =>
      columnLayout.getColumnMinWidth(key),
    getColumnMaxWidth: (key: Key) =>
      columnLayout.getColumnMaxWidth(key),
    tableState: state,
    columnWidths
  }), [
    columnLayout,
    columnWidths,
    resizingColumn,
    updateResizedColumns,
    startResize,
    endResize,
    state
  ]);
}
