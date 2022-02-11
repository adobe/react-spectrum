/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use file except in compliance with the License. You may obtain a copy
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
import {ColumnProps, TableCollection as ITableCollection} from '@react-types/table';
import {GridNode} from '@react-types/grid';
import {GridState, useGridState} from '@react-stately/grid';
import {Key, MutableRefObject, useMemo, useRef, useState} from 'react';
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
  /** A map of all the column widths by key. */
  columnWidths: MutableRefObject<Map<Key, number>>,
  /** Getter for column widths. */
  getColumnWidth(key: Key): number,
  /** Trigger a resize and recalc. */
  onColumnResize: (column: GridNode<T>, width: number) => void,
  /** Need to be able to set the table width so that it can be used to calculate the column widths, this will trigger a recalc. */
  setTableWidth: (width: number) => void
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
  showSelectionCheckboxes?: boolean,
  /** Function for determining the default width of columns. */
  getDefaultWidth: (props) => string | number
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


  // map of the columns and their width, key is the column key, value is the width
  // TODO: switch to useControlledState
  const [columnWidths, recalculateColumnWidths, setTableWidth] = useColumnResizeWidthState(collection.columns, props.getDefaultWidth);

  function getColumnWidth(key: Key): number {
    return columnWidths.current.get(key);
  }

  function onColumnResize(column: any, width: number) {
    recalculateColumnWidths(column, width);
  }

  // function setVisibleTableWidth(width: number) {
  //   setTableWidth(width);
  // }

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
    onColumnResize,
    setTableWidth
  };
}


