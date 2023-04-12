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

  constructor(opts?: GridCollectionOptions<T>) {
    this.keyMap = new Map();
    this.columnCount = opts?.columnCount;
    this.rows = [];

    let visit = (node: GridNode<T>, i?: number) => {
      // Reset row counter if entering a new section so we have a index reflecting the position of the
      // row within the section
      if (node.type === 'section') {
        rowCounter = 0;
      }

      if (opts.visitNode) {
        node = opts.visitNode(node);
      }

      if (node.type === 'headerrow' || node.type === 'item' || node.type === 'section' || node.type === 'header') {
        // TODO: perhaps only add some of these default props for node.type === 'item'. Previously this was done fo all items provided
        // to the GridCollection...
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
          // rowIndex: node.type !== 'section' ? rowIndex : undefined
        };

        // Use Object.assign instead of spread to preseve object reference for keyMap. Also ensures retrieving nodes
        // via .childNodes returns the same object as well
        Object.assign(node, defaultProps, {...node}, newProps);
      }

      if (node.type !== 'cell') {
        if (last) {
          last.nextKey = node.key;
          node.prevKey = last.key;
        }
        last = node;
      }

      this.keyMap.set(node.key, node);

      let childKeys = new Set();
      let lastCell: GridNode<T>;
      let index = 0;
      for (let child of node.childNodes) {
        if (child.type === 'cell') {
          if (child.parentKey == null) {
            // if child is a cell parent key isn't already established by the collection, match child node to parent row
            child.parentKey = node.key;
          }
          childKeys.add(child.key);

          if (lastCell) {
            lastCell.nextKey = child.key;
            child.prevKey = lastCell.key;
          } else {
            child.prevKey = null;
          }

          visit(child);
          lastCell = child;
        } else {
          if (last) {
            last.nextKey = child.key;
            child.prevKey = last.key;
          } else {
            child.prevKey = null;
          }
          visit(child, index++);
          last = child;
        }
      }

      if (node.type === 'item' || node.type === 'headerrow' || node.type === 'header') {
        this.rows.push(node);
        // TODO: get rid of rowIndex, just make aria-rowindex relative to immediate parent
        // rowIndex++;
      }
    };

    let last: GridNode<T>;
    let sectionCounter = 0;
    let rowCounter = 0;
    let rowIndex = 1;
    opts.items.forEach((node: GridNode<T>, i) => {
      visit(node as GridNode<T>, i);
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
