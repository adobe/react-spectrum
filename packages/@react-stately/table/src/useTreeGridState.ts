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

import {Expandable} from '@react-types/shared';
import {TableCollection as ITableCollection} from '@react-types/table';
import {Key, useCallback, useMemo} from 'react';
import {TableState, TableStateProps, useTableState} from './useTableState';
import {TreeGridCollection} from './TreeGridCollection';
import {useCollection} from '@react-stately/collections';
import {useControlledState} from '@react-stately/utils';

export interface TreeGridState<T> extends TableState<T> {
  /** A set of keys for items that are expanded. */
  expandedKeys: 'all' | Set<Key>,
  /** Toggles the expanded state for a row by its key. */
  toggleKey(key: Key): void
}

export interface TreeGridStateProps<T> extends Expandable, TableStateProps<T> {}

/**
 * Provides state management for a tree grid component. Handles building a collection
 * of columns and rows from props. In addition, it tracks and manages expanded rows, row selection, and sort order changes.
 */
export function useTreeGridState<T extends object>(props: TreeGridStateProps<T>): TreeGridState<T> {
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? convertExpanded(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? convertExpanded(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );
  let {selectionMode = 'none', showSelectionCheckboxes, showDragButtons} = props;

  let context = useMemo(() => ({
    showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== 'none',
    showDragButtons: showDragButtons,
    selectionMode,
    columns: []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [props.children, showSelectionCheckboxes, selectionMode, showDragButtons]);

  let collection = useCollection<T, ITableCollection<T>>(
    props,
    useCallback((nodes) => new TreeGridCollection(nodes, {...context, expandedKeys}), [context, expandedKeys]),
    context
  );

  // TODO: support 'all'? Will we have a interaction to expand all
  // TODO: memo
  let onToggle = (key: Key) => {
    setExpandedKeys(toggleKey(expandedKeys, key, collection));
  };

  let tableState = useTableState({...props, collection});

  return {
    ...tableState,
    collection,
    expandedKeys,
    toggleKey: onToggle
  };
}

// TODO: copied from useTreeState, perhaps make this accept multiple keys?
function toggleKey<T>(currentExpandedKeys: 'all' | Set<Key>, key: Key, collection: ITableCollection<T>): Set<Key> {
  let updatedExpandedKeys: Set<Key>;
  if (currentExpandedKeys === 'all') {
    updatedExpandedKeys = new Set(collection.rows.filter(row => row.props.childItems?.length > 0 || row.props.children.length > collection.columnCount).map(row => row.key));
    updatedExpandedKeys.delete(key);
  } else {
    updatedExpandedKeys = new Set(currentExpandedKeys);
    if (updatedExpandedKeys.has(key)) {
      updatedExpandedKeys.delete(key);
    } else {
      updatedExpandedKeys.add(key);
    }
  }

  return updatedExpandedKeys;
}

// TODO: based off convertedSelected
function convertExpanded(expanded: 'all' | Iterable<Key>): 'all' | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }

  return expanded === 'all'
    ? 'all'
    : new Set(expanded);
}
