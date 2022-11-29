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

import {GridCollection, GridState, useGridState} from '@react-stately/grid';
import {ITagGroupCollection, TagGroupProps} from '@react-types/tag';
import {useEffect, useMemo, useRef} from 'react';
import {useListState} from 'react-stately';

export interface TagGroupState<T>  extends GridState<T, ITagGroupCollection<T>>{}

/**
 * Provides state management for a TagGroup component.
 */
export function useTagGroupState<T extends object>(props: TagGroupProps<T>): TagGroupState<T> {
  let listState = useListState(props);

  let gridCollection = useMemo(() => new GridCollection({
    columnCount: 1, // unused, but required for grid collections
    items: [...listState.collection].map(item => ({
      type: 'item',
      childNodes: [{
        ...item,
        index: 0,
        type: 'cell'
      }]
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [listState.collection, props.allowsRemoving]);

  let state = useGridState({
    ...props,
    collection: gridCollection,
    focusMode: 'cell'
  });

  let keyToRestoreOnRemove = useRef(null);

  useEffect(() => {
    // If the focused key is removed, restore focus to the tag before, or tag after if no tag before.
    if (!listState.collection.getItem(state.selectionManager.focusedKey)) {
      state.selectionManager.setFocusedKey(keyToRestoreOnRemove.current);
    }
    keyToRestoreOnRemove.current = listState.collection.getKeyBefore(state.selectionManager.focusedKey) || listState.collection.getKeyAfter(state.selectionManager.focusedKey);
  }, [listState.collection, state.collection, state.selectionManager]);

  return state;
}
