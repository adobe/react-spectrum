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
import {GridNode, GridRow, GridCollection as IGridCollection} from '@react-types/grid';
import {Key} from 'react';


interface GridCollectionOptions<T> {
  columnCount: number,
  items: GridRow<T>[],
  visitNode?: (cell: GridNode<T>) => GridNode<T>
}

export class GridCollection<T> implements IGridCollection<T> {
  keyMap: Map<Key, GridNode<T>> = new Map();
  columnCount: number;
  rows: GridNode<T>[];
  sections: GridNode<T>[];

  constructor(opts?: GridCollectionOptions<T>) {
    this.keyMap = new Map();
    this.columnCount = opts?.columnCount;
    this.rows = [];
    this.sections = [];

    let visit = (node: GridNode<T>) => {
      // If the node is the same object as the previous node for the same key,
      // we can skip this node and its children. We always visit columns though,
      // because we depend on order to build the columns array.
      let prevNode = this.keyMap.get(node.key);
      if (opts.visitNode) {
        node = opts.visitNode(node);
      }

      this.keyMap.set(node.key, node);

      let childKeys = new Set();
      let last: GridNode<T>;
      for (let child of node.childNodes) {
        if (child.type === 'cell' && child.parentKey == null) {
          // if child is a cell parent key isn't already established by the collection, match child node to parent row
          child.parentKey = node.key;
        }
        childKeys.add(child.key);

        if (last) {
          last.nextKey = child.key;
          child.prevKey = last.key;
        } else {
          child.prevKey = null;
        }

        visit(child);
        last = child;
      }

      if (last) {
        last.nextKey = null;
      }

      // Remove deleted nodes and their children from the key map
      if (prevNode) {
        for (let child of prevNode.childNodes) {
          if (!childKeys.has(child.key)) {
            remove(child);
          }
        }
      }
    };

    let remove = (node: GridNode<T>) => {
      this.keyMap.delete(node.key);
      for (let child of node.childNodes) {
        if (this.keyMap.get(child.key) === child) {
          remove(child);
        }
      }
    };

    let last: GridNode<T>;
    let sectionCounter = 0;
    let rowCounter = 0;
    let rowIndex = 1;
    opts.items.forEach((node: GridNode<T>, i) => {
      // Reset row counter if entering a new section so we have a index reflecting the position of the
      // row within the section
      if (node.type === 'section') {
        rowCounter = 0;
      }

      let defaultProps = {
        level: 0,
        key: 'row-' + i,
        type: 'row',
        value: undefined,
        hasChildNodes: true,
        childNodes: [...node.childNodes],
        rendered: undefined,
        textValue: undefined,
        colspan: node.type === 'section' || node.props?.isSectionHeader ? this.columnCount : 1
      };

      let newProps = {
        index: node.type === 'section' ? sectionCounter++ : rowCounter++,
        rowIndex: node.type !== 'section' ? rowIndex : undefined
      };

      // Use Object.assign instead of spread to preseve object reference, ensures retrieving nodes
      // via .childNodes returns the same object as the keyMap
      Object.assign(node, defaultProps, {...node}, newProps);

      if (last) {
        last.nextKey = node.key;
        node.prevKey = last.key;
      } else {
        node.prevKey = null;
      }

      if (node.type === 'section') {
        this.sections.push(node);
      } else {
        this.rows.push(node);
        rowIndex++;
      }

      visit(node);

      last = node;
    });

    if (last) {
      last.nextKey = null;
    }
  }

  *[Symbol.iterator]() {
    yield* [...this.rows];
  }

  get size() {
    return [...this.rows].length;
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
    return [...this.rows][0]?.key;
  }

  getLastKey() {
    let rows = [...this.rows];
    return rows[rows.length - 1]?.key;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at(idx: number) {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }

  getChildren(key: Key): Iterable<GridNode<T>> {
    let node = this.keyMap.get(key);
    return node?.childNodes || [];
  }
}
