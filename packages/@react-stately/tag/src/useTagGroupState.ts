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

import {Key} from 'react';
import {ListState, useListState} from '@react-stately/list';
import {TagGroupProps} from '@react-types/tag';

export interface TagGroupState<T> extends ListState<T>{
  onRemove?: (key: Key) => void
}

/**
 * Provides state management for a TagGroup component.
 */
export function useTagGroupState<T extends object>(props: TagGroupProps<T>): TagGroupState<T> {
  let state = useListState(props);

  let onRemove = (key) => {
    // If a tag is removed, restore focus to the tag after, or tag before if no tag after.
    let restoreKey = state.collection.getKeyAfter(key) || state.collection.getKeyBefore(key);
    state.selectionManager.setFocusedKey(restoreKey);
  };

  return {
    onRemove,
    ...state
  };
}
