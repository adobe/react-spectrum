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

import {Collection, Node} from '@react-stately/collections';
import {FocusStrategy} from '@react-types/menu';
import {Key, useMemo, useState} from 'react';
import {SelectionManager} from '@react-stately/selection';
import {SelectProps} from '@react-types/select';
import {useControlledState} from '@react-stately/utils';
import {useListState} from '@react-stately/list'; // TODO: move

export interface SelectState<T> {
  collection: Collection<Node<T>>,
  disabledKeys: Set<Key>,
  selectionManager: SelectionManager,
  selectedKey: Key,
  setSelectedKey: (key: Key) => void,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  toggle(focusStrategy?: FocusStrategy): void,
  focusStrategy: FocusStrategy,
  setFocusStrategy: (focusStrategy: FocusStrategy) => void
}

export function useSelectState<T>(props: SelectProps<T>): SelectState<T>  {
  let [selectedKey, setSelectedKey] = useControlledState(props.selectedKey, props.defaultSelectedKey, props.onSelectionChange);
  let selectedKeys = useMemo(() => selectedKey != null ? [selectedKey] : [], [selectedKey]);
  let {collection, disabledKeys, selectionManager} = useListState({
    ...props,
    selectionMode: 'single',
    selectedKeys,
    onSelectionChange: (keys) => {
      setSelectedKey(keys.values().next().value);
      setOpen(false);
    }
  });

  // TODO: move to useMenuTriggerState
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);
  let [focusStrategy, setFocusStrategy] = useState('first' as FocusStrategy);

  return {
    collection,
    disabledKeys,
    selectionManager,
    selectedKey,
    setSelectedKey,
    isOpen,
    setOpen,
    focusStrategy,
    setFocusStrategy,
    toggle(focusStrategy = 'first') {
      setFocusStrategy(focusStrategy);
      setOpen(isOpen => !isOpen);
    }
  };
}
