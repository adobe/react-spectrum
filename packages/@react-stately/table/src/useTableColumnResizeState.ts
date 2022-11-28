
import {GridNode} from '@react-types/grid';
import {Key, useCallback, useMemo, useState} from 'react';
import {TableColumnLayout} from '@react-stately/layout/src/TableLayout';

export interface TableColumnResizeState<T> {
  /** Trigger a resize and recalculation. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Callback for when onColumnResize has started. */
  onColumnResizeStart: (column: GridNode<T>) => void,
  /** Callback for when onColumnResize has ended. */
  onColumnResizeEnd: (column: GridNode<T>) => void,
  getColumnWidth: (key: Key) => number,
  getColumnMinWidth: (key: Key) => number,
  getColumnMaxWidth: (key: Key) => number,
  widths: Map<Key, number>
}

export interface TableColumnResizeStateProps {
  tableWidth: number,
  getDefaultWidth,
  getDefaultMinWidth,
  /** Callback that is invoked during the entirety of the resize event. */
  onColumnResize?: (widths: Map<Key, number | string>) => void,
  /** Callback that is invoked when the resize event is started. */
  onColumnResizeStart?: (key: Key) => void,
  /** Callback that is invoked when the resize event is ended. */
  onColumnResizeEnd?: (key: Key) => void
}

export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps, state): TableColumnResizeState<T> {
  let {
    getDefaultWidth,
    getDefaultMinWidth
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
  , [state.collection.columns]);

  // uncontrolled column widths
  let [widths, setWidths] = useState<Map<Key, number | string>>(() => new Map(
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
  })), [state.collection.columns, uncontrolledWidths, controlledWidths]);


  let onColumnResizeStart = useCallback((column: GridNode<T>) => {
    columnLayout.setResizingColumn(column.key);
    props.onColumnResizeStart && props.onColumnResizeStart(column.key);
  }, [columnLayout, props.onColumnResizeStart]);

  let onColumnResize = useCallback((column: GridNode<T>, width: number): Map<Key, number | string> => {
    let newControlled = new Map(Array.from(controlledWidths).map(([key, entry]) => [key, entry.props.width]));
    let newSizes = columnLayout.resizeColumnWidth(tableWidth, state.collection, newControlled, widths, column.key, width);

    if (!column.props.width) {
      let map = new Map(Array.from(uncontrolledWidths).map(([key]) => [key, newSizes.get(key)]));
      map.set(column.key, width);
      setWidths(map);
    }
    return newSizes;
  }, [controlledWidths, uncontrolledWidths, props.onColumnResize, setWidths, tableWidth, columnLayout, state.collection, widths]);

  let onColumnResizeEnd = useCallback((column: GridNode<T>) => {
    columnLayout.setResizingColumn(null);
    props.onColumnResizeEnd && props.onColumnResizeEnd(column.key);
  }, [columnLayout, props.onColumnResizeEnd]);

  // done
  let getColumnWidth = useCallback((key: Key) => {
    return columnLayout.getColumnWidth(key);
  }, [columnLayout]);

  // done
  let getColumnMinWidth = useCallback((key: Key) => {
    let columnMinWidth = state.collection.columns.find(col => col.key === key).props.minWidth;
    return columnLayout.getColumnMinWidth(columnMinWidth, tableWidth);
  }, [columnLayout, state.collection, tableWidth]);

  // done
  let getColumnMaxWidth = useCallback((key: Key) => {
    let columnMaxWidth = state.collection.columns.find(col => col.key === key).props.maxWidth;
    return columnLayout.getColumnMaxWidth(columnMaxWidth, tableWidth);
  }, [columnLayout, state.collection, tableWidth]);

  let setResizingColumn = useCallback((key: Key) => {
    columnLayout.setResizingColumn(key);
  }, [columnLayout]);

  let setResizeColumnWidth = useCallback((width) => {
    columnLayout.setResizeColumnWidth(width);
  }, [columnLayout]);

  let columnWidths = useMemo(() =>
      columnLayout.buildColumnWidths(tableWidth, state.collection, cWidths)
  , [tableWidth, state.collection, cWidths]);

  return useMemo(() => ({
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
    setResizingColumn,
    setResizeColumnWidth,
    widths: columnWidths
  }), [
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
    setResizingColumn,
    setResizeColumnWidth,
    columnWidths
  ]);
}
