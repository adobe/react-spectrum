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

import {ColumnSize} from './Column';
import {ColumnWidthEntry, columnWidthsEqual} from './columnWidthCSS';
import {GridNode} from '../grid/GridCollection';
import {Key} from '@react-types/shared';
import {TableColumnLayout} from './TableColumnLayout';
import {TableState} from './useTableState';
import {useCallback, useMemo, useRef, useState} from 'react';

function buildPixelWidths<T>(
  layout: TableColumnLayout<T>,
  tableWidth: number,
  collection: TableState<T>['collection'],
  sizes: Map<Key, ColumnSize>
): Map<Key, number> {
  let snapshot = new TableColumnLayout<T>({
    getDefaultWidth: layout.getDefaultWidth.bind(layout),
    getDefaultMinWidth: layout.getDefaultMinWidth.bind(layout)
  });
  return snapshot.buildColumnWidths(tableWidth, collection, sizes);
}

export interface TableColumnResizeStateProps<T> {
  /**
   * Current width of the table or table viewport that the columns
   * should be calculated against.
   */
  tableWidth: number;
  /** A function that is called to find the default width for a given column. */
  getDefaultWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
  /** A function that is called to find the default minWidth for a given column. */
  getDefaultMinWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
}

export interface TableColumnResizeState<T> {
  /**
   * Called to update the state that a resize event has occurred.
   * Returns the new widths for all columns based on the resized column.
   */
  updateResizedColumns: (key: Key, width: number) => Map<Key, ColumnSize>;
  /** Callback for when onColumnResize has started. */
  startResize: (key: Key) => void;
  /** Callback for when onColumnResize has ended. */
  endResize: () => void;
  /** Gets the current width for the specified column. */
  getColumnWidth: (key: Key) => number;
  /** Gets the current minWidth for the specified column. */
  getColumnMinWidth: (key: Key) => number;
  /** Gets the current maxWidth for the specified column. */
  getColumnMaxWidth: (key: Key) => number;
  /** Key of the currently resizing column. */
  resizingColumn: Key | null;
  /** A reference to the table state. */
  tableState: TableState<T>;
  /** A map of the current committed column widths. */
  columnWidths: Map<Key, number>;
  /** Column entries with keys and indices for CSS variable application. */
  columnEntries: ColumnWidthEntry[];
  /** Returns the current pixel column widths, including during an active resize. */
  getCurrentPixelWidths: () => Map<Key, number>;
  /** Rebuilds pixel widths when the table viewport resizes during an active column resize. */
  rebuildWidthsForViewportResize: () => void;
}

