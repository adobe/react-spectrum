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
import {Key} from 'react';

// numbers and percents are considered static. *fr units or a lack of units are considered dynamic.
export function isStatic(width: number | string): boolean {
  return width != null && (!isNaN(width as number) || (String(width)).match(/^(\d+)(?=%$)/) !== null);
}

export function parseFractionalUnit(width: string): number {
  if (!width) {
    return 1;
  }
  let match = width.match(/^(.+)(?=fr$)/);
  // if width is the incorrect format, just default it to a 1fr
  if (!match) {
    console.warn(`width: ${width} is not a supported format, width should be a number (ex. 150), percentage (ex. '50%') or fr unit (ex. '2fr')`,
      'defaulting to \'1fr\'');
    return 1;
  }
  return parseFloat(match[0]);
}

export function parseStaticWidth(width: number | string, tableWidth: number): number {
  if (typeof width === 'string') {
    let match = width.match(/^(\d+)(?=%$)/);
    if (!match) {
      throw new Error('Only percentages or numbers are supported for static column widths');
    }
    return tableWidth * (parseFloat(match[0]) / 100);
  }
  return width;
}


export function getMaxWidth(maxWidth: number | string, tableWidth: number): number {
  return maxWidth != null
    ? parseStaticWidth(maxWidth, tableWidth)
    : Number.MAX_SAFE_INTEGER;
}

// cannot support FR units, we'd need to know everything else in the table to do that
export function getMinWidth(minWidth: number | string, tableWidth: number): number {
  return minWidth != null
    ? parseStaticWidth(minWidth, tableWidth)
    : 0;
}

// tell us the delta between min width and target width vs max width and target width
function mapDynamicColumns(dynamicColumns: IndexedColumn[], availableSpace: number, tableWidth: number): (IndexedColumn & {delta: number})[] {
  let fractions = dynamicColumns.reduce(
    (sum, column) => column ? sum + parseFractionalUnit((column.column.width || column.column.defaultWidth) as string) : sum,
    0
  );

  let columns = dynamicColumns.map((column) => {
    if (!column) {
      return null;
    }
    const targetWidth =
      (parseFractionalUnit((column.column.width || column.column.defaultWidth) as string) * availableSpace) / fractions;
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
    (sum, col) => col ? sum + col.width : sum,
    0
  );

  dynamicColumns.forEach((column) => {
    if (!column) {
      return null;
    }
    const targetWidth =
      (column.width * availableSpace) / fractions;
    let width = Math.max(
      getMinWidth(column.column.minWidth, tableWidth),
      Math.min(Math.round(targetWidth), getMaxWidth(column.column.maxWidth, tableWidth))
    );
    availableSpace -= width;
    fractions -= column.width;
    column.width = width;
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

export function calculateColumnSizes(availableWidth: number, columns: IColumn[], changedColumns: Map<Key, ColumnSize>, getDefaultWidth, getDefaultMinWidth) {
  let remainingSpace = availableWidth;
  let {staticColumns, dynamicColumns} = columns.reduce((acc, column, index) => {
    let width = changedColumns.get(column.key) != null ? changedColumns.get(column.key) : column.width ?? column.defaultWidth ?? getDefaultWidth?.(index) ?? '1fr';
    let minWidth = column.minWidth ?? getDefaultMinWidth?.(index);
    column.minWidth = minWidth;

    if (isStatic(width)) {
      let w = parseStaticWidth(width, availableWidth);
      w = Math.max(
        getMinWidth(column.minWidth, availableWidth),
        Math.min(Math.floor(w), getMaxWidth(column.maxWidth, availableWidth)));
      acc.staticColumns.push({index, column, width: w} as IndexedColumn);
      acc.dynamicColumns.push(null);
      remainingSpace -= w;
    } else {
      let w = parseFractionalUnit(width);
      acc.staticColumns.push(null);
      acc.dynamicColumns.push({index, column, width: w} as IndexedColumn);
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
