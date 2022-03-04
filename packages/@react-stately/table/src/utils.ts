import {GridNode} from '@react-types/grid';
import {Key} from 'react';

type mappedColumn<T> = GridNode<T> & {
    index: number,
    delta: number,
    calculatedWidth?: number
};

export function mapToArray(columnWidthsMap: Map<Key, number>): { key: Key, width: number }[] {
  return Array.from(columnWidthsMap, ([key, width]) => ({key, width}));
}
    
export function getContentWidth(widths) {
  return Array.from(widths).map(e => e[1]).reduce((acc, cur) => acc + cur, 0);
}
    
export function isStatic(width: number | string): boolean {
  return width !== null && width !== undefined && (typeof width === 'number' || width.match(/^(\d+)%$/) !== null);
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

export function parseStaticWidth(width: number | string, tableWidth: number): number {
  if (typeof width === 'string') {
    let match = width.match(/^(\d+)%$/);
    if (!match) {
      throw new Error('Only percentages or numbers are supported for static column widths');
    }
    return tableWidth * (parseInt(match[1], 10) / 100);
  }
  return width;
}
    
    
export function getMaxWidth(maxWidth: number | string, tableWidth: number): number {
  return maxWidth !== undefined && maxWidth !== null
        ? parseStaticWidth(maxWidth, tableWidth)
        : Infinity;
}

export function getMinWidth(minWidth: number | string, tableWidth: number): number {
  return minWidth !== undefined && minWidth !== null
      ? parseStaticWidth(minWidth, tableWidth)
      : 75;
}

function mapColumns<T>(remainingColumns: GridNode<T>[], remainingSpace: number, tableWidth: number): mappedColumn<T>[] {
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
            getMinWidth(column.props.minWidth, tableWidth) - targetWidth,
            targetWidth - getMaxWidth(column.props.maxWidth, tableWidth)
          )
    };
  });
    
  return columns;
}

function solveWidths<T>(remainingColumns: mappedColumn<T>[], remainingSpace: number, tableWidth: number): mappedColumn<T>[] {
  let remainingFractions = remainingColumns.reduce(
        (sum, col) => sum + parseFractionalUnit(col.props.defaultWidth),
        0
      );
    
  for (let i = 0; i < remainingColumns.length; i++) {
    const column = remainingColumns[i];
    
    const targetWidth =
          (parseFractionalUnit(column.props.defaultWidth) * remainingSpace) / remainingFractions;
    
    let width = Math.max(
          getMinWidth(column.props.minWidth, tableWidth),
          Math.min(Math.floor(targetWidth), getMaxWidth(column.props.maxWidth, tableWidth))
        );
    column.calculatedWidth = width;
    remainingSpace -= width;
    remainingFractions -= parseFractionalUnit(column.props.defaultWidth);
  }
    
  return remainingColumns;
}  
    
export function getDynamicColumnWidths<T>(remainingColumns: GridNode<T>[], remainingSpace: number, tableWidth: number) {
  let columns = mapColumns(remainingColumns, remainingSpace, tableWidth);
    
  columns.sort((a, b) => b.delta - a.delta);
  columns = solveWidths(columns, remainingSpace, tableWidth);
  columns.sort((a, b) => a.index - b.index);
    
  return columns;
}
