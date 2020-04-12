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

import {Collection, CollectionBuilder, Node, TreeCollection} from '@react-stately/collections';
import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {Key, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useControlledState} from '@react-stately/utils';

export interface TreeState<T> {
  /** A collection of items in the tree */
  collection: Collection<Node<T>>,

  /** A set of keys for items that are disabled */
  disabledKeys: Set<Key>,

  /** A set of keys for items that are expanded */
  expandedKeys: Set<Key>,

  /** Toggles the expanded state for an item by its key */
  toggleKey: (key: Key) => void,

  /** A selection manager to read and update multiple selection state */
  selectionManager: SelectionManager
}

/**
 * Provides state management for tree-like components. Handles building a collection
 * of items from props, item expanded state, and manages multiple selection state.
 */
export function useTreeState<T>(props: CollectionBase<T> & Expandable & MultipleSelection): TreeState<T> {
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );

  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let tree = useMemo(() => {
    let nodes = builder.build(props, (key) => ({
      isExpanded: expandedKeys.has(key),
      isSelected: selectionState.selectedKeys.has(key),
      isDisabled: disabledKeys.has(key),
      isFocused: key === selectionState.focusedKey
    }));

    return new TreeCollection(nodes);
  }, [builder, props, expandedKeys, selectionState.selectedKeys, selectionState.focusedKey, disabledKeys]);

  let onToggle = (key: Key) => {
    setExpandedKeys(expandedKeys => toggleKey(expandedKeys, key));
  };

  return {
    collection: tree,
    expandedKeys,
    disabledKeys,
    toggleKey: onToggle,
    selectionManager: new SelectionManager(tree, selectionState)
  };
}

function toggleKey(set: Set<Key>, key: Key): Set<Key> {
  let res = new Set(set);
  if (res.has(key)) {
    res.delete(key);
  } else {
    res.add(key);
  }

  return res;
}