function useColumnResizeWidthState<T>(
    columns: GridNode<T>[],
    getDefaultWidth: (props) => string | number
  ): [MutableRefObject<Map<Key, number>>, (column: GridNode<T>, newWidth: number) => void, (width: number) => void] {
  // TODO: switch to the virtualizer width
  const tableWidth = useRef<number>(null);
  const [columnWidths, setColumnWidths] = useState<Map<Key, number>>(initializeColumnWidths(columns));
  const columnWidthsRef = useRef<Map<Key, number>>(columnWidths);
  const [resizedColumns, setResizedColumns] = useState<Set<Key>>(new Set());
  const resizedColumnsRef = useRef<Set<Key>>(resizedColumns);

  function initializeColumnWidths(columns: GridNode<T>[]): Map<Key, number> {
    const widths = new Map();
    columns.forEach(column => widths.set(column.key, 800));
    return widths;
  }

  function setColumnWidthsForRef(newWidths: Map<Key, number>) {
    columnWidthsRef.current = newWidths;
    // new map so that change detection is triggered
    setColumnWidths(newWidths);
  }

  // let setTableWidth = useCallback(updateTableWidth, [tableWidth.current]);

  function setTableWidth(width: number) {
    if (width && width !== tableWidth.current) {
      console.log('calculating');
      tableWidth.current = width;
      const widths = buildColumnWidths(columns, width);
      setColumnWidthsForRef(widths);
    }
  }

  // TODO: evaluate if we need useCallback or not
  const calculateColumnWidths = (column: GridNode<T>, newWidth: number) => {
    // copy the columnWidths map and set the new width for the column being resized
    let widths = new Map<Key, number>(columnWidthsRef.current);
    widths.set(column.key, Math.max(
      getMinWidth(column.props.minWidth),
      Math.min(Math.round(newWidth), getMaxWidth(column.props.maxWidth))
    ));

    // keep track of all columns that have been seized
    resizedColumnsRef.current.add(column.key);
    setResizedColumns(resizedColumnsRef.current);

    // get the columns affected by resize and remaining space
    const resizeIndex = columns.findIndex(col => col.key === column.key);
    let affectedColumns = columns.slice(resizeIndex + 1);
    const availableSpace = columns.slice(0, resizeIndex + 1).reduce((acc, col) => acc - widths.get(col.key), tableWidth.current);

    // merge the unaffected column widths and the recalculated column widths
    widths = new Map<Key, number>([...widths, ...buildColumnWidths(affectedColumns, availableSpace)]);
    setColumnWidthsForRef(widths);
  };

  function buildColumnWidths(affectedColumns: GridNode<T>[], availableSpace: number): Map<Key, number> {
    const widths = new Map<Key, number>();
    const remainingColumns = new Set<GridNode<T>>();
    let remainingSpace = availableSpace;
    
    // static columns
    for (let column of affectedColumns) {
      let props = column.props as ColumnProps<T>;
      let width = resizedColumns?.has(column.key) ? columnWidthsRef.current.get(column.key) : props.width ?? props.defaultWidth ?? getDefaultWidth(column.props);
      if (isStatic(width)) {
        let w = parseWidth(width);
        widths.set(column.key, w);
        remainingSpace -= w;
      } else {
        remainingColumns.add(column);
      }
    }

    // dynamic columns
    if (remainingColumns.size > 0) {
      const newColumnWidths = getDynamicColumnWidths(Array.from(remainingColumns), remainingSpace);
      for (let column of newColumnWidths) {
        widths.set(column.key, column.calculatedWidth);
      }
    }

    return widths;
  }

  function isStatic(width: number | string): boolean {
    return width !== null && width !== undefined && (typeof width === 'number' || width.match(/^(\d+)%$/) !== null);
  }

  function parseWidth(width: number | string): number {
    if (typeof width === 'string') {
      let match = width.match(/^(\d+)%$/);
      if (!match) {
        throw new Error('Only percentages are supported as column widths');
      }
      return tableWidth.current * (parseInt(match[1], 10) / 100);
    }
    return width;
  }

  function getDynamicColumnWidths(remainingColumns: GridNode<T>[], remainingSpace: number) {
    let columns = mapColumns(remainingColumns, remainingSpace);
  
    columns.sort((a, b) => b.delta - a.delta);
    columns = solveWidths(columns, remainingSpace);
    columns.sort((a, b) => a.index - b.index);
  
    return columns;
  }

  type mappedColumn = GridNode<T> & {
    index: number,
    delta: number,
    calculatedWidth?: number
  };

  function mapColumns(remainingColumns: GridNode<T>[], remainingSpace: number): mappedColumn[] {
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
          getMinWidth(column.props.minWidth) - targetWidth,
          targetWidth - getMaxWidth(column.props.maxWidth)
        )
      };
    });
  
    return columns;
  }

  function solveWidths(remainingColumns: mappedColumn[], remainingSpace: number): mappedColumn[] {
    let remainingFractions = remainingColumns.reduce(
      (sum, col) => sum + parseFractionalUnit(col.props.defaultWidth),
      0
    );
  
    for (let i = 0; i < remainingColumns.length; i++) {
      const column = remainingColumns[i];
  
      const targetWidth =
        (parseFractionalUnit(column.props.defaultWidth) * remainingSpace) / remainingFractions;
  
      let width = Math.max(
        getMinWidth(column.props.minWidth),
        Math.min(Math.round(targetWidth), getMaxWidth(column.props.maxWidth))
      );
      column.calculatedWidth = width;
      remainingSpace -= width;
      remainingFractions -= parseFractionalUnit(column.props.defaultWidth);
    }
  
    return remainingColumns;
  }

  function parseFractionalUnit(width: string): number {
    if (!width) {
      return 1;
    } 
    return parseInt(width.match(/(?<=^flex-)(\d+)/g)[0], 10);
  }

  function getMinWidth(minWidth: number | string): number {
    return minWidth !== undefined && minWidth !== null
      ? parseWidth(minWidth)
      : 75;
  }
  
  function getMaxWidth(maxWidth: number | string): number {
    return maxWidth !== undefined && maxWidth !== null
      ? parseWidth(maxWidth)
      : Infinity;
  }


  return [columnWidthsRef, calculateColumnWidths, setTableWidth];
}

/*
  //fake current table width
  //TableLayout needs to recieve widths from useTableState
  //useTableColumnResizer should call onResize(column, newWidth)
*/
