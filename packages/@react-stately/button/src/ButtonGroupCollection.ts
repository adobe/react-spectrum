import {Collection} from '@react-stately/collections';
import {Key} from 'react';

export class ButtonGroupCollection<T extends {key: Key}> implements Collection<T> {
  public items: T[];
  private keys: Key[];

  constructor(items: T[]) {
    this.items = items;
    this.keys = items.map(child => child.key);
  }

  getKeys() {
    return this.keys;
  }

  getKeyBefore(key: Key) {
    let index = this.keys.indexOf(key);
    let itemBefore = this.keys[--index];
    return itemBefore || this.getLastKey();
  }

  getKeyAfter(key: Key) {
    let index = this.keys.indexOf(key);
    let itemAfter = this.keys[++index];
    return itemAfter || this.getFirstKey();
  }

  getFirstKey() {
    return this.keys[0];
  }

  getLastKey() {
    return this.keys[this.keys.length - 1];
  }
  
  getItem(key: Key) {
    return this.items.find(child => child.key === key);
  }
}
