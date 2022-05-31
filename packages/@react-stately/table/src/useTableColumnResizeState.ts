// @ts-nocheck

import {ColumnProps} from '@react-types/table';
import {getContentWidth, getDynamicColumnWidths, getMaxWidth, getMinWidth, isStatic, parseStaticWidth} from './utils';
import {GridNode} from '@react-types/grid';
import {Key, MutableRefObject, useCallback, useRef, useState} from 'react';

export interface AffectedColumnWidth {
  /** The column key. */
  key: Key,
  /** The column width. */
  width: number
}
export interface AffectedColumnWidths extends Array<AffectedColumnWidth> {}

export interface ColumnResizeState<T> {
  /** A ref whose current value is the state of all the column widths. */
  columnWidths: MutableRefObject<Map<Key, number>>,
  /** Setter for the table width. */
  setTableWidth: (width: number) => void,
  /** Trigger a resize and recalc. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Callback for when onColumnResize has started. */
  onColumnResizeStart: () => void,
    /** Callback for when onColumnResize has ended. */
  onColumnResizeEnd: () => void,
  /** Getter for column width. */
  getColumnWidth(key: Key): number,
    /** Getter for column min width. */
  getColumnMinWidth(key: Key): number,
    /** Getter for column max widths. */
  getColumnMaxWidth(key: Key): number,
  /** Boolean for if a column is being resized. */
  isResizingColumn: boolean
}

export interface ColumnResizeStateProps<T> {
  /** Collection of existing columns. */
  columns: GridNode<T>[],
  /** Callback to determine what the default width of a column should be. */
  getDefaultWidth?: (props) => string | number,
  /** Callback that is invoked during the entirety of the resize event. */
  onColumnResize?: (affectedColumnWidths: AffectedColumnWidths) => void,
  /** Callback that is invoked when the resize event is ended. */
  onColumnResizeEnd?: (affectedColumnWidths: AffectedColumnWidths) => void,
  /** The default table width. */
  tableWidth?: number
}

