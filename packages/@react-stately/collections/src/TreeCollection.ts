import {Collection, Node} from './types';
import {Key} from 'react';

export class TreeCollection<T> implements Collection<Node<T>> {
  private keyMap: Map<Key, Node<T>> = new Map();
  private iterable: Iterable<Node<T>>;
  private firstKey: Key;
  private lastKey: Key;

  constructor(nodes: Iterable<Node<T>>) {
    this.iterable = nodes;

    let visit = (node: Node<T>) => {
      this.keyMap.set(node.key, node);

      if (node.childNodes && (node.type === 'section' || node.isExpanded)) {
        for (let child of node.childNodes) {
          visit(child);
        }
      }
    };

    for (let node of nodes) {
      visit(node);
    }

    let last: Node<T>;
    for (let [key, node] of this.keyMap) {
      if (node.type !== 'item') {
        continue;
      }
      
      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
      }

      last = node;
    }

    this.lastKey = last.key
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
