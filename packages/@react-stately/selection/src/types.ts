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
  /** Whether the collection is currently focused. */
  readonly isFocused: boolean,
  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void,
  /** The current focused key in the collection. */
  readonly focusedKey: Key,
  /** Sets the focused key. */
  setFocusedKey(key: Key): void
}

export interface SingleSelectionState extends FocusState {
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection?: boolean,
  /** The currently selected key in the collection. */
  readonly selectedKey: Key,
  /** Sets the selected key in the collection. */
  setSelectedKey(key: Key): void
}

export interface MultipleSelectionState extends FocusState {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode,
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection: boolean,
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Selection,
  /** Sets the selected keys in the collection. */
  setSelectedKeys(keys: Selection | ((v: Selection) => Selection)): void
}

export interface MultipleSelectionManager extends FocusState {
  /** The type of selection that is allowed in the collection. */
  readonly selectionMode: SelectionMode,
  /** Whether the collection allows empty selection. */
  readonly disallowEmptySelection?: boolean,
  /** The currently selected keys in the collection. */
  readonly selectedKeys: Set<Key>,
  /** Whether the selection is empty. */
  readonly isEmpty: boolean,
  /** Whether all items in the collection are selected. */
  readonly isSelectAll: boolean,
  /** The first selected key in the collection. */
  readonly firstSelectedKey: Key | null,
  /** The last selected key in the collection. */
  readonly lastSelectedKey: Key | null,
  /** Returns whether a key is selected. */
  isSelected(key: Key): boolean,
  /** Extends the selection to the given key. */
  extendSelection(toKey: Key): void,
  /** Toggles whether the given key is selected. */
  toggleSelection(key: Key): void,
  /** Replaces the selection with only the given key. */
  replaceSelection(key: Key): void,
  /** Selects all items in the collection. */
  selectAll(): void,
  /** Removes all keys from the selection. */
  clearSelection(): void,
  /** Toggles between select all and an empty selection. */
  toggleSelectAll(): void
}
