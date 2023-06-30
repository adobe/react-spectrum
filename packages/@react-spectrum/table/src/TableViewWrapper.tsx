/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BaseTableView} from './TableView';
import {ColumnSize} from '@react-types/table';
import {DOMRef} from '@react-types/shared';
import type {DragAndDropHooks} from '@react-spectrum/dnd';
import type {DraggableCollectionState, DroppableCollectionState} from '@react-stately/dnd';
import React, {Key, ReactElement, useContext} from 'react';
import {SpectrumTreeGridProps, TreeGridTableView} from './TreeGridTableView';
import {TableLayout} from '@react-stately/layout';
import {tableNestedRows} from '@react-stately/flags';
import type {TableState, TreeGridState} from '@react-stately/table';

export interface SpectrumTableProps<T> extends SpectrumTreeGridProps<T> {
  /** Whether the TableView should support expandable rows.  */
  hasExpandableRows?: boolean
}

// TODO: figure out how to properly define the state here so that TableView and TreeGridTableView get the specific state type
export interface TableContextValue<T> {
  state: TableState<T> | TreeGridState<T>,
  dragState: DraggableCollectionState,
  dropState: DroppableCollectionState,
  dragAndDropHooks: DragAndDropHooks['dragAndDropHooks'],
  isTableDraggable: boolean,
  isTableDroppable: boolean,
  shouldShowCheckboxes: boolean,
  layout: TableLayout<T> & {tableState: TableState<T> | TreeGridState<T>},
  headerRowHovered: boolean,
  isInResizeMode: boolean,
  setIsInResizeMode: (val: boolean) => void,
  isEmpty: boolean,
  onFocusedResizer: () => void,
  onResizeStart: (widths: Map<Key, ColumnSize>) => void,
  onResize: (widths: Map<Key, ColumnSize>) => void,
  onResizeEnd: (widths: Map<Key, ColumnSize>) => void,
  headerMenuOpen: boolean,
  setHeaderMenuOpen: (val: boolean) => void
}

export const TableContext = React.createContext<TableContextValue<unknown>>(null);
export function useTableContext() {
  return useContext(TableContext);
}

export const VirtualizerContext = React.createContext(null);
export function useVirtualizerContext() {
  return useContext(VirtualizerContext);
}

function TableView<T extends object>(props: SpectrumTableProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {hasExpandableRows, ...otherProps} = props;
  if (tableNestedRows() && hasExpandableRows) {
    return <TreeGridTableView {...otherProps} ref={ref} />;
  } else {
    return <BaseTableView {...otherProps} ref={ref} />;
  }
}

/**
 * Tables are containers for displaying information. They allow users to quickly scan, sort, compare, and take action on large amounts of data.
 */
const _TableView = React.forwardRef(TableView) as <T>(props: SpectrumTableProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;

export {_TableView as TableView};
