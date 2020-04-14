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

interface Placeholder {
  type: 'placeholder',
  colspan: number
}

interface GridNode<T> extends Node<T> {
  colspan?: number
}

const ROW_HEADER_COLUMN_KEY = 'row-header-column-' + Math.random().toString(36).slice(2);

export class GridCollection<T> implements Collection<GridNode<T>> {
  private keyMap: Map<Key, Node<T>> = new Map();
  headerRows: (GridNode<T> | Placeholder)[][];
  columns: GridNode<T>[];
  body: GridNode<T>[];
  private firstKey: Key;
  private lastKey: Key;

  constructor(nodes: Iterable<Node<T>>) {
    this.headerRows = [];
    this.columns = [];

    let hasRowHeaders = false;
    let visit = (node: GridNode<T>) => {
      this.keyMap.set(node.key, node);

      if (node.type === 'column' && !node.hasChildNodes) {
        this.columns.push(node);
      }

      if (node.type === 'rowheader') {
        hasRowHeaders = true;
      }

      for (let child of node.childNodes) {
        if (child.type !== 'item' || node.isExpanded) {
          visit(child);
        }
      }
    };
    
    this.body = [];
    for (let node of nodes) {
      visit(node);
      if (node.type !== 'column') {
        this.body.push(node);
      }
    }

    // If rows have header cells, add a corresponding column
    if (hasRowHeaders) {
      let rowHeaderColumn: GridNode<T> = {
        type: 'column',
        key: ROW_HEADER_COLUMN_KEY,
        value: null,
        textValue: '',
        level: 0,
        index: 0,
        hasChildNodes: false,
        rendered: null,
        childNodes: []
      };
  
      this.keyMap.set(rowHeaderColumn.key, rowHeaderColumn);
      this.columns.unshift(rowHeaderColumn);  
    }

    this.headerRows = this.buildHeaderRows();

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
            row.push({
              type: 'placeholder',
              colspan: colIndex - rowLength
            });
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
    for (let row of headerRows) {
      let rowLength = row.reduce((p, c) => p + c.colspan, 0);
      if (rowLength < this.columns.length) {
        row.push({
          type: 'placeholder',
          colspan: this.columns.length - rowLength
        });
      }
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
