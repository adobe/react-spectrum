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

import {
  ColumnWidthEntry,
  getColumnStartVarName,
  getColumnWidthVarName
} from 'react-stately/useTableState';
import {Key, RefObject} from '@react-types/shared';
import React, {useCallback} from 'react';
import {TableColumnResizeState} from 'react-stately/useTableState';

const useIsomorphicLayoutEffect: typeof React.useLayoutEffect =
  typeof document !== 'undefined' ? React.useLayoutEffect : () => {};

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

export interface UseSyncColumnWidthCSSVarsOptions<T> {
  rootRef: RefObject<HTMLElement | null>;
  state: TableColumnResizeState<T> | null;
  tableWidth: number;
  onWidthsApplied?: (totalWidth: number) => void;
}

/**
 * Synchronizes committed column width CSS custom properties to the table root.
 * Also rebuilds widths when the table viewport resizes during an active column resize.
 */
export function useSyncColumnWidthCSSVars<T>({
  rootRef,
  state,
  tableWidth,
  onWidthsApplied
}: UseSyncColumnWidthCSSVarsOptions<T>): void {
  let apply = useCallback(() => {
    let root = rootRef.current;
    if (root && state) {
      let totalWidth = applyColumnWidthsToDOM(
        root,
        state.columnEntries,
        state.getCurrentPixelWidths(),
        state.resizingColumn
      );
      onWidthsApplied?.(totalWidth);
    }
  }, [rootRef, state, onWidthsApplied]);

  // Sync CSS variables when committed widths or table width change.
  useIsomorphicLayoutEffect(() => {
    if (rootRef.current && state && state.resizingColumn == null) {
      apply();
    }
  }, [state?.columnWidths, tableWidth, apply, state?.resizingColumn, rootRef, state]);

  // Rebuild widths when the table is resized during an active column resize.
  useIsomorphicLayoutEffect(() => {
    if (state?.resizingColumn != null) {
      state.rebuildWidthsForViewportResize();
      apply();
    }
  }, [tableWidth, state?.resizingColumn, apply, state]);
}
