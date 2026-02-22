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

import {Collection, CollectionStateBase, Key, LayoutDelegate, Node} from '@react-types/shared';
import {ListCollection} from './ListCollection';
import {MultipleSelectionStateProps, SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useCollection} from '@react-stately/collections';

export interface ListProps<T> extends CollectionStateBase<T>, MultipleSelectionStateProps {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>,
  /** @private */
  suppressTextValueWarning?: boolean,
  /**
   * A delegate object that provides layout information for items in the collection.
   * This can be used to override the behavior of shift selection.
   */
  layoutDelegate?: LayoutDelegate
}

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
export function useListState<T extends object>(props: ListProps<T>): ListState<T>  {
  let {filter, layoutDelegate} = props;

  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let factory = useCallback(nodes => filter ? new ListCollection(filter(nodes)) : new ListCollection(nodes as Iterable<Node<T>>), [filter]);
  let context = useMemo(() => ({suppressTextValueWarning: props.suppressTextValueWarning}), [props.suppressTextValueWarning]);

  let collection = useCollection(props, factory, context);

  let selectionManager = useMemo(() =>
    new SelectionManager(collection, selectionState, {layoutDelegate})
    , [collection, selectionState, layoutDelegate]
  );

  useFocusedKeyReset(collection, selectionManager);

  return {
    collection,
    disabledKeys,
    selectionManager
  };
}

/**
 * Filters a collection using the provided filter function and returns a new ListState.
 */
export function UNSTABLE_useFilteredListState<T extends object>(state: ListState<T>, filterFn: ((nodeValue: string, node: Node<T>) => boolean) | null | undefined): ListState<T> {
  let collection = useMemo(() => filterFn ? state.collection.filter!(filterFn) : state.collection, [state.collection, filterFn]);
  let selectionManager = state.selectionManager.withCollection(collection);
  useFocusedKeyReset(collection, selectionManager);
  return {
    collection,
    selectionManager,
    disabledKeys: state.disabledKeys
  };
}

function useFocusedKeyReset<T>(collection: Collection<Node<T>>, selectionManager: SelectionManager) {
  // Reset focused key if that item is deleted from the collection.
  const cachedCollection = useRef<Collection<Node<T>> | null>(null);
  useEffect(() => {
    if (selectionManager.focusedKey != null && !collection.getItem(selectionManager.focusedKey) && cachedCollection.current) {
      const startItem = cachedCollection.current.getItem(selectionManager.focusedKey);

      // Helper to get all item nodes from a collection (flattening sections)
      const getAllItemNodes = (coll: Collection<Node<T>>): Node<T>[] => {
        const items: Node<T>[] = [];
        for (let node of coll) {
          if (node.type === 'item') {
            items.push(node);
          } else if (node.type === 'section' && coll.getChildren?.(node.key)) {
            for (let child of coll.getChildren(node.key)) {
              if (child.type === 'item') {
                items.push(child);
              }
            }
          }
        }
        return items;
      };

      const cachedItemNodes = getAllItemNodes(cachedCollection.current);
      const itemNodes = getAllItemNodes(collection);

      // Count how many items were removed before the focused item's original index
      const itemNodesKeys = new Set(itemNodes.map(node => node.key));
      const removedBeforeCount = cachedItemNodes.filter((node, idx) =>
        idx < (startItem?.index ?? 0) && !itemNodesKeys.has(node.key)
      ).length;

      let index = Math.min(
        Math.max((startItem?.index ?? 0) - removedBeforeCount, 0),
        (itemNodes?.length ?? 0) - 1);
      let newNode: Node<T> | null = null;
      let isReverseSearching = false;
      while (index >= 0) {
        if (!selectionManager.isDisabled(itemNodes[index].key)) {
          newNode = itemNodes[index];
          break;
        }
        // Find next, not disabled item.
        if (index < itemNodes.length - 1 && !isReverseSearching) {
          index++;
        // Otherwise, find previous, not disabled item.
        } else {
          isReverseSearching = true;
          if (index > (startItem?.index ?? 0)) {
            index = (startItem?.index ?? 0);
          }
          index--;
        }
      }
      selectionManager.setFocusedKey(newNode ? newNode.key : null);
    }
    cachedCollection.current = collection;
  }, [collection, selectionManager]);
}
