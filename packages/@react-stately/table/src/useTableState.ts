/*
 * Copyright 2020 Adobe. All rights reserved.
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
  CollectionBase,
  Node,
  SelectionMode,
  Sortable,
  SortDescriptor,
  SortDirection
} from '@react-types/shared';
import {GridState, useGridState} from '@react-stately/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key, useMemo, useRef, useState} from 'react';
import {MultipleSelectionStateProps} from '@react-stately/selection';
import {TableCollection} from './TableCollection';
import {useCollection} from '@react-stately/collections';

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  /** A collection of rows and columns in the table. */
  collection: ITableCollection<T>,
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes: boolean,
  /** The current sorted column and direction. */
  sortDescriptor: SortDescriptor,
  /** Calls the provided onSortChange handler with the provided column key and sort direction. */
  sort(columnKey: Key): void,

  columnWidths(): Map<Key, number>,
  getColumnWidth(key: Key): number,
  setColumnWidth(column: any, width: number),

  hasResizedColumn(key: Key): boolean,
  addResizedColumn(key: Key),

  currentResizeColumn(): Key,
  setCurrentResizeColumn(key: Key),

  resizeDelta(): number,
  setResizeDelta(deltaX: number)
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface TableStateProps<T>
  extends CollectionBase<T>,
    MultipleSelectionStateProps,
    Sortable {
  /** Whether the row selection checkboxes should be displayed. */
  showSelectionCheckboxes?: boolean
}

const OPPOSITE_SORT_DIRECTION = {
  ascending: 'descending' as SortDirection,
  descending: 'ascending' as SortDirection
};

/**
 * Provides state management for a table component. Handles building a collection
 * of columns and rows from props. In addition, it tracks row selection and manages sort order changes.
 */
export function useTableState<T extends object>(
  props: TableStateProps<T>
): TableState<T> {
  let {selectionMode = 'none'} = props;

  // map of the columns and their width, key is the column key, value is the width
  // TODO: switch to useControlledState
  const [columnWidths, setColumnWidths] = useState<Map<Key, number>>(new Map<Key, number>());
  // set of all the column keys that have been resized
  const [resizedColumns, setResizedColumns] = useState<Set<Key>>(new Set<Key>());
  // current column key that is being resized
  const [currentResizeColumn, setCurrentResizeColumn] = useState<Key>(null);
  // resize delta
  const [resizeDelta, setResizeDelta] = useState<number>(0);


  // map of the columns and their width, key is the column key, value is the width
  const columnWidthsRef = useRef<Map<Key, number>>(null);
  columnWidthsRef.current = columnWidths;
  const resizedColumnsRef = useRef<Set<Key>>(null);
  resizedColumnsRef.current = resizedColumns;
  const currentResizeColumnRef = useRef<Key>(null);
  currentResizeColumnRef.current = currentResizeColumn;
  const resizeDeltaRef = useRef<number>(null);
  resizeDeltaRef.current = resizeDelta;

  function getColumnWidth(key: Key): number {
    return columnWidthsRef.current.get(key);
  }

  function setColumnWidthNew(column: any, width: number) {
    columnWidthsRef.current.set(column.key, width);
    // new map so that change detection is triggered
    setColumnWidths(new Map(columnWidthsRef.current));
  }

  function hasResizedColumn(key: Key): boolean {
    return resizedColumns.has(key);
  }

  function addResizedColumn(key: Key) {
    if (resizedColumnsRef.current.has(key)) {
      return;
    }
    resizedColumnsRef.current.add(key);
    setResizedColumns(new Set(resizedColumnsRef.current));
  }

  function updatedCurrentResizeColumn(key: Key) {
    currentResizeColumnRef.current = key;
    setCurrentResizeColumn(currentResizeColumnRef.current);
  }

  function updateResizeDelta(deltaX: number) {
    resizeDeltaRef.current = deltaX;
    setResizeDelta(resizeDeltaRef.current);
  }

  let context = useMemo(
    () => ({
      showSelectionCheckboxes:
        props.showSelectionCheckboxes && selectionMode !== 'none',
      selectionMode,
      columns: []
    }),
    [props.children, props.showSelectionCheckboxes, selectionMode]
  );

  let collection = useCollection<T, TableCollection<T>>(
    props,
    (nodes, prev) => new TableCollection(nodes, prev, context),
    context
  );
  let {disabledKeys, selectionManager} = useGridState({
    ...props,
    collection
  });

  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: props.sortDescriptor,
    sort(columnKey: Key) {
      props.onSortChange({
        column: columnKey,
        direction:
          props.sortDescriptor?.column === columnKey
            ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
            : 'ascending'
      });
    },
    columnWidths: () => columnWidths,
    getColumnWidth,
    setColumnWidth: setColumnWidthNew,
    hasResizedColumn,
    addResizedColumn,
    currentResizeColumn: () => currentResizeColumn,
    setCurrentResizeColumn: updatedCurrentResizeColumn,
    resizeDelta: () => resizeDelta,
    setResizeDelta: updateResizeDelta
  };
}
