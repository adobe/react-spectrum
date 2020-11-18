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
import {TabsProps} from '@react-types/tabs';
import {useEffect} from 'react';

export interface TabsState<T> extends SingleSelectListState<T> {}

export function useTabsState<T extends object>(props: TabsProps<T>): TabsState<T> {
  let state = useSingleSelectListState<T>(props);

  useEffect(() => {
    // Ensure a tab is always selected (in case no selected key was specified or if selected item was deleted from collection)
    if (state.selectionManager.isEmpty || !state.collection.getItem(state.selectedKey)) {
      state.selectionManager.replaceSelection(state.collection.getFirstKey());
    }
  }, [state.selectionManager, state.selectedKey, state.collection]);

  return state;
}
