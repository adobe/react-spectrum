import {Collection} from '@react-stately/collections';
import {Key} from 'react';
import {MultipleSelectionManager, MultipleSelectionState} from './types';
import {Selection} from './Selection';

export class SelectionManager implements MultipleSelectionManager {
  private collection: Collection<unknown>;
  private state: MultipleSelectionState;

  constructor(collection: Collection<unknown>, state: MultipleSelectionState) {
    this.collection = collection;
    this.state = state;
  }

  get selectionMode() {
    return this.state.selectionMode;
  }

  get isFocused() {
    return this.state.isFocused;
  }

  setFocused(isFocused: boolean) {
    this.state.setFocused(isFocused);
  }

  get focusedKey() {
    return this.state.focusedKey;
  }

  setFocusedKey(key: Key) {
    this.state.setFocusedKey(key);
  }

  get selectedKeys() {
    return this.state.selectedKeys;
  }

  setSelectedKeys(keys: Selection) {
    this.state.setSelectedKeys(keys);
  }

  extendSelection(toKey: Key) {
    this.state.setSelectedKeys((selectedKeys: Selection) => {
      let anchorKey = selectedKeys.anchorKey || toKey;
      let keys = new Selection(selectedKeys, anchorKey, toKey);
      for (let key of this.getKeyRange(anchorKey, selectedKeys.currentKey || toKey)) {
        keys.delete(key);
      }

      for (let key of this.getKeyRange(toKey, anchorKey)) {
        keys.add(key);
      }

      return keys;
    });
  }

  private getKeyRange(from: Key, to: Key) {
    return this.getKeyRangeInternal(from, to) || this.getKeyRangeInternal(to, from) || [];
  }

  private getKeyRangeInternal(from: Key, to: Key) {
    let keys: Key[] = [];
    let key = from;
    while (key) {
      keys.push(key);
      if (key === to) {
        return keys;
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }

  toggleSelection(key: Key) {
    this.state.setSelectedKeys(selectedKeys => {
      let keys = new Selection(selectedKeys);
      if (keys.has(key)) {
        keys.delete(key);
        // TODO: move anchor to last selected key...
        // Does `current` need to move here too?
      } else {
        keys.add(key);
        keys.anchorKey = key;
        keys.currentKey = key;
      }

      return keys;
    });
  }

  replaceSelection(key: Key) {
    this.state.setSelectedKeys(new Selection([key], key, key));
  }

  selectAll() {
    let keys = [...this.collection.getKeys()];
    this.state.setSelectedKeys(new Selection(keys, keys[0], keys[keys.length - 1]));
  }

  clearSelection() {
    this.state.setSelectedKeys(new Selection());
  }
}
