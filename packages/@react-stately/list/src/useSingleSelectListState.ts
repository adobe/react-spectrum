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

import {CollectionStateBase, Key, Node, Selection, SingleSelection} from '@react-types/shared';
import {ListState, useListState} from './useListState';
import {useControlledState} from '@react-stately/utils';
import {useMemo} from 'react';

export interface SingleSelectListProps<T> extends CollectionStateBase<T>, Omit<SingleSelection, 'disallowEmptySelection'> {
  /** Filter function to generate a filtered list of nodes. */
  filter?: (nodes: Iterable<Node<T>>) => Iterable<Node<T>>,
  /** @private */
  suppressTextValueWarning?: boolean
}

export interface SingleSelectListState<T> extends ListState<T> {
  /** The key for the currently selected item. */
  readonly selectedKey: Key | null,

  /** Sets the selected key. */
  setSelectedKey(key: Key | null): void,

  /** The value of the currently selected item. */
  readonly selectedItem: Node<T> | null
}

/**
 * Provides state management for list-like components with single selection.
 * Handles building a collection of items from props, and manages selection state.
 */
export function useSingleSelectListState<T extends object>(props: SingleSelectListProps<T>): SingleSelectListState<T>  {
  let [selectedKey, setSelectedKey] = useControlledState(props.selectedKey, props.defaultSelectedKey ?? null, props.onSelectionChange);
  let selectedKeys = useMemo(() => selectedKey != null ? [selectedKey] : [], [selectedKey]);
  let {collection, disabledKeys, selectionManager} = useListState({
    ...props,
    selectionMode: 'single',
    disallowEmptySelection: true,
    allowDuplicateSelectionEvents: true,
    selectedKeys,
    onSelectionChange: (keys: Selection) => {
      // impossible, but TS doesn't know that
      if (keys === 'all') {
        return;
      }
      let key = keys.values().next().value ?? null;

      // Always fire onSelectionChange, even if the key is the same
      // as the current key (useControlledState does not).
      if (key === selectedKey && props.onSelectionChange) {
        props.onSelectionChange(key);
      }

      setSelectedKey(key);
    }
  });

  let selectedItem = selectedKey != null
    ? collection.getItem(selectedKey)
    : null;

  return {
    collection,
    disabledKeys,
    selectionManager,
    selectedKey,
    setSelectedKey,
    selectedItem
  };
}
