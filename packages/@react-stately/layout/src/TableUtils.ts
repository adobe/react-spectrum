import {Key} from 'react';

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
    : Number.MAX_SAFE_INTEGER;
}

export function getMinWidth(minWidth: number | string, tableWidth: number, defaultMinWidth = 75): number {
  return minWidth != null
    ? parseStaticWidth(minWidth, tableWidth)
    : defaultMinWidth;
}

// tell us the delta between min width and target width vs max width and target width
function mapDynamicColumns(dynamicColumns: IndexedColumn[], availableSpace: number, tableWidth: number): (IndexedColumn & {delta: number})[] {
  let fractions = dynamicColumns.reduce(
    (sum, column) => column ? sum + parseFractionalUnit(column.column.defaultWidth as string) : sum,
    0
  );

  let columns = dynamicColumns.map((column) => {
    if (!column) {
      return null;
    }
    const targetWidth =
      (parseFractionalUnit(column.column.defaultWidth as string) * availableSpace) / fractions;
    const delta = Math.max(
      getMinWidth(column.column.minWidth, tableWidth) - targetWidth,
      targetWidth - getMaxWidth(column.column.maxWidth, tableWidth)
    );

    return {
      ...column,
      delta
    };
  });

  return columns;
}

// mutates columns to set their width
function findDynamicColumnWidths(dynamicColumns: IndexedColumn[], availableSpace: number, tableWidth: number): void {
  let fractions = dynamicColumns.reduce(
    (sum, col) => col ? sum + parseFractionalUnit(col.column.defaultWidth as string) : sum,
    0
  );

  dynamicColumns.forEach((column) => {
    if (!column) {
      return null;
    }
    const targetWidth =
      (parseFractionalUnit(column.column.defaultWidth as string) * availableSpace) / fractions;
    let width = Math.max(
      getMinWidth(column.column.minWidth, tableWidth),
      Math.min(Math.floor(targetWidth), getMaxWidth(column.column.maxWidth, tableWidth))
    );
    column.width = width;
    availableSpace -= width;
    fractions -= parseFractionalUnit(column.column.defaultWidth as string);
  });
}

export function getDynamicColumnWidths(dynamicColumns: IndexedColumn[], availableSpace: number, tableWidth: number) {
  let columns = mapDynamicColumns(dynamicColumns, availableSpace, tableWidth);

  // sort is nlogn and copying is n, so copying and sorting is faster than sorting twice
  // sort by delta's to prioritize assigning width
  let sorted = [...columns].sort((a, b) => {
    if (a && b) {
      return b.delta - a.delta;
    }
    return a ? -1 : 1;
  });
  // this function mutates the column entries, so no need to have it return anything
  // plus we don't need to undo the sort since we already have the correct order
  findDynamicColumnWidths(sorted, availableSpace, tableWidth);

  return columns;
}


export interface IColumn {
  minWidth?: number | string,
  maxWidth?: number | string,
  width?: number | string,
  defaultWidth?: number | string,
  key?: Key
}
export interface IndexedColumn {
  column: IColumn,
  index: number,
  width: number,
  isDynamic?: boolean,
  delta?: number
}

export function calculateColumnSizes(availableWidth: number, columns: IColumn[], changedColumns: Map<Key, number | null>, getDefaultWidth, getDefaultMinWidth) {
  let remainingSpace = availableWidth;
  let {staticColumns, dynamicColumns} = columns.reduce((acc, column, index) => {
    let width = changedColumns.get(column.key) != null ? changedColumns.get(column.key) : column.width ?? column.defaultWidth ?? getDefaultWidth?.(index) ?? '1fr';
    let defaultMinWidth = getDefaultMinWidth?.(index);
    if (isStatic(width)) {
      let w = parseStaticWidth(width, availableWidth);
      w = Math.max(
        getMinWidth(column.minWidth, availableWidth, defaultMinWidth),
        Math.min(Math.floor(w), getMaxWidth(column.maxWidth, availableWidth)));
      acc.staticColumns.push({index, column, width: w} as IndexedColumn);
      acc.dynamicColumns.push(null);
      remainingSpace -= w;
    } else {
      acc.staticColumns.push(null);
      acc.dynamicColumns.push({index, column, width: null} as IndexedColumn);
    }
    return acc;
  }, {staticColumns: [] as IndexedColumn[], dynamicColumns: [] as IndexedColumn[]});
  let newColWidths = getDynamicColumnWidths(dynamicColumns, remainingSpace, availableWidth);

  return staticColumns.map((col, i) => {
    if (col) {
      return col.width;
    }
    return newColWidths[i].width;
  });
}
