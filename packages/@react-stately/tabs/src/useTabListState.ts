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

import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {TabListProps} from '@react-types/tabs';
import {useEffect, useRef} from 'react';


export interface TabListState<T> extends SingleSelectListState<T> {}

/**
 * Provides state management for a Tabs component. Tabs include a TabList which tracks
 * which tab is currently selected and displays the content associated with that Tab in a TabPanel.
 */
export function useTabListState<T extends object>(props: TabListProps<T>): TabListState<T> {
  let state = useSingleSelectListState<T>({
    ...props,
    suppressTextValueWarning: true
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
      selectedKey = collection.getFirstKey();
      selectionManager.replaceSelection(selectedKey);
    }

    if (selectionManager.focusedKey == null) {
      selectionManager.setFocusedKey(selectedKey);
    }

    lastSelectedKey.current = selectedKey;
  }, [selectionManager, currentSelectedKey, collection]);

  // If the tablist doesn't have focus and the selected key changes, change focused key to the selected key if it exists. This keeps
  // the user's tablist positioning consistent with the tabpanel content when they re-enter the tablist.
  if (!selectionManager.isFocused && currentSelectedKey != null && lastSelectedKey.current !== currentSelectedKey && collection.getItem(currentSelectedKey) != null) {
    selectionManager.setFocusedKey(currentSelectedKey);
  }
  lastSelectedKey.current = currentSelectedKey;

  return state;
}
