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
import {CollectionBase, MultipleSelection} from '@react-types/shared';
import {Key, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface ListState<T> {
  /** A collection of items in the list. */
  collection: Collection<Node<T>>,

  /** A set of items that are disabled. */
  disabledKeys: Set<Key>,

  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager
}

/**
 * Provides state management for list-like components. Handles building a collection
 * of items from props, and manages multiple selection state.
 */
export function useListState<T>(props: CollectionBase<T> & MultipleSelection): ListState<T>  {
  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let collection = useMemo(() => {
    let nodes = builder.build(props, (key) => ({
      isSelected: selectionState.selectedKeys.has(key),
      isDisabled: disabledKeys.has(key),
      isFocused: key === selectionState.focusedKey
    }));

    return new TreeCollection(nodes);
  }, [builder, props, selectionState.selectedKeys, selectionState.focusedKey, disabledKeys]);

  return {
    collection,
    disabledKeys,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
