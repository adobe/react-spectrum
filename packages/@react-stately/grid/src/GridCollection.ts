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

import {Collection, Node} from '@react-stately/collections';
import {Key} from 'react';

interface GridNode<T> extends Node<T> {
  colspan?: number
}

export class GridCollection<T> implements Collection<GridNode<T>> {
  private keyMap: Map<Key, Node<T>> = new Map();
  headerRows: GridNode<T>[][];
  body: GridNode<T>[];
  private firstKey: Key;
  private lastKey: Key;

  constructor(nodes: Iterable<Node<T>>) {
    this.headerRows = [];
    let visit = (node: GridNode<T>) => {
      this.keyMap.set(node.key, node);

      if (node.type === 'column') {
        if (!this.headerRows[node.level]) {
          this.headerRows[node.level] = [];
        }

        node.index = this.headerRows[node.level].length;
        this.headerRows[node.level].push(node);
      }

      let leafCount = 0;
      let children = [...node.childNodes];
      if (children.length > 0) {
        for (let child of children) {
          if (child.type !== 'item' || node.type === 'section' || node.isExpanded) {
            leafCount += visit(child);
          }
        }
      } else if (node.type === 'column') {
        leafCount++;
      }

      if (node.type === 'column') {
        node.colspan = leafCount;
      }

      return leafCount;
    };

    this.body = [];
    for (let node of nodes) {
      let columnCount = visit(node);
      if (columnCount === 0) {
        this.body.push(node);
      }
    }

    let last: GridNode<T>;
    let index = 0;
    for (let [key, node] of this.keyMap) {
      if (last) {
        last.nextKey = key;
        node.prevKey = last.key;
      } else {
        this.firstKey = key;
      }

      if (node.type === 'item') {
        node.index = index++;
      }

      last = node;
    }

    if (last) {
      this.lastKey = last.key;
    }
  }

  *[Symbol.iterator]() {
    yield* this.body;
  }

  get size() {
    return this.keyMap.size;
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
