
import {ColumnProps} from '@react-types/table';
import {GridNode} from '@react-types/grid';
import {Key, MutableRefObject, useEffect, useRef, useState} from 'react';

export default function useColumnResizeWidthState<T>(
    columns: GridNode<T>[],
    getDefaultWidth: (props) => string | number
  ): [MutableRefObject<Map<Key, number>>, (column: GridNode<T>, newWidth: number) => { key: Key, width: number }[], (width: number) => void] {
  // TODO: switch to the virtualizer width
  const tableWidth = useRef<number>(null);
  const [columnWidths, setColumnWidths] = useState<Map<Key, number>>(initializeColumnWidths(columns));
  const columnWidthsRef = useRef<Map<Key, number>>(columnWidths);
  const [resizedColumns, setResizedColumns] = useState<Set<Key>>(new Set());
  const resizedColumnsRef = useRef<Set<Key>>(resizedColumns);

  // if the columns change, need to 
  useEffect(() => {
    const widths = buildColumnWidths(columns, tableWidth.current);
    setColumnWidthsForRef(widths);
  }, [columns]);
  

  function initializeColumnWidths(columns: GridNode<T>[]): Map<Key, number> {
    const widths = new Map();
    columns.forEach(column => widths.set(column.key, 0));
    return widths;
  }

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

  function resizeColumn(column: GridNode<T>, newWidth: number) : { key: Key, width: number }[] {
    // copy the columnWidths map and set the new width for the column being resized
    let widths = new Map<Key, number>(columnWidthsRef.current);
    widths.set(column.key, Math.max(
      getMinWidth(column.props.minWidth),
      Math.min(roundWidth(newWidth), getMaxWidth(column.props.maxWidth))
    ));

    // keep track of all columns that have been seized
    resizedColumnsRef.current.add(column.key);
    setResizedColumns(resizedColumnsRef.current);

    // get the columns affected by resize and remaining space
    const resizeIndex = columns.findIndex(col => col.key === column.key);
    let affectedColumns = columns.slice(resizeIndex + 1);

    // we only care about the columns that CAN be resized, we ignore static columns.
    let {dynamicColumns} = getStaticAndDynamicColumns(affectedColumns);
    const availableSpace = columns.slice(0, resizeIndex + 1).reduce((acc, col) => acc - widths.get(col.key), tableWidth.current);

    // merge the unaffected column widths and the recalculated column widths
    let recalculatedColumnWidths = buildColumnWidths(dynamicColumns, availableSpace);
    widths = new Map<Key, number>([...widths, ...recalculatedColumnWidths]);
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
      let w = parseWidth(width);
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

  // TODO: Types
  function getStaticAndDynamicColumns(columns: any) : { staticColumns: any, dynamicColumns: any } {
    return columns.reduce((acc, column) => {
      let width = getRealColumnWidth(column);
      return isStatic(width) ? {...acc, staticColumns: [...acc.staticColumns, column]} : {...acc, dynamicColumns: [...acc.dynamicColumns, column]}; 
    }, {staticColumns: [], dynamicColumns: []});
  }

  function getRealColumnWidth(column) {
    let props = column.props as ColumnProps<T>;
    return resizedColumns?.has(column.key) ? columnWidthsRef.current.get(column.key) : props.width ?? props.defaultWidth ?? getDefaultWidth(column.props);
  }

  function isStatic(width: number | string): boolean {
    return width !== null && width !== undefined && (typeof width === 'number' || width.match(/^(\d+)%$/) !== null);
  }

  function parseWidth(width: number | string): number {
    if (typeof width === 'string') {
      let match = width.match(/^(\d+)%$/);
      if (!match) {
        throw new Error('Only percentages are supported as column widths');
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
        Math.min(roundWidth(targetWidth), getMaxWidth(column.props.maxWidth))
      );
      column.calculatedWidth = width;
      remainingSpace -= width;
      remainingFractions -= parseFractionalUnit(column.props.defaultWidth);
    }
  
    return remainingColumns;
  }

  // Add Number.EPSILON to ensure accurate rounding, then multiply and divide by 100 to get 2 decimal places of rounding
  function roundWidth(targetWidth: number): number {
    return Math.round((targetWidth + Number.EPSILON) * 100) / 100;
  }

  function parseFractionalUnit(width: string): number {
    if (!width) {
      return 1;
    } 
    return parseInt(width.match(/(?<=^flex-)(\d+)/g)[0], 10);
  }

  function getMinWidth(minWidth: number | string): number {
    return minWidth !== undefined && minWidth !== null
      ? parseWidth(minWidth)
      : 75;
  }
  
  function getMaxWidth(maxWidth: number | string): number {
    return maxWidth !== undefined && maxWidth !== null
      ? parseWidth(maxWidth)
      : Infinity;
  }


  return [columnWidthsRef, resizeColumn, setTableWidth];
}
