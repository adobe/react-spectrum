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

import {Collection, CollectionBase, Node} from '@react-types/shared';
import {Key, useEffect, useMemo, useState} from 'react';
import {ListCollection} from './ListCollection';
import {MultipleSelectionStateProps, SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useCollection} from '@react-stately/collections';

export interface ListProps<T> extends CollectionBase<T>, MultipleSelectionStateProps {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>,
  /** @private */
  suppressTextValueWarning?: boolean
}

export interface ListState<T> {
  /** A collection of items in the list. */
  collection: Collection<Node<T>>,

  /** A set of items that are disabled. */
  disabledKeys: Set<Key>,

  /** A selection manager to read and update multiple selection state. */
  selectionManager: SelectionManager
}

function getNextLogicalFocusKeys<T extends object>(collection: ListCollection<T>, focusedKey: Key): Array<Key> {
  const nextFocusKeys: Array<Key> = [];
  let nextFocusKey = collection.getKeyAfter(focusedKey);
  while (nextFocusKey) {
    nextFocusKeys.push(nextFocusKey);
    nextFocusKey = collection.getKeyAfter(nextFocusKey);
  }
  return nextFocusKeys;
}

/**
 * Provides state management for list-like components. Handles building a collection
 * of items from props, and manages multiple selection state.
 */
export function useListState<T extends object>(props: ListProps<T>): ListState<T>  {
  let {filter} = props;

  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let factory = nodes => filter ? new ListCollection(filter(nodes)) : new ListCollection(nodes as Iterable<Node<T>>);
  let context = useMemo(() => ({suppressTextValueWarning: props.suppressTextValueWarning}), [props.suppressTextValueWarning]);

  let collection = useCollection(props, factory, context, [filter]);

  let [nextFocusKeys, setNextFocusKeys] = useState(getNextLogicalFocusKeys(collection, selectionState.focusedKey));

  // Reset focused key if that item is deleted from the collection, or that item is disabled
  useEffect(() => {
    if (selectionState.focusedKey != null && (!collection.getItem(selectionState.focusedKey) || disabledKeys.has(selectionState.focusedKey))) {
      let foundKey = nextFocusKeys.find(key => collection.getItem(key) && !disabledKeys.has(key));
      selectionState.setFocusedKey(foundKey);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, selectionState.focusedKey]);

  useEffect(() => {
    setNextFocusKeys(getNextLogicalFocusKeys(collection, selectionState.focusedKey));
  }, [collection, selectionState.focusedKey]);

  return {
    collection,
    disabledKeys,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
