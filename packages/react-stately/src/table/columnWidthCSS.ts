/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CSSProperties} from 'react';
import {Key} from '@react-types/shared';

export function getColumnWidthVarName(index: number): string {
  return `--col-${index}-width`;
}

export function getColumnStartVarName(index: number): string {
  return `--col-${index}-start`;
}

export interface ColumnWidthEntry {
  key: Key;
  index: number;
}

/**
 * Applies column width CSS custom properties to a table root element.
 * Returns the total table content width.
 */
export function applyColumnWidthsToDOM(
  root: HTMLElement,
  columns: ColumnWidthEntry[],
  columnWidths: Map<Key, number>,
  resizingColumnKey?: Key | null
): number {
  let start = 0;
  let totalWidth = 0;

  for (let column of columns) {
    let width = columnWidths.get(column.key) ?? 0;
    root.style.setProperty(getColumnWidthVarName(column.index), `${width}px`);
    root.style.setProperty(getColumnStartVarName(column.index), `${start}px`);
    start += width;
    totalWidth += width;
  }

  root.style.setProperty('--table-total-width', `${totalWidth}px`);

  if (resizingColumnKey != null) {
    let indicatorPosition = 0;
    for (let column of columns) {
      indicatorPosition += columnWidths.get(column.key) ?? 0;
      if (column.key === resizingColumnKey) {
        root.style.setProperty('--resize-indicator-position', `${indicatorPosition - 2}px`);
        break;
      }
    }
  }

  return totalWidth;
}

/**
 * Returns mount-time styles for a column or cell wrapper that reads horizontal
 * positioning from CSS custom properties on an ancestor.
 */
export function getColumnHorizontalStyle(columnIndex: number, colSpan: number = 1): CSSProperties {
  if (colSpan <= 1) {
    return {
      width: `var(${getColumnWidthVarName(columnIndex)})`,
      insetInlineStart: `var(${getColumnStartVarName(columnIndex)})`
    };
  }

  let widthParts: string[] = [];
  for (let i = 0; i < colSpan; i++) {
    widthParts.push(`var(${getColumnWidthVarName(columnIndex + i)})`);
  }

  return {
    width: `calc(${widthParts.join(' + ')})`,
    insetInlineStart: `var(${getColumnStartVarName(columnIndex)})`
  };
}

export function columnWidthsEqual(
  a: Map<Key, number> | undefined,
  b: Map<Key, number> | undefined
): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (let [key, val] of a) {
    if (b.get(key) !== val) {
      return false;
    }
  }
  return true;
}
