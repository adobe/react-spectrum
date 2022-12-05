/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {TagGroupProps, TagGroupState} from '@react-types/tag';
import {useEffect, useRef} from 'react';
import {useListState} from '@react-stately/list';

/**
 * Provides state management for a TagGroup component.
 */
export function useTagGroupState<T extends object>(props: TagGroupProps<T>): TagGroupState<T> {
  let state = useListState(props);

  let keyToRestoreOnRemove = useRef(null);

  useEffect(() => {
    // If the focused key is removed, restore focus to the tag after, or tag before if no tag after.
    if (!state.collection.getItem(state.selectionManager.focusedKey)) {
      state.selectionManager.setFocusedKey(keyToRestoreOnRemove.current);
    }
    keyToRestoreOnRemove.current = state.collection.getKeyAfter(state.selectionManager.focusedKey) || state.collection.getKeyBefore(state.selectionManager.focusedKey);
  }, [state.collection, state.selectionManager]);

  return state;
}
