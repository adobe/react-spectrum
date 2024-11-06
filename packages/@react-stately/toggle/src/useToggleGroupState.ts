/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';
import {useMemo} from 'react';

export interface ToggleGroupProps {
  /** Whether single or multiple selection is enabled. */
  selectionMode?: 'single' | 'multiple',
  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: boolean,
  /** The currently selected keys in the collection (controlled). */
  selectedKeys?: Iterable<Key>,
  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>,
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (keys: Set<Key>) => void,
  /** Whether all items are disabled. */
  isDisabled?: boolean
}

export interface ToggleGroupState {
  /** Whether single or multiple selection is enabled. */
  readonly selectionMode: 'single' | 'multiple',

  /** Whether all items are disabled. */
  readonly isDisabled: boolean,
  
  /** A set of keys for items that are selected. */
  readonly selectedKeys: Set<Key>,

  /** Toggles the selected state for an item by its key. */
  toggleKey(key: Key): void,

  /** Sets whether the given key is selected. */
  setSelected(key: Key, isSelected: boolean): void,

  /** Replaces the set of selected keys. */
  setSelectedKeys(keys: Set<Key>): void
}

/**
 * Manages state for a group of toggles.
 * It supports both single and multiple selected items.
 */
export function useToggleGroupState(props: ToggleGroupProps): ToggleGroupState {
  let {selectionMode = 'single', disallowEmptySelection, isDisabled = false} = props;
  let [selectedKeys, setSelectedKeys] = useControlledState(
    useMemo(() => props.selectedKeys ? new Set(props.selectedKeys) : undefined, [props.selectedKeys]),
    useMemo(() => props.defaultSelectedKeys ? new Set(props.defaultSelectedKeys) : new Set(), [props.defaultSelectedKeys]),
    props.onSelectionChange
  );

  return {
    selectionMode,
    isDisabled,
    selectedKeys,
    setSelectedKeys,
    toggleKey(key) {
      let keys: Set<Key>;
      if (selectionMode === 'multiple') {
        keys = new Set(selectedKeys);
        if (keys.has(key) && (!disallowEmptySelection || keys.size > 1)) {
          keys.delete(key);
        } else {
          keys.add(key);
        }
      } else {
        keys = new Set(selectedKeys.has(key) && !disallowEmptySelection ? [] : [key]);
      }
  
      setSelectedKeys(keys);
    },
    setSelected(key, isSelected) {
      if (isSelected !== selectedKeys.has(key)) {
        this.toggleKey(key);
      }
    }
  };
}
