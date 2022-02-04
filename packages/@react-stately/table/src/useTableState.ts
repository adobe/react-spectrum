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
import {Key, useEffect, useMemo, useRef, useState} from 'react';
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

  getColumnWidth(key: Key): number
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

  let {selectionMode = 'none'} = props;

  // map of the columns and their width, key is the column key, value is the width
  // TODO: switch to useControlledState
  const [columnWidths, recalculateColumnWidths] = useColumnResizeWidthState(collection.columns);

  function getColumnWidth(key: Key): number {
    return columnWidths.current.get(key);
  }

  function onColumnResize(column: any, deltaX: number) {
    recalculateColumnWidths(column, deltaX);
  }
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
    columnWidths,
    getColumnWidth,
    onColumnResize
  };
}

const useColumnResizeWidthState = (columns) => {

  let [columnWidths, setColumnWidths] = useState<Map<Key, number>>(new Map<Key, number>());
  const columnWidthsRef = useRef<Map<Key, number>>(new Map<Key, number>());

  function setColumnWidthsForRef(newWidths) {
    columnWidthsRef.current = newWidths;
    // new map so that change detection is triggered
    setColumnWidths(newWidths);
  }

  // initialize column widths
  useEffect(() => {
    let newWidths = new Map<Key, number>();
    newWidths.set('row-header-column-sqbeipf04y', 50);
    newWidths.set('$.0', 500);
    newWidths.set('$.1', 200);
    newWidths.set('$.2', 100);
    setColumnWidthsForRef(newWidths);
  }, []);

  // TODO: evaluate if we need useCallback or not
  let calculateColumnWidths = (column, newWidth) => {
    let newWidths = new Map<Key, number>();
    newWidths.set('row-header-column-sqbeipf04y', 50);
    newWidths.set('$.0', 250);
    newWidths.set('$.1', 75);
    newWidths.set('$.2', 75);
    setColumnWidthsForRef(newWidths);
  };


  return [columnWidthsRef, calculateColumnWidths];
};

/*
  //fake current table width
  //TableLayout needs to recieve widths from useTableState
  //useTableColumnResizer should call onResize(column, newWidth)
*/
