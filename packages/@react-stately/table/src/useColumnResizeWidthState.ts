
import {ColumnProps} from '@react-types/table';
import {GridNode} from '@react-types/grid';
import {Key, MutableRefObject, useRef, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

export default function useColumnResizeWidthState<T>(
    columns: GridNode<T>[],
    getDefaultWidth: (props) => string | number
  ): [MutableRefObject<Map<Key, number>>, (column: GridNode<T>, newWidth: number, doneResizing?: boolean) => { key: Key, width: number }[], (width: number) => void, () => void, () => void] {

  const tableWidth = useRef<number>(null);
  const startResizeContentWidth = useRef<number>();

  const [columnWidths, setColumnWidths] = useState<Map<Key, number>>(new Map(columns.map(col => [col.key, 0])));
  const columnWidthsRef = useRef<Map<Key, number>>(columnWidths);
  const [resizedColumns, setResizedColumns] = useState<Set<Key>>(new Set());
  const resizedColumnsRef = useRef<Set<Key>>(resizedColumns);

  // if the columns change, need to rebuild widths.
  useLayoutEffect(() => {
    const widths = buildColumnWidths(columns, tableWidth.current);
    setColumnWidthsForRef(widths);
  }, [columns]);

  function setColumnWidthsForRef(newWidths: Map<Key, number>) {
    columnWidthsRef.current = newWidths;
    // new map so that change detection is triggered
    setColumnWidths(newWidths);
  }

  function setTableWidth(width: number) {
    if (width && width !== tableWidth.current) {
      tableWidth.current = width;
      const widths = buildColumnWidths(columns, width);
      setColumnWidthsForRef(widths);
    }
  }

  function onColumnResizeStart() {
    startResizeContentWidth.current = getContentWidth(columnWidthsRef.current);
  }

  function onColumnResizeEnd() {
    let widths = new Map<Key, number>(columnWidthsRef.current);
    widths.set(columns[columns.length - 1].key, 0);
    setColumnWidthsForRef(widths);
  }

  function getContentWidth(widths) {
    return Array.from(widths).map(e => e[1]).reduce((acc, cur) => acc + cur, 0);
  }

  function resizeColumn(column: GridNode<T>, newWidth: number) : { key: Key, width: number }[] {
    // copy the columnWidths map and set the new width for the column being resized
    let widths = new Map<Key, number>(columnWidthsRef.current);
    widths.set(columns[columns.length - 1].key, 0);
    widths.set(column.key, Math.max(
      getMinWidth(column.props.minWidth),
      Math.min(Math.floor(newWidth), getMaxWidth(column.props.maxWidth))
    ));

    // keep track of all columns that have been seized
    resizedColumnsRef.current.add(column.key);
    setResizedColumns(resizedColumnsRef.current);

    // get the columns affected by resize and remaining space
    const resizeIndex = columns.findIndex(col => col.key === column.key);
    let affectedColumns = columns.slice(resizeIndex + 1);

    // we only care about the columns that CAN be resized, we ignore static columns.
    let {dynamicColumns} = getStaticAndDynamicColumns(affectedColumns);

    // available space for affected columns
    let availableSpace = columns.reduce((acc, column, index) => {
      if (index <= resizeIndex || isStatic(getRealColumnWidth(column))) {
        return acc - widths.get(column.key);
      }
      return acc;
    }, tableWidth.current);
    
    // merge the unaffected column widths and the recalculated column widths
    let recalculatedColumnWidths = buildColumnWidths(dynamicColumns, availableSpace);
    widths = new Map<Key, number>([...widths, ...recalculatedColumnWidths]);

    if (startResizeContentWidth.current > tableWidth.current) {
      widths.set(columns[columns.length - 1].key, Math.max(0, startResizeContentWidth.current - getContentWidth(widths)));
    }
    setColumnWidthsForRef(widths);

    // when getting recalculated columns above, the column being resized is not considered "recalculated"
    // so we need to add it to the list of affected columns
    let allAffectedColumns = new Map<Key, number>([[column.key, newWidth], ...recalculatedColumnWidths]);
    return mapToArray(allAffectedColumns);
  }

  function mapToArray(columnWidthsMap: Map<Key, number>): { key: Key, width: number }[] {
    return Array.from(columnWidthsMap, ([key, width]) => ({key, width}));
  }

  function buildColumnWidths(affectedColumns: GridNode<T>[], availableSpace: number): Map<Key, number> {
    const widths = new Map<Key, number>();
    let remainingSpace = availableSpace;
    
    const {staticColumns, dynamicColumns} = getStaticAndDynamicColumns(affectedColumns);

    staticColumns.forEach(column => {
      let width = getRealColumnWidth(column);
      let w = parseStaticWidth(width);
      widths.set(column.key, w);
      remainingSpace -= w;
    });

    // dynamic columns
    if (dynamicColumns.length > 0) {
      const newColumnWidths = getDynamicColumnWidths(dynamicColumns, remainingSpace);
      for (let column of newColumnWidths) {
        widths.set(column.key, column.calculatedWidth);
      }
    }

    return widths;
  }

  function getStaticAndDynamicColumns(columns: GridNode<T>[]) : { staticColumns: GridNode<T>[], dynamicColumns: GridNode<T>[] } {
    return columns.reduce((acc, column) => {
      let width = getRealColumnWidth(column);
      return isStatic(width) ? {...acc, staticColumns: [...acc.staticColumns, column]} : {...acc, dynamicColumns: [...acc.dynamicColumns, column]}; 
    }, {staticColumns: [], dynamicColumns: []});
  }

  function getRealColumnWidth(column) {
    let props = column.props as ColumnProps<T>;
    return resizedColumns?.has(column.key) ? columnWidthsRef.current.get(column.key) : props.width ?? props.defaultWidth ?? getDefaultWidth?.(column.props) ?? '1fr';
  }

  function isStatic(width: number | string): boolean {
    return width !== null && width !== undefined && (typeof width === 'number' || width.match(/^(\d+)%$/) !== null);
  }

  function parseStaticWidth(width: number | string): number {
    if (typeof width === 'string') {
      let match = width.match(/^(\d+)%$/);
      if (!match) {
        throw new Error('Only percentages or numbers are supported for static column widths');
      }
      return tableWidth.current * (parseInt(match[1], 10) / 100);
    }
    return width;
  }

  function getDynamicColumnWidths(remainingColumns: GridNode<T>[], remainingSpace: number) {
    let columns = mapColumns(remainingColumns, remainingSpace);
  
    columns.sort((a, b) => b.delta - a.delta);
    columns = solveWidths(columns, remainingSpace);
    columns.sort((a, b) => a.index - b.index);
  
    return columns;
  }

  type mappedColumn = GridNode<T> & {
    index: number,
    delta: number,
    calculatedWidth?: number
  };

  function mapColumns(remainingColumns: GridNode<T>[], remainingSpace: number): mappedColumn[] {
    let remainingFractions = remainingColumns.reduce(
      (sum, column) => sum + parseFractionalUnit(column.props.defaultWidth),
      0
    );
  
    let columns = [...remainingColumns].map((column, index) => {
      const targetWidth =
        (parseFractionalUnit(column.props.defaultWidth) * remainingSpace) / remainingFractions;
  
      return {
        ...column,
        index,
        delta: Math.max(
          0,
          getMinWidth(column.props.minWidth) - targetWidth,
          targetWidth - getMaxWidth(column.props.maxWidth)
        )
      };
    });
  
    return columns;
  }

  function solveWidths(remainingColumns: mappedColumn[], remainingSpace: number): mappedColumn[] {
    let remainingFractions = remainingColumns.reduce(
      (sum, col) => sum + parseFractionalUnit(col.props.defaultWidth),
      0
    );
  
    for (let i = 0; i < remainingColumns.length; i++) {
      const column = remainingColumns[i];
  
      const targetWidth =
        (parseFractionalUnit(column.props.defaultWidth) * remainingSpace) / remainingFractions;
  
      let width = Math.max(
        getMinWidth(column.props.minWidth),
        Math.min(Math.floor(targetWidth), getMaxWidth(column.props.maxWidth))
      );
      column.calculatedWidth = width;
      remainingSpace -= width;
      remainingFractions -= parseFractionalUnit(column.props.defaultWidth);
    }
  
    return remainingColumns;
  }

  function parseFractionalUnit(width: string): number {
    if (!width) {
      return 1;
    } 
    let match = width.match(/^(\d+)(?=fr$)/);
    // if width is the incorrect format, just deafult it to a 1fr
    if (!match) {
      console.warn(`width: ${width} is not a supported format, width should be a number (ex. 150), percentage (ex. '50%') or fr unit (ex. '2fr')`, 
      'defaulting to \'1fr\'');
      return 1;
    }
    return parseInt(match[0], 10);
  }

  function getMinWidth(minWidth: number | string): number {
    return minWidth !== undefined && minWidth !== null
      ? parseStaticWidth(minWidth)
      : 75;
  }
  
  function getMaxWidth(maxWidth: number | string): number {
    return maxWidth !== undefined && maxWidth !== null
      ? parseStaticWidth(maxWidth)
      : Infinity;
  }


  return [columnWidthsRef, resizeColumn, setTableWidth, onColumnResizeStart, onColumnResizeEnd];
}
