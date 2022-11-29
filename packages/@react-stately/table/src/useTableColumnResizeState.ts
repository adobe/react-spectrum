
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
export interface TableColumnResizeState<T> {
  /** Trigger a resize and recalculation. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Callback for when onColumnResize has started. */
  onColumnResizeStart: (column: GridNode<T>) => void,
  /** Callback for when onColumnResize has ended. */
  onColumnResizeEnd: (column: GridNode<T>) => void,
  /** Gets the current width for the specified column. */
  getColumnWidth: (key: Key) => number,
  /** Gets the current minWidth for the specified column. */
  getColumnMinWidth: (key: Key) => number,
  /** Gets the current maxWidth for the specified column. */
  getColumnMaxWidth: (key: Key) => number,
  /** Currently calculated widths for all columns. */
  widths: Map<Key, number>
}


export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps<T>, state): TableColumnResizeState<T> {
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
  , [state.collection.columns]); // is this a safe thing to memo on? what if a single column changes?

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

    let map = new Map(Array.from(uncontrolledWidths).map(([key]) => [key, newSizes.get(key)]));
    map.set(column.key, width);
    setWidths(map);

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
