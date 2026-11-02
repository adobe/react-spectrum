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

import {ColumnSize, TableState} from 'react-stately/useTableState';
import type {DragAndDropHooks} from '../dnd/useDragAndDrop';
import type {DraggableCollectionState} from 'react-stately/useDraggableCollectionState';
import type {DroppableCollectionState} from 'react-stately/useDroppableCollectionState';
import {Key} from '@react-types/shared';
import React, {ReactElement, useContext} from 'react';
import type {TableViewLayout} from './TableViewLayout';

export interface TableContextValue<T> {
  state: TableState<T>;
  dragState: DraggableCollectionState | null;
  dropState: DroppableCollectionState | null;
  dragAndDropHooks?: DragAndDropHooks<T>['dragAndDropHooks'];
  isTableDraggable: boolean;
  isTableDroppable: boolean;
  layout: TableViewLayout<T>;
  headerRowHovered: boolean;
  isInResizeMode: boolean;
  setIsInResizeMode: (val: boolean) => void;
  isEmpty: boolean;
  onFocusedResizer: () => void;
  onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
  onResize?: (widths: Map<Key, ColumnSize>) => void;
  onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
  headerMenuOpen: boolean;
  setHeaderMenuOpen: (val: boolean) => void;
  renderEmptyState?: () => ReactElement;
}

export const TableContext = React.createContext<TableContextValue<unknown> | null>(null);
export function useTableContext(): TableContextValue<unknown> {
  return useContext(TableContext)!;
}

export const VirtualizerContext = React.createContext<{width: number; key: Key | null} | null>(
  null
);
export function useVirtualizerContext(): {
  width: number;
  key: Key | null;
} | null {
  return useContext(VirtualizerContext);
}
