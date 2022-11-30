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
import {Key, useCallback, useMemo, useState} from 'react';
import {TableColumnLayout} from '@react-stately/layout/src/TableLayout';

export interface TableColumnResizeStateProps<T> {
  /**
   * Current width of the table or table viewport that the columns
   * should be calculated against.
   **/
  tableWidth: number,
  /** A function that is called to find the default width for a given column. */
  getDefaultWidth: (node: GridNode<T>) => ColumnSize,
  /** A function that is called to find the default minWidth for a given column. */
  getDefaultMinWidth: (node: GridNode<T>) => ColumnSize,
  /** Callback that is invoked during the entirety of the resize event. */
  onColumnResize?: (widths: Map<Key, ColumnSize>) => void,
  /** Callback that is invoked when the resize event is started. */
  onColumnResizeStart?: (key: Key) => void,
  /** Callback that is invoked when the resize event is ended. */
  onColumnResizeEnd?: (key: Key) => void
}
export interface TableColumnResizeState {
  /** Trigger a resize and recalculation. */
  onColumnResize: (key: Key, width: number) => void,
  /** Callback for when onColumnResize has started. */
  onColumnResizeStart: (key: Key) => void,
  /** Callback for when onColumnResize has ended. */
  onColumnResizeEnd: (key: Key) => void,
  /** Gets the current width for the specified column. */
  getColumnWidth: (key: Key) => number,
  /** Gets the current minWidth for the specified column. */
  getColumnMinWidth: (key: Key) => number,
  /** Gets the current maxWidth for the specified column. */
  getColumnMaxWidth: (key: Key) => number,
  /** Currently calculated widths for all columns. */
  widths: Map<Key, number>
}


export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps<T>, state): TableColumnResizeState {
  let {
    getDefaultWidth,
    getDefaultMinWidth,
    onColumnResizeStart: propsOnColumnResizeStart,
    onColumnResizeEnd: propsOnColumnResizeEnd
  } = props;

  let columnLayout = useMemo(
    () => new TableColumnLayout({
      getDefaultWidth,
      getDefaultMinWidth
    }),
    [getDefaultWidth, getDefaultMinWidth]
  );

  let tableWidth = props.tableWidth ?? 0;
  let [controlledWidths, uncontrolledWidths]: [Map<Key, GridNode<unknown>>, Map<Key, GridNode<unknown>>] = useMemo(() =>
    state.collection.columns.reduce((acc, col) => {
      if (col.props.width !== undefined) {
        acc[0].set(col.key, col);
      } else {
        acc[1].set(col.key, col);
      }
      return acc;
    }, [new Map(), new Map()])
  , [state.collection.columns]); // is this a safe thing to memo on? what if a single column changes?

  // uncontrolled column widths
  let [widths, setWidths] = useState<Map<Key, ColumnSize>>(() => new Map(
    Array.from(uncontrolledWidths).map(([key, col]) =>
      [key, col.props.defaultWidth ?? getDefaultWidth?.(col.props)]
    ))
  );
  // combine columns back into one map that maintains same order as the columns
  let cWidths = useMemo(() => new Map(state.collection.columns.map(col => {
    if (uncontrolledWidths.has(col.key)) {
      return [col.key, widths.get(col.key)];
    } else {
      return [col.key, controlledWidths.get(col.key).props.width];
    }
  })), [state.collection.columns, uncontrolledWidths, controlledWidths, widths]);

  let onColumnResizeStart = useCallback((key: Key) => {
    columnLayout.setResizingColumn(key);
    propsOnColumnResizeStart?.(key);
  }, [columnLayout, propsOnColumnResizeStart]);

  // TODO: move props.on* all into this file and layout, or move them all out to the aria handler..., stately would be preferable
  let onColumnResize = useCallback((key: Key, width: number): Map<Key, ColumnSize> => {
    let newControlled = new Map(Array.from(controlledWidths).map(([key, entry]) => [key, entry.props.width]));
    let newSizes = columnLayout.resizeColumnWidth(tableWidth, state.collection, newControlled, widths, key, width);

    let map = new Map(Array.from(uncontrolledWidths).map(([key]) => [key, newSizes.get(key)]));
    map.set(key, width);
    setWidths(map);

    return newSizes;
  }, [controlledWidths, uncontrolledWidths, setWidths, tableWidth, columnLayout, state.collection, widths]);

  let onColumnResizeEnd = useCallback((key: Key) => {
    columnLayout.setResizingColumn(null);
    propsOnColumnResizeEnd?.(key);
  }, [columnLayout, propsOnColumnResizeEnd]);

  // done
  let getColumnWidth = useCallback((key: Key) =>
    columnLayout.getColumnWidth(key)
  , [columnLayout]);

  // done
  let getColumnMinWidth = useCallback((key: Key) =>
    columnLayout.getColumnMinWidth(key)
  , [columnLayout]);

  // done
  let getColumnMaxWidth = useCallback((key: Key) =>
    columnLayout.getColumnMaxWidth(key)
  , [columnLayout]);

  let columnWidths = useMemo(() =>
      columnLayout.buildColumnWidths(tableWidth, state.collection, cWidths)
  , [tableWidth, state.collection, cWidths, columnLayout]);

  return useMemo(() => ({
    resizingColumn: columnLayout.resizingColumn,
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
    widths: columnWidths
  }), [
    columnLayout.resizingColumn,
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
    columnWidths
  ]);
}
