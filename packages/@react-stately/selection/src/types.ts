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

import {Key} from 'react';
import {Selection, SelectionMode} from '@react-types/shared';

export interface FocusState {
  /**
   * Whether the collection is currently focused.
   */
  isFocused: boolean,
  /**
   * Sets whether the collection is focused.
   */
  setFocused(isFocused: boolean): void,
  /**
   * The current focused key in the collection.
   */
  focusedKey: Key,
  /**
   * Sets the focused key.
   */
  setFocusedKey(key: Key): void,
}

export interface SingleSelectionState extends FocusState {
  disallowEmptySelection?: boolean,
  selectedKey: Key,
  setSelectedKey(key: Key): void
}

export interface MultipleSelectionState extends FocusState {
  /**
   * The type of selection that is allowed in the collection.
   */
  selectionMode: SelectionMode,
  /**
   * Whether the collection allows empty selection.
   */
  disallowEmptySelection?: boolean,
  /**
   * The currently selected keys in the collection.
   */
  selectedKeys: Selection,
  /**
   * Sets the selected keys.
   */
  setSelectedKeys(keys: Selection | ((v: Selection) => Selection)): void
}

export interface MultipleSelectionManager extends FocusState {
  selectionMode: SelectionMode,
  disallowEmptySelection?: boolean,
  selectedKeys: Set<Key>,
  extendSelection(toKey: Key): void,
  toggleSelection(key: Key): void,
  replaceSelection(key: Key): void,
  selectAll(): void,
  clearSelection(): void,
  isSelected(key: Key): boolean
}
