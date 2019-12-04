import {Key} from 'react';
import {SelectionMode} from '@react-types/shared';

export interface FocusState {
  isFocused: boolean,
  setFocused(isFocused: boolean): void,
  focusedKey: Key,
  setFocusedKey(key: Key): void,
}

export interface SingleSelectionState extends FocusState {
  selectedKey: Key,
  setSelectedKey(key: Key): void
}

export interface MultipleSelectionState extends FocusState {
  selectionMode: SelectionMode
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
