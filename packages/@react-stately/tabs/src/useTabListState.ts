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

import {Collection, CollectionStateBase, Key, Node} from '@react-types/shared';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {TabListProps} from '@react-types/tabs';
import {useEffect, useRef} from 'react';

export interface TabListStateOptions<T> extends Omit<TabListProps<T>, 'children'>, CollectionStateBase<T> {}

export interface TabListState<T> extends SingleSelectListState<T> {
  /** Whether the tab list is disabled. */
  isDisabled: boolean
}

/**
 * Provides state management for a Tabs component. Tabs include a TabList which tracks
 * which tab is currently selected and displays the content associated with that Tab in a TabPanel.
 */
export function useTabListState<T extends object>(props: TabListStateOptions<T>): TabListState<T> {
  let state = useSingleSelectListState<T>({
    ...props,
    suppressTextValueWarning: true,
    defaultSelectedKey: props.defaultSelectedKey ?? findDefaultSelectedKey(props.collection, props.disabledKeys ? new Set(props.disabledKeys) : new Set())
  });

  let {
    selectionManager,
    collection,
    selectedKey: currentSelectedKey
  } = state;

  let lastSelectedKey = useRef(currentSelectedKey);
  useEffect(() => {
    // Ensure a tab is always selected (in case no selected key was specified or if selected item was deleted from collection)
    let selectedKey = currentSelectedKey;
    if (selectionManager.isEmpty || !collection.getItem(selectedKey)) {
      selectedKey = findDefaultSelectedKey(collection, state.disabledKeys);
      if (selectedKey != null) {
        // directly set selection because replace/toggle selection won't consider disabled keys
        selectionManager.setSelectedKeys([selectedKey]);
      }
    }

    // If the tablist doesn't have focus and the selected key changes or if there isn't a focused key yet, change focused key to the selected key if it exists.
    if (selectedKey != null && selectionManager.focusedKey == null || (!selectionManager.isFocused && selectedKey !== lastSelectedKey.current)) {
      selectionManager.setFocusedKey(selectedKey);
    }
    lastSelectedKey.current = selectedKey;
  });

  return {
    ...state,
    isDisabled: props.isDisabled || false
  };
}

function findDefaultSelectedKey<T>(collection: Collection<Node<T>> | null, disabledKeys: Set<Key>) {
  let selectedKey = null;
  if (collection) {
    selectedKey = collection.getFirstKey();
    // loop over tabs until we find one that isn't disabled and select that
    while ((disabledKeys.has(selectedKey) || collection.getItem(selectedKey)?.props?.isDisabled) && selectedKey !== collection.getLastKey()) {
      selectedKey = collection.getKeyAfter(selectedKey);
    }
    // if this check is true, then every item is disabled, it makes more sense to default to the first key than the last
    if ((disabledKeys.has(selectedKey) || collection.getItem(selectedKey)?.props?.isDisabled) && selectedKey === collection.getLastKey()) {
      selectedKey = collection.getFirstKey();
    }
  }

  return selectedKey;
}
