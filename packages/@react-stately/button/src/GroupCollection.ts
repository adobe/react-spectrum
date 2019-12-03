import {Collection} from '@react-stately/collections';
import {GroupNode} from './types';
import {Key} from 'react';

export class GroupCollection implements Collection<GroupNode> {
  private keyMap: Map<Key, GroupNode> = new Map();
  private iterable: Iterable<GroupNode>;
  private firstKey: Key;
  private lastKey: Key;

  constructor(nodes: Iterable<GroupNode>) {
    this.iterable = nodes;

    for (let node of nodes) {
      this.keyMap.set(node.key, node);
    }

    let last: GroupNode;
    for (let [key, node] of this.keyMap) {

      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
      }

      last = node;
    }

    this.lastKey = last.key;
  }

  *[Symbol.iterator]() {
    yield* this.iterable;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  getKeyBefore(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.prevKey : null;
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    return node ? node.nextKey : null;
  }

  getFirstKey() {
    return this.firstKey;
  }

  getLastKey() {
    return this.lastKey;
  }
  
  getItem(key: Key) {
    return this.keyMap.get(key);
  }
}
