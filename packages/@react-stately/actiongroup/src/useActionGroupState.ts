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

import {ActionGroupCollection} from './';
import {ActionGroupProps} from '@react-types/actiongroup';
import {ActionGroupState} from './types';
import {CollectionBase, MultipleSelection} from '@react-types/shared';
import {CollectionBuilder} from '@react-stately/collections';
import {Key, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export function useActionGroupState<T>(props: ActionGroupProps<T> & MultipleSelection & CollectionBase<T>): ActionGroupState<T> {
  let selectionState = useMultipleSelectionState(props);

  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let collection = useMemo(() => {
    let nodes = builder.build(props, (key) => ({
      isSelected: selectionState.selectedKeys.has(key),
      isDisabled: disabledKeys.has(key) || props.isDisabled
    }));

    return new ActionGroupCollection(nodes);
  }, [builder, props, selectionState.selectedKeys, disabledKeys]);

  return {
    collection,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
