import {GridNode} from '@react-types/grid';
import {Key} from 'react';

type mappedColumn<T> = GridNode<T> & {
    index: number,
    delta: number,
    calculatedWidth?: number
};

export function getContentWidth(widths: Map<Key, number>): number {
  return Array.from(widths).map(e => e[1]).reduce((acc, cur) => acc + cur, 0);
}

// numbers and percents are considered static. *fr units or a lack of units are considered dynamic.
export function isStatic(width: number | string): boolean {
  return width != null && (!isNaN(width as number) || (String(width)).match(/^(\d+)(?=%$)/) !== null);
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
    let match = width.match(/^(\d+)(?=%$)/);
    if (!match) {
      throw new Error('Only percentages or numbers are supported for static column widths');
    }
    return tableWidth * (parseInt(match[0], 10) / 100);
  }
  return width;
}
    
    
export function getMaxWidth(maxWidth: number | string, tableWidth: number): number {
  return maxWidth != null
        ? parseStaticWidth(maxWidth, tableWidth)
        : Infinity;
}

export function getMinWidth(minWidth: number | string, tableWidth: number): number {
  return minWidth != null
      ? parseStaticWidth(minWidth, tableWidth)
      : 75;
}

function mapDynamicColumns<T>(remainingColumns: GridNode<T>[], remainingSpace: number, tableWidth: number): mappedColumn<T>[] {
  let remainingFractions = remainingColumns.reduce(
        (sum, column) => sum + parseFractionalUnit(column.props.defaultWidth),
        0
      );
    
  let columns = remainingColumns.map((column, index) => {
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

function findDynamicColumnWidths<T>(mappedColumns: mappedColumn<T>[], availableSpace: number, tableWidth: number): mappedColumn<T>[] {
  let fractions = mappedColumns.reduce(
    (sum, col) => sum + parseFractionalUnit(col.props.defaultWidth),
    0
  );

  const columns = mappedColumns.map((column) => {
    const targetWidth =
      (parseFractionalUnit(column.props.defaultWidth) * availableSpace) / fractions;
    let width = Math.max(
      getMinWidth(column.props.minWidth, tableWidth),
      Math.min(Math.floor(targetWidth), getMaxWidth(column.props.maxWidth, tableWidth))
    );
    column.calculatedWidth = width;
    availableSpace -= width;
    fractions -= parseFractionalUnit(column.props.defaultWidth);
    return column;
  });

  return columns;
}  
    
export function getDynamicColumnWidths<T>(remainingColumns: GridNode<T>[], remainingSpace: number, tableWidth: number) {
  let columns = mapDynamicColumns(remainingColumns, remainingSpace, tableWidth);
    
  columns.sort((a, b) => b.delta - a.delta);
  columns = findDynamicColumnWidths(columns, remainingSpace, tableWidth);
  columns.sort((a, b) => a.index - b.index);
    
  return columns;
}