/**
 * Provides column width state management for a table component with column resizing support.
 * Handles building a map of column widths calculated from the table's width and any provided column
 * width information from the collection. In addition, it tracks the currently resizing column and
 * provides callbacks for updating the widths upon resize operations.
 *
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 */
export function useTableColumnResizeState<T>(
  props: TableColumnResizeStateProps<T>,
  state: TableState<T>
): TableColumnResizeState<T> {
  let {getDefaultWidth, getDefaultMinWidth, tableWidth = 0} = props;

  let [resizingColumn, setResizingColumn] = useState<Key | null>(null);
  let isResizingRef = useRef(false);
  let pendingUncontrolledWidthsRef = useRef<Map<Key, ColumnSize>>(new Map());
  let pendingSizesRef = useRef<Map<Key, ColumnSize> | null>(null);

  let columnLayout = useMemo(
    () =>
      new TableColumnLayout({
        getDefaultWidth,
        getDefaultMinWidth
      }),
    [getDefaultWidth, getDefaultMinWidth]
  );

  let [controlledColumns, uncontrolledColumns] = useMemo(
    () => columnLayout.splitColumnsIntoControlledAndUncontrolled(state.collection.columns),
    [state.collection.columns, columnLayout]
  );

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

  let columnEntries: ColumnWidthEntry[] = useMemo(
    () => state.collection.columns.map(column => ({key: column.key, index: column.index})),
    [state.collection.columns]
  );

  // combine columns back into one map that maintains same order as the columns
  let colWidths = useMemo(
    () =>
      columnLayout.recombineColumns(
        state.collection.columns,
        uncontrolledWidths,
        uncontrolledColumns,
        controlledColumns
      ),
    [
      state.collection.columns,
      uncontrolledWidths,
      uncontrolledColumns,
      controlledColumns,
      columnLayout
    ]
  );

  // oxlint-disable react/react-compiler
  let columnWidths = useMemo(() => {
    let sizes = colWidths;

    if (pendingSizesRef.current != null) {
      if (isResizingRef.current) {
        sizes = pendingSizesRef.current;
      } else if (
        !columnWidthsEqual(
          buildPixelWidths(columnLayout, tableWidth, state.collection, colWidths),
          buildPixelWidths(columnLayout, tableWidth, state.collection, pendingSizesRef.current)
        )
      ) {
        sizes = pendingSizesRef.current;
      } else {
        pendingSizesRef.current = null;
      }
    }

    return columnLayout.buildColumnWidths(tableWidth, state.collection, sizes);
  }, [tableWidth, state.collection, colWidths, columnLayout]);
  // oxlint-enable react/react-compiler

  let getCurrentPixelWidths = useCallback(() => columnLayout.columnWidths, [columnLayout]);

  let rebuildWidthsForViewportResize = useCallback(() => {
    // oxlint-disable-next-line react/react-compiler
    if (isResizingRef.current && pendingSizesRef.current) {
      columnLayout.buildColumnWidths(tableWidth, state.collection, pendingSizesRef.current);
    }
  }, [columnLayout, tableWidth, state.collection]);

  let startResize = useCallback(
    (key: Key) => {
      isResizingRef.current = true;
      pendingUncontrolledWidthsRef.current = uncontrolledWidths;
      setResizingColumn(key);
    },
    [uncontrolledWidths]
  );

  let updateResizedColumns = useCallback(
    (key: Key, width: number): Map<Key, ColumnSize> => {
      let currentUncontrolled = isResizingRef.current
        ? pendingUncontrolledWidthsRef.current
        : uncontrolledWidths;

      let newSizes = columnLayout.resizeColumnWidth(
        state.collection,
        currentUncontrolled,
        key,
        width
      );
      let map = new Map(
        Array.from(uncontrolledColumns).map(([colKey]) => [colKey, newSizes.get(colKey)!])
      );
      map.set(key, width);
      // oxlint-disable-next-line react/react-compiler
      pendingSizesRef.current = newSizes;

      if (isResizingRef.current) {
        pendingUncontrolledWidthsRef.current = map;
        columnLayout.buildColumnWidths(tableWidth, state.collection, newSizes);
      } else {
        setUncontrolledWidths(map);
      }

      return newSizes;
    },
    [uncontrolledColumns, columnLayout, state.collection, uncontrolledWidths, tableWidth]
  );

  // oxlint-disable-next-line react/react-compiler
  let endResize = useCallback(() => {
    if (isResizingRef.current) {
      setUncontrolledWidths(pendingUncontrolledWidthsRef.current);
      isResizingRef.current = false;
    }
    setResizingColumn(null);
  }, [setUncontrolledWidths]);

  return useMemo(
    () => ({
      resizingColumn,
      updateResizedColumns,
      startResize,
      endResize,
      getColumnWidth: (key: Key) => columnLayout.getColumnWidth(key),
      getColumnMinWidth: (key: Key) => columnLayout.getColumnMinWidth(key),
      getColumnMaxWidth: (key: Key) => columnLayout.getColumnMaxWidth(key),
      tableState: state,
      columnWidths,
      columnEntries,
      getCurrentPixelWidths,
      rebuildWidthsForViewportResize
    }),
    [
      columnLayout,
      columnWidths,
      columnEntries,
      resizingColumn,
      updateResizedColumns,
      startResize,
      endResize,
      getCurrentPixelWidths,
      rebuildWidthsForViewportResize,
      state
    ]
  );
}
