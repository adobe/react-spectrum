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
import {SelectionMode} from '@react-types/shared';

export interface FocusState {
  isFocused: boolean,
  setFocused(isFocused: boolean): void,
  focusedKey: Key,
  setFocusedKey(key: Key): void,
}

export interface SingleSelectionState extends FocusState {
  allowsEmptySelection?: boolean,
  selectedKey: Key,
  setSelectedKey(key: Key): void
}

export interface MultipleSelectionState extends FocusState {
  selectionMode: SelectionMode,
  allowsEmptySelection?: boolean,
  selectedKeys: Set<Key>,
  setSelectedKeys(keys: Set<Key> | ((v: Set<Key>) => Set<Key>)): void
}

export interface MultipleSelectionManager extends MultipleSelectionState {
  extendSelection(toKey: Key): void,
  toggleSelection(key: Key): void,
  replaceSelection(key: Key): void,
  selectAll(): void,
  clearSelection(): void
}
