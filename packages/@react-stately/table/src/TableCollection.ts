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
import {GridCollection} from '@react-stately/grid';
import {GridNode} from '@react-types/grid';
import {Key} from 'react';

interface GridCollectionOptions {
  showSelectionCheckboxes?: boolean
}

const ROW_HEADER_COLUMN_KEY = 'row-header-column-' + Math.random().toString(36).slice(2);
// const RESIZE_BUFFER_COLUMN_KEY = 'resize-buffer-column' + Math.random().toString(36).slice(2);

function buildHeaderRows<T>(keyMap: Map<Key, GridNode<T>>, columnNodes: GridNode<T>[]): GridNode<T>[] {
  let columns = [];
  let seen = new Map();
  for (let column of columnNodes) {
    let parentKey = column.parentKey;
    let col = [column];

    while (parentKey) {
      let parent: GridNode<T> = keyMap.get(parentKey);

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
            index: rowLength,
            value: null,
            rendered: null,
            level: i,
            hasChildNodes: false,
            childNodes: [],
            textValue: null
          };

          if (row.length > 0) {
            row[row.length - 1].nextKey = placeholder.key;
            placeholder.prevKey = row[row.length - 1].key;
          }

          row.push(placeholder);
        }

        if (row.length > 0) {
          row[row.length - 1].nextKey = item.key;
          item.prevKey = row[row.length - 1].key;
        }

        item.level = i;
        item.index = colIndex;
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
    if (rowLength < columnNodes.length) {
      let placeholder: GridNode<T> = {
        type: 'placeholder',
        key: 'placeholder-' + row[row.length - 1].key,
        colspan: columnNodes.length - rowLength,
        index: rowLength,
        value: null,
        rendered: null,
        level: i,
        hasChildNodes: false,
        childNodes: [],
        textValue: null,
        prevKey: row[row.length - 1].key
      };

      row.push(placeholder);
    }

    i++;
  }

  return headerRows.map((childNodes, index) => {
    let row: GridNode<T> = {
      type: 'headerrow',
      key: 'headerrow-' + index,
      index,
      value: null,
      rendered: null,
      level: 0,
      hasChildNodes: true,
      childNodes,
      textValue: null
    };

    return row;
  });
}

export class TableCollection<T> extends GridCollection<T> {
  headerRows: GridNode<T>[];
  columns: GridNode<T>[];
  rowHeaderColumnKeys: Set<Key>;
  body: GridNode<T>;

  constructor(nodes: Iterable<GridNode<T>>, prev?: TableCollection<T>, opts?: GridCollectionOptions) {
    let rowHeaderColumnKeys: Set<Key> = new Set();
    let body: GridNode<T>;
    let columns = [];

    // Add cell for selection checkboxes if needed.
    if (opts?.showSelectionCheckboxes) {
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
          isSelectionCell: true
        }
      };

      columns.unshift(rowHeaderColumn);
    }

    let rows = [];
    let columnKeyMap = new Map();
    let visit = (node: GridNode<T>) => {
      switch (node.type) {
        case 'body':
          body = node;
          break;
        case 'column':
          columnKeyMap.set(node.key, node);
          if (!node.hasChildNodes) {
            columns.push(node);

            if (node.props.isRowHeader) {
              rowHeaderColumnKeys.add(node.key);
            }
          }
          break;
        case 'item':
          rows.push(node);
          return; // do not go into childNodes
      }
      for (let child of node.childNodes) {
        visit(child);
      }
    };

    for (let node of nodes) {
      visit(node);
    }

    // if (Array.from(nodes).some(node => node.props?.allowsResizing)) {
    //   /*
    //   If the table content width > table width, a horizontal scroll bar is present.
    //   If a user tries to resize a column, making it smaller while they are scrolled to the
    //   end of the content horizontally, it shrinks the total table content width, causing
    //   things to snap around and breaks the resize behavior.

    //   To fix this, we add a resize buffer column (aka "spooky column") to the end of the table.
    //   The width of this column defaults to 0. If you try and shrink a column and the width of the
    //   table contents > table width, then the "spooky column" will grow to take up the difference
    //   so that the total table content width remains constant while you are resizing. Once you
    //   finish resizing, the "spooky column" snaps back to 0.
    //   */
    //   let resizeBufferColumn: GridNode<T> = {
    //     type: 'column',
    //     key: RESIZE_BUFFER_COLUMN_KEY,
    //     value: null,
    //     textValue: '',
    //     level: 0,
    //     index: columns.length,
    //     hasChildNodes: false,
    //     rendered: null,
    //     childNodes: [],
    //     props: {
    //       isResizeBuffer: true,
    //       defaultWidth: 0
    //     }
    //   };
    //   columns.push(resizeBufferColumn);
    // }

    let headerRows = buildHeaderRows(columnKeyMap, columns) as GridNode<T>[];
    headerRows.forEach((row, i) => rows.splice(i, 0, row));

    super({
      columnCount: columns.length,
      items: rows,
      visitNode: node => {
        node.column = columns[node.index];
        return node;
      }
    });
    this.columns = columns;
    this.rowHeaderColumnKeys = rowHeaderColumnKeys;
    this.body = body;
    this.headerRows = headerRows;

    // Default row header column to the first one.
    if (this.rowHeaderColumnKeys.size === 0) {
      this.rowHeaderColumnKeys.add(this.columns[opts?.showSelectionCheckboxes ? 1 : 0].key);
    }
  }

  *[Symbol.iterator]() {
    yield* this.body.childNodes;
  }

  get size() {
    return [...this.body.childNodes].length;
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
    return [...this.body.childNodes][0]?.key;
  }

  getLastKey() {
    let rows = [...this.body.childNodes];
    return rows[rows.length - 1]?.key;
  }

  getItem(key: Key) {
    return this.keyMap.get(key);
  }

  at(idx: number) {
    const keys = [...this.getKeys()];
    return this.getItem(keys[idx]);
  }
}