export function useTableColumnResizeState<T>(props: ColumnResizeStateProps<T>): ColumnResizeState<T> {
  const {columns, getDefaultWidth, tableWidth: defaultTableWidth = null} = props;
  const columnsRef = useRef<GridNode<T>[]>([]);
  const tableWidth = useRef<number>(defaultTableWidth);
  const isResizing = useRef<boolean>(null);
  const startResizeContentWidth = useRef<number>();

  const [columnWidths, setColumnWidths] = useState<Map<Key, number>>(new Map(columns.map(col => [col.key, 0])));
  const columnWidthsRef = useRef<Map<Key, number>>(columnWidths);
  const affectedColumnWidthsRef = useRef<AffectedColumnWidths>([]);
  const [resizedColumns, setResizedColumns] = useState<Set<Key>>(new Set());
  const resizedColumnsRef = useRef<Set<Key>>(resizedColumns);

  function setColumnWidthsForRef(newWidths: Map<Key, number>) {
    columnWidthsRef.current = newWidths;
    // new map so that change detection is triggered
    setColumnWidths(newWidths);
  }
  /*
    returns the resolved column width in this order:
    previously calculated width -> controlled width prop -> uncontrolled defaultWidth prop -> dev assigned width -> default dynamic width
  */
  let getResolvedColumnWidth = useCallback((column: GridNode<T>): (number | string) => {
    let columnProps = column.props as ColumnProps<T>;
    return resizedColumns?.has(column.key) ? columnWidthsRef.current.get(column.key) : columnProps.width ?? columnProps.defaultWidth ?? getDefaultWidth?.(column.props) ?? '1fr';
  }, [getDefaultWidth, resizedColumns]);

  let getStaticAndDynamicColumns = useCallback((columns: GridNode<T>[]) : { staticColumns: GridNode<T>[], dynamicColumns: GridNode<T>[] } => columns.reduce((acc, column) => {
    let width = getResolvedColumnWidth(column);
    return isStatic(width) ? {...acc, staticColumns: [...acc.staticColumns, column]} : {...acc, dynamicColumns: [...acc.dynamicColumns, column]};
  }, {staticColumns: [], dynamicColumns: []}), [getResolvedColumnWidth]);

  let buildColumnWidths = useCallback((affectedColumns: GridNode<T>[], availableSpace: number): Map<Key, number> => {
    const widths = new Map<Key, number>();
    let remainingSpace = availableSpace;

    const {staticColumns, dynamicColumns} = getStaticAndDynamicColumns(affectedColumns);

    staticColumns.forEach(column => {
      let width = getResolvedColumnWidth(column);
      let w = parseStaticWidth(width, tableWidth.current);
      widths.set(column.key, w);
      remainingSpace -= w;
    });

    // dynamic columns
    if (dynamicColumns.length > 0) {
      const newColumnWidths = getDynamicColumnWidths(dynamicColumns, remainingSpace, tableWidth.current);
      for (let column of newColumnWidths) {
        widths.set(column.key, column.calculatedWidth);
      }
    }

    return widths;
  }, [getStaticAndDynamicColumns, getResolvedColumnWidth]);


  const prevColKeys = columnsRef.current.map(col => col.key);
  const colKeys = columns.map(col => col.key);
  // if the columns change, need to rebuild widths.
  if (!colKeys.every((col, i) => col === prevColKeys[i])) {
    columnsRef.current = columns;
    const widths = buildColumnWidths(columns, tableWidth.current);
    setColumnWidthsForRef(widths);
  }

  function setTableWidth(width: number) {
    if (width && width !== tableWidth.current) {
      tableWidth.current = width;
      if (!isResizing.current) {
        const widths = buildColumnWidths(columns, width);
        setColumnWidthsForRef(widths);
      }
    }
  }

  function onColumnResizeStart() {
    isResizing.current = true;
    startResizeContentWidth.current = getContentWidth(columnWidthsRef.current);
  }

  function onColumnResize(column: GridNode<T>, width: number) {
    let widthsObj = resizeColumn(column, width);
    affectedColumnWidthsRef.current = widthsObj;
    props.onColumnResize && props.onColumnResize(affectedColumnWidthsRef.current);
  }

  function onColumnResizeEnd() {
    isResizing.current = false;
    props.onColumnResizeEnd && props.onColumnResizeEnd(affectedColumnWidthsRef.current);
    affectedColumnWidthsRef.current = [];

    let widths = new Map<Key, number>(columnWidthsRef.current);
    // Need to set the resizeBufferColumn or "spooky column" back to 0 since done resizing;
    const bufferColumnKey = columnsRef.current[columnsRef.current.length - 1].key;
    widths.set(bufferColumnKey, 0);
    setColumnWidthsForRef(widths);
  }

  function resizeColumn(column: GridNode<T>, newWidth: number) : AffectedColumnWidths {
    let boundedWidth =  Math.max(
      getMinWidth(column.props.minWidth, tableWidth.current),
      Math.min(Math.floor(newWidth), getMaxWidth(column.props.maxWidth, tableWidth.current)));

    // copy the columnWidths map and set the new width for the column being resized
    let widths = new Map<Key, number>(columnWidthsRef.current);
    widths.set(columnsRef.current[columnsRef.current.length - 1].key, 0);
    widths.set(column.key, boundedWidth);

    // keep track of all columns that have been sized
    resizedColumnsRef.current.add(column.key);
    setResizedColumns(resizedColumnsRef.current);

    // get the columns affected by resize and remaining space
    const resizeIndex = columnsRef.current.findIndex(col => col.key === column.key);
    let affectedColumns = columnsRef.current.slice(resizeIndex + 1);

    // we only care about the columns that CAN be resized, we ignore static columns.
    let {dynamicColumns} = getStaticAndDynamicColumns(affectedColumns);

    // available space for affected columns
    let availableSpace = columnsRef.current.reduce((acc, column, index) => {
      if (index <= resizeIndex || isStatic(getResolvedColumnWidth(column))) {
        return acc - widths.get(column.key);
      }
      return acc;
    }, tableWidth.current);

    // merge the unaffected column widths and the recalculated column widths
    let recalculatedColumnWidths = buildColumnWidths(dynamicColumns, availableSpace);
    widths = new Map<Key, number>([...widths, ...recalculatedColumnWidths]);

    if (startResizeContentWidth.current > tableWidth.current) {
      widths.set(columnsRef.current[columnsRef.current.length - 1].key, Math.max(0, startResizeContentWidth.current - getContentWidth(widths)));
    }
    setColumnWidthsForRef(widths);

    /*
     when getting recalculated columns above, the column being resized is not considered "recalculated"
     so we need to add it to the list of affected columns
    */
    let allAffectedColumns = ([[column.key, boundedWidth], ...recalculatedColumnWidths] as [Key, number][]).map(([key, width]) => ({key, width}));
    return allAffectedColumns;
  }

  // This function is regenerated whenever columnWidthsRef.current changes in order to get the new correct ref value.
  let getColumnWidth = useCallback((key: Key): number => columnWidthsRef.current.get(key) ?? 0, [columnWidthsRef.current]);

  let getColumnMinWidth = useCallback((key: Key) => {
    const columnIndex = columns.findIndex(col => col.key === key);
    if (columnIndex === -1) {
      return;
    }
    return getMinWidth(columns[columnIndex].props.minWidth, tableWidth.current);
  }, [columns]);

  let getColumnMaxWidth = useCallback((key: Key) => {
    const columnIndex = columns.findIndex(col => col.key === key);
    if (columnIndex === -1) {
      return;
    }
    return getMaxWidth(columns[columnIndex].props.maxWidth, tableWidth.current);
  }, [columns]);

  return {
    columnWidths: columnWidthsRef,
    setTableWidth,
    onColumnResize,
    onColumnResizeStart,
    onColumnResizeEnd,
    getColumnWidth,
    getColumnMinWidth,
    getColumnMaxWidth,
    isResizingColumn: isResizing.current
  };
}
