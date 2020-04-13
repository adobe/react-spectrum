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

import {CollectionBuilder, Node} from '@react-stately/collections';
import {CollectionBase, MultipleSelection, SelectionMode} from '@react-types/shared';
import {Key, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {GridCollection} from './GridCollection';

export interface GridState<T> {
  collection: GridCollection<T>,
  selectionManager: SelectionManager<T>
}

export interface CollectionBuilderContext<T> {
  showSelectionCheckboxes: boolean,
  selectionMode: SelectionMode,
  columns: Node<T>[]
}

export interface GridStateProps<T> extends CollectionBase<T>, MultipleSelection {
  showSelectionCheckboxes?: boolean
}

export function useGridState<T>(props: GridStateProps<T>): GridState<T>  {
  let selectionState = useMultipleSelectionState(props);
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);
  
  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let collection = useMemo(() => {
    let context = {
      showSelectionCheckboxes: props.showSelectionCheckboxes,
      selectionMode: selectionState.selectionMode,
      columns: []
    };
  
    let nodes = builder.build(props, (key) => ({
      isSelected: selectionState.selectedKeys.has(key),
      isDisabled: disabledKeys.has(key),
      isFocused: key === selectionState.focusedKey
    }), context);

    return new GridCollection(nodes);
  }, [builder, props, selectionState.selectedKeys, selectionState.focusedKey, disabledKeys]);

  return {
    collection,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
