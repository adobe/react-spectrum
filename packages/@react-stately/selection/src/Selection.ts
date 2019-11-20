import {Key} from 'react';

/**
 * A Selection is a special Set containing Keys, which also has an anchor
 * and current selected key for use when range selecting.
 */
export class Selection extends Set<Key> {
  anchorKey: Key;
  currentKey: Key;

  constructor(keys?: Iterable<Key> | Selection, anchorKey?: Key, currentKey?: Key) {
    super(keys);
    if (keys instanceof Selection) {
      this.anchorKey = anchorKey || keys.anchorKey;
      this.currentKey = currentKey || keys.currentKey;
    } else {
      this.anchorKey = anchorKey;
      this.currentKey = currentKey;
    }
  }
}
