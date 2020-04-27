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

export interface GridNode<T> extends Node<T> {
  colspan?: number
}

const ROW_HEADER_COLUMN_KEY = 'row-header-column-' + Math.random().toString(36).slice(2);

export class GridCollection<T> implements Collection<GridNode<T>> {
  private keyMap: Map<Key, Node<T>>;
  headerRows: GridNode<T>[][];
  columns: GridNode<T>[];
  body: GridNode<T>[];
  private firstKey: Key;
  private lastKey: Key;
  private hasRowHeaders: boolean;

  constructor(nodes: Iterable<Node<T>>, prev?: GridCollection<T>) {
    this.keyMap = prev?.keyMap || new Map();
    this.hasRowHeaders = prev?.hasRowHeaders || false;
    this.columns = [];

    let visit = (node: GridNode<T>) => {
      // If the node is the same object as the previous node for the same key,
      // we can skip this node and its children. We always visit columns though,
      // because we depend on order to build the columns array.
      let prevNode = this.keyMap.get(node.key);
      if (node.type !== 'column' && node === prevNode) {
        return;
      }

      this.keyMap.set(node.key, node);

      if (node.type === 'column' && !node.hasChildNodes) {
        this.columns.push(node);
      }

      // TODO: update this in case the column gets removed somehow??
      if (node.type === 'rowheader') {
        this.hasRowHeaders = true;
      }

      let childKeys = new Set();
      let last: GridNode<T>;
      let index = 0;
      for (let child of node.childNodes) {
        childKeys.add(child.key);

        if (last) {
          last.nextKey = child.key;
          child.prevKey = last.key;
        }
  
        if (node.type === 'item') {
          child.index = index++;
        }

        if (child.type !== 'item') {
          visit(child);
        }

        last = child;
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
    
    this.body = [];
    let last: GridNode<T>;
    let index = 0;
    for (let node of nodes) {
      if (last) {
        last.nextKey = node.key;
        node.prevKey = last.key;
      }

      if (node.type === 'item') {
        node.index = index++;
      }

      visit(node);
      if (node.type !== 'column') {
        if (this.firstKey == null) {
          this.firstKey = node.key;
        }

        this.body.push(node);
      }

      last = node;
    }

    if (last) {
      this.lastKey = last.key;
    }

    // If rows have header cells, add a corresponding column
    if (this.hasRowHeaders) {
      let rowHeaderColumn: GridNode<T> = {
        type: 'column',
        key: ROW_HEADER_COLUMN_KEY,
        value: null,
        textValue: '',
        level: 0,
        index: 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: [],
        props: {
          width: 55 // TODO: spectrum??
        }
      };
  
      this.keyMap.set(rowHeaderColumn.key, rowHeaderColumn);
      this.columns.unshift(rowHeaderColumn);  
    }

    this.headerRows = this.buildHeaderRows();
  }

  buildHeaderRows() {
    let columns = [];
    let seen = new Map();
    for (let column of this.columns) {      
      let parentKey = column.parentKey;
      let col = [column];

      while (parentKey) {
        let parent: GridNode<T> = this.keyMap.get(parentKey);

        // If we've already seen this parent, than it is shared
        // with a previous column. If the current column is taller
        // than the previous column, than we need to shift the parent
        // in the previous column so it's level with the current column.
        if (seen.has(parent)) {
          parent.colspan++;

          let {column, index} = seen.get(parent);
          if (index > col.length) {
            break;
          }

          for (let i = index; i < col.length; i++) {
            column.splice(i, 0, null);
          }

          // Adjust shifted indices
          for (let i = col.length; i < column.length; i++) {
            if (column[i] && seen.has(column[i])) {
              seen.get(column[i]).index = i;
            }
          }
        } else {
          parent.colspan = 1;
          col.push(parent);
          seen.set(parent, {column: col, index: col.length - 1});
        }

        parentKey = parent.parentKey;
      }

      columns.push(col);
      column.index = columns.length - 1;
    }

    let maxLength = Math.max(...columns.map(c => c.length));
    let headerRows = Array(maxLength).fill(0).map(() => []);

    // Convert columns into rows.
    let colIndex = 0;
    for (let column of columns) {
      let i = maxLength - 1;
      for (let item of column) {
        if (item) {
          // Fill the space up until the current column with a placeholder
          let row = headerRows[i];
          let rowLength = row.reduce((p, c) => p + c.colspan, 0);
          if (rowLength < colIndex) {
            let placeholder: GridNode<T> = {
              type: 'placeholder',
              key: 'placeholder-' + item.key,
              colspan: colIndex - rowLength,
              index: row.length,
              value: null,
              rendered: null,
              level: i,
              hasChildNodes: false,
              childNodes: [],
              textValue: null
            };

            row.push(placeholder);
            this.keyMap.set(placeholder.key, placeholder);
          }

          item.level = i;
          item.index = row.length;
          row.push(item);
        }

        i--;
      }

      colIndex++;
    }

    // Add placeholders at the end of each row that is shorter than the maximum
    let i = 0;
    for (let row of headerRows) {
      let rowLength = row.reduce((p, c) => p + c.colspan, 0);
      if (rowLength < this.columns.length) {
        let placeholder: GridNode<T> = {
          type: 'placeholder',
          key: 'placeholder-' + row[row.length - 1].key,
          colspan: this.columns.length - rowLength,
          index: row.length,
          value: null,
          rendered: null,
          level: i,
          hasChildNodes: false,
          childNodes: [],
          textValue: null
        };

        row.push(placeholder);
        this.keyMap.set(placeholder.key, placeholder);
      }

      i++;
    }

    return headerRows;
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
