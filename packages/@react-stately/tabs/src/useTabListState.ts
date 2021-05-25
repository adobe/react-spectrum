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
import {useEffect} from 'react';


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

  useEffect(() => {
    // Ensure a tab is always selected (in case no selected key was specified or if selected item was deleted from collection)
    let selectedKey = state.selectedKey;
    if (state.selectionManager.isEmpty || !state.collection.getItem(selectedKey)) {
      selectedKey = state.collection.getFirstKey();
      state.selectionManager.replaceSelection(selectedKey);
    }

    if (state.selectionManager.focusedKey == null) {
      state.selectionManager.setFocusedKey(selectedKey);
    }
  }, [state.selectionManager, state.selectedKey, state.collection]);

  return state;
}
