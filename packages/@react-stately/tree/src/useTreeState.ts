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

import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionBuilder, TreeCollection} from '@react-stately/collections';
import {Key, useMemo, useState} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {useControlledState} from '@react-stately/utils';

export interface TreeState<T> {
  tree: TreeCollection<T>,
  expandedKeys: Set<Key>,
  disabledKeys: Set<Key>,
  toggleKey: (key: Key) => void,
  selectionManager: SelectionManager
}

export function useTreeState<T>(props: CollectionBase<T> & Expandable & MultipleSelection): TreeState<T> {
  console.log('useTreeState props', props);
  let [expandedKeys, setExpandedKeys] = useControlledState(
    props.expandedKeys ? new Set(props.expandedKeys) : undefined,
    props.defaultExpandedKeys ? new Set(props.defaultExpandedKeys) : new Set(),
    props.onExpandedChange
  );

  let selectionState = useMultipleSelectionState(props);
  console.log('selectionSatet', selectionState)
  let [disabledKeys] = useState(
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  );

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let tree = useMemo(() => {
    let nodes = builder.build(props, (key) => {
      console.log('builder key', key);
     return ({
        isExpanded: expandedKeys.has(key),
        isSelected: selectionState.selectedKeys.has(key),
        isDisabled: disabledKeys.has(key),
        isFocused: key === selectionState.focusedKey
      }
     )
    });

    return new TreeCollection(nodes);
  }, [builder, props, expandedKeys, selectionState.selectedKeys, selectionState.focusedKey, disabledKeys]);

  let onToggle = (key: Key) => {
    setExpandedKeys(expandedKeys => toggleKey(expandedKeys, key));
  };

  return {
    tree,
    expandedKeys,
    disabledKeys,
    toggleKey: onToggle,
    selectionManager: new SelectionManager(tree, selectionState)
  };
}

function toggleKey(set: Set<Key>, key: Key): Set<Key> {
  let res = new Set(set);
  if (res.has(key)) {
    res.delete(key);
  } else {
    res.add(key);
  }

  return res;
}
