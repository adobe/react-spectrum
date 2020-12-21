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

import {CollectionBase, MultipleSelection, Node, SelectionMode, Sortable, SortDescriptor, SortDirection} from '@react-types/shared';
import {GridState, useGridState} from '@react-stately/grid';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key, useMemo} from 'react';
import {TableCollection} from './TableCollection';
import {useCollection} from '@react-stately/collections';

export interface TableState<T> extends GridState<T, ITableCollection<T>> {
  collection: ITableCollection<T>,
  showSelectionCheckboxes: boolean,
  sortDescriptor: SortDescriptor,
  sort(columnKey: Key): void
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface TableStateProps<T> extends CollectionBase<T>, MultipleSelection, Sortable {
  showSelectionCheckboxes?: boolean
}

const OPPOSITE_SORT_DIRECTION = {
  ascending: 'descending' as SortDirection,
  descending: 'ascending' as SortDirection
};

export function useTableState<T extends object>(props: TableStateProps<T>): TableState<T>  {
  let {selectionMode = 'none'} = props;

  let context = useMemo(() => ({
    showSelectionCheckboxes: props.showSelectionCheckboxes && selectionMode !== 'none',
    selectionMode,
    columns: []
  }), [props.children, props.showSelectionCheckboxes, selectionMode]);

  let collection = useCollection<T, TableCollection<T>>(
    props,
    (nodes, prev) => new TableCollection(nodes, prev, context),
    context
  );
  let {disabledKeys, selectionManager} = useGridState({...props, collection});

  return {
    collection,
    disabledKeys,
    selectionManager,
    showSelectionCheckboxes: props.showSelectionCheckboxes || false,
    sortDescriptor: props.sortDescriptor,
    sort(columnKey: Key) {
      props.onSortChange({
        column: columnKey,
        direction: props.sortDescriptor?.column === columnKey
          ? OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction]
          : 'ascending'
      });
    }
  };
}
