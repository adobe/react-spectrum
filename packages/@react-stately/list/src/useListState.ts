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
export function UNSTABLE_useFilteredListState<T extends object>(state: ListState<T>, filter: ((nodeValue: string) => boolean) | null | undefined, shouldIncludeLoaders?: boolean): ListState<T> {
  // TODO: this doesn't quite work with combobox because the base collection becomes a ListCollection due to useComboBoxState which doesn't have filter since it is old collections...
  let collection = useMemo(() => (filter || (shouldIncludeLoaders != null) && state.collection.UNSTABLE_filter) ? state.collection.UNSTABLE_filter!(filter ?? (() => true), shouldIncludeLoaders) : state.collection, [state.collection, filter, shouldIncludeLoaders]);
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
    if (selectionManager.focusedKey != null && cachedCollection.current) {
      let item = collection.getItem(selectionManager.focusedKey);
      if (!item) {
        const startItem = cachedCollection.current.getItem(selectionManager.focusedKey);
        const cachedItemNodes = [...cachedCollection.current.getKeys()].map(
          key => {
            const itemNode = cachedCollection.current!.getItem(key);
            return itemNode?.type === 'item' || itemNode?.type === 'loader' ? itemNode : null;
          }
        ).filter(node => node !== null);
        const itemNodes = [...collection.getKeys()].map(
          key => {
            const itemNode = collection.getItem(key);
            return itemNode?.type === 'item' || itemNode?.type === 'loader' ? itemNode : null;
          }
        ).filter(node => node !== null);
        const diff: number = (cachedItemNodes?.length ?? 0) - (itemNodes?.length ?? 0);
        // Look up the start item's index in the cached node array. We can't rely on the node's index
        // because it maybe in a section and thus have a index relative to that section
        // TODO: the collection keys/item are not guarenteed to be in order
        // (aka the loader will be the first node in the keymap if the collection was empty and then loaded items)
        // this means we should ideally traverse through the key's prevKey until we find a focusable node but
        // that is a bigger refactor, will handle later. For now continue assuming that the loader is the last element
        let startItemIndex = 0;
        if (startItem) {
          if (startItem.type === 'loader') {
            startItemIndex = cachedItemNodes.length;
          } else {
            startItemIndex = cachedItemNodes.indexOf(startItem);
          }
        }

        let index = Math.min(
          (
            diff > 1 ?
            Math.max((startItemIndex) - diff + 1, 0) :
            startItemIndex
          ),
          (itemNodes?.length ?? 0) - 1);
        let newNode: Node<T> | null = null;
        let isReverseSearching = false;
        while (index >= 0) {
          // Find a row that is not disabled, nor is a loader sentinel that isn't loading
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
            // eslint-disable-next-line max-depth
            if (index > startItemIndex) {
              index = startItemIndex;
            }
            index--;
          }
        }
        selectionManager.setFocusedKey(newNode ? newNode.key : null);
      }
    }
    cachedCollection.current = collection;
  }, [collection, selectionManager]);
}
