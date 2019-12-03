import {Collection} from '@react-stately/collections';
import {Key} from 'react';
import {KeyboardDelegate} from '@react-types/shared';

export class GroupLayout<T> implements KeyboardDelegate {
  private collection: any;

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  getKeyLeftOf(key: Key) {
    return this.collection.getKeyBefore(key);
  }

  getKeyRightOf(key: Key) {
    return this.collection.getKeyAfter(key);
  }

  getKeyAbove(key: Key) {
    return this.collection.getKeyBefore(key);
  }

  getKeyBelow(key: Key) {
    return this.collection.getKeyAfter(key);
  }

  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }
}
