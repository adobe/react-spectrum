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

import {Collection, CollectionStateBase, DisabledBehavior, Expandable, Key, MultipleSelection, Node} from '@react-types/shared';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {TreeCollection} from './TreeCollection';
import {useCallback, useEffect, useMemo} from 'react';
import {useCollection} from '@react-stately/collections';
import {useControlledState} from '@react-stately/utils';

export interface TreeProps<T> extends CollectionStateBase<T>, Expandable, MultipleSelection {
  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  disabledBehavior?: DisabledBehavior
}
export interface TreeState<T> {
  /** A collection of items in the tree. */
  readonly collection: Collection<Node<T>>,

  /** A set of keys for items that are disabled. */
  readonly disabledKeys: Set<Key>,

  /** A set of keys for items that are expanded. */
  readonly expandedKeys: 'all' | Set<Key>,

  /** Toggles the expanded state for an item by its key. */
  toggleKey(key: Key): void,

  /** Replaces the set of expanded keys. */
  setExpandedKeys(keys: 'all' | Set<Key>): void,

  /** A selection manager to read and update multiple selection state. */
  readonly selectionManager: SelectionManager
}

/**
 * Provides state management for tree-like components. Handles building a collection
 * of items from props, item expanded state, and manages multiple selection state.
 */
export function useTreeState<T extends object>(props: TreeProps<T>): TreeState<T> {
  let {
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys: propDefaultExpandedKeys,
    onExpandedChange
  } = props;

  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? convertExpanded(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? convertExpanded(propDefaultExpandedKeys) : new Set(),
    onExpandedChange
  );

  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let tree = useCollection(props, useCallback(nodes => new TreeCollection(nodes, {expandedKeys}), [expandedKeys]), null);

  // Reset focused key if that item is deleted from the collection.
  useEffect(() => {
    if (selectionState.focusedKey != null && !tree.getItem(selectionState.focusedKey)) {
      selectionState.setFocusedKey(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, selectionState.focusedKey]);

  let onToggle = (key: Key) => {
    setExpandedKeys(toggleKey(expandedKeys, key, tree));
  };

  return {
    collection: tree,
    expandedKeys,
    disabledKeys,
    toggleKey: onToggle,
    setExpandedKeys,
    selectionManager: new SelectionManager(tree, selectionState)
  };
}

function toggleKey<T>(currentExpandedKeys: 'all' | Set<Key>, key: Key, collection: Collection<Node<T>>): Set<Key> {
  let updatedExpandedKeys: Set<Key>;
  if (currentExpandedKeys === 'all') {
    // TODO: would be nice if the collection row information differentiated between childNodes vs childItems
    // so we didn't have to keep iterating through info, perhaps make the user pass a prop to TreeItem for childItems/hasChildRows even in the static case?
    updatedExpandedKeys = new Set([...collection].filter(row => {
      return row.props.childItems || [...collection.getChildren(row.key)].filter(child => child.type === 'item').length > 0;
    }).map(row => row.key));
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

function convertExpanded(expanded: 'all' | Iterable<Key>): 'all' | Set<Key> {
  if (!expanded) {
    return new Set<Key>();
  }

  return expanded === 'all'
    ? 'all'
    : new Set(expanded);
}
