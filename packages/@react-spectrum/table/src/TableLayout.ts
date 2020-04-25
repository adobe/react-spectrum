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

import {GridCollection, GridNode} from '@react-stately/grid';
import {Key} from 'react';
import {LayoutInfo, LayoutNode, ListLayout, Node, Point, Rect, Size} from '@react-stately/collections';
import {SpectrumColumnProps} from '@react-types/table';

export class TableLayout<T> extends ListLayout<T> {
  collection: GridCollection<T>;
  columnWidths: Map<Key, number>;

  buildCollection(): LayoutNode[] {
    this.columnWidths = this.buildColumnWidths();
    let header = this.buildHeader();
    let body = this.buildBody(0);
    this.contentSize = new Size(body.layoutInfo.rect.width, body.layoutInfo.rect.maxY);
    return [
      header,
      body
    ];
  }

  buildColumnWidths() {
    let columnWidths = new Map();

    // Pass 1: set widths for all explicitly defined columns.
    let remainingColumns = new Set<Node<T>>();
    let remainingSpace = this.collectionManager.visibleRect.width;
    for (let column of this.collection.columns) {
      let props = column.props as SpectrumColumnProps<T>;
      let width = props.width ?? props.defaultWidth;
      if (width != null) {
        let w = this.parseWidth(width);
        columnWidths.set(column.key, w);
        remainingSpace -= w;
      } else {
        remainingColumns.add(column);
      }
    }

    // Pass 2: if there are remaining columns, then distribute the remaining space evenly.
    if (remainingColumns.size > 0) {
      let columnWidth = remainingSpace / (this.collection.columns.length - columnWidths.size);

      for (let column of remainingColumns) {
        let props = column.props as SpectrumColumnProps<T>;
        let minWidth = props.minWidth != null ? this.parseWidth(props.minWidth) : 75;
        let maxWidth = props.maxWidth != null ? this.parseWidth(props.maxWidth) : Infinity;
        let width = Math.max(minWidth, Math.min(maxWidth, columnWidth));

        columnWidths.set(column.key, width);
        if (width !== columnWidth) {
          columnWidth = remainingSpace / (this.collection.columns.length - columnWidths.size);
        }
      }
    }

    return columnWidths;
  }

  parseWidth(width: number | string): number {
    if (typeof width === 'string') {
      let match = width.match(/^(\d+)%$/);
      if (!match) {
        throw new Error('Only percentages are supported as column widths');
      }

      return this.collectionManager.visibleRect.width * parseInt(match[1], 10);
    }

    return width;
  }

  buildHeader(): LayoutNode {
    let rect = new Rect(0, 0, 0, 0);
    let layoutInfo = new LayoutInfo('header', 'header', rect);
    
    let y = 0;
    let width = 0;
    let i = 0;
    let children: LayoutNode[] = [];
    for (let cells of this.collection.headerRows) {
      let rect = new Rect(0, y, 0, 0);
      let row = new LayoutInfo('headerrow', 'header-' + i++, rect);
      row.parentKey = layoutInfo.key;
      this.layoutInfos.set(row.key, row);

      let x = 0;
      let height = 0;
      let columns: LayoutNode[] = [];
      for (let cell of cells) {
        let layoutNode = this.buildChild(cell, x, y);
        layoutNode.layoutInfo.parentKey = row.key;
        x = layoutNode.layoutInfo.rect.maxX;
        height = Math.max(height, layoutNode.layoutInfo.rect.height);
        columns.push(layoutNode);
      }

      rect.height = height;
      rect.width = x;

      children.push({
        layoutInfo: row,
        children: columns
      });

      y += height;
      width = Math.max(width, x);
    }

    rect.width = width;
    rect.height = y;

    this.layoutInfos.set('header', layoutInfo);

    return {
      layoutInfo,
      children
    };
  }

  buildBody(y: number): LayoutNode {
    let rect = new Rect(0, y, 0, 0);
    let layoutInfo = new LayoutInfo('rowgroup', 'body', rect);
    
    let startY = y;
    let width = 0;
    let children: LayoutNode[] = [];
    for (let node of this.collection) {
      let layoutNode = this.buildChild(node, 0, y);
      layoutNode.layoutInfo.parentKey = 'body';
      y = layoutNode.layoutInfo.rect.maxY;
      width = Math.max(width, layoutNode.layoutInfo.rect.width);
      children.push(layoutNode);
    }

    rect.width = width;
    rect.height = y - startY;

    this.layoutInfos.set('body', layoutInfo);

    return {
      layoutInfo,
      children
    };
  }

  buildNode(node: GridNode<T>, x: number, y: number): LayoutNode {
    switch (node.type) {
      case 'item':
        return this.buildRow(node, x, y);
      case 'rowheader':
      case 'cell':
      case 'placeholder':
      case 'column':
        return this.buildCell(node, x, y);
      default:
        throw new Error('Unknown node type ' + node.type);
    }
  }

  buildRow(node: GridNode<T>, x: number, y: number): LayoutNode {
    let rect = new Rect(x, y, 0, 0);
    let layoutInfo = new LayoutInfo('row', node.key, rect);

    let children: LayoutNode[] = [];
    let height = 0;
    for (let child of node.childNodes) {
      let layoutNode = this.buildChild(child, x, y);
      x = layoutNode.layoutInfo.rect.maxX;
      height = Math.max(height, layoutNode.layoutInfo.rect.height);
      children.push(layoutNode);
    }

    rect.width = x;
    rect.height = height + 1; // +1 for bottom border

    return {
      layoutInfo,
      children
    };
  }

  buildCell(node: GridNode<T>, x: number, y: number): LayoutNode {
    let colspan = node.colspan ?? 1;
    let width = 0;
    for (let i = 0; i < colspan; i++) {
      let column = this.collection.columns[node.index + i];
      width += this.columnWidths.get(column.key);
    }

    let rect = new Rect(x, y, width, node.type === 'column' || node.type === 'placeholder' ? 34 : 50);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.isSticky = node.type === 'rowheader' || (node.type === 'column' && node.index === 0);
    layoutInfo.zIndex = layoutInfo.isSticky ? 2 : 1;

    return {
      layoutInfo
    };
  }

  getVisibleLayoutInfos(rect: Rect) {
    let res: LayoutInfo[] = [];

    for (let node of this.rootNodes) {
      res.push(node.layoutInfo);
      this.addVisibleLayoutInfos(res, node, rect);
    }

    return res;
  }

  addVisibleLayoutInfos(res: LayoutInfo[], node: LayoutNode, rect: Rect) {
    if (node.children.length === 0) {
      return;
    }

    switch (node.layoutInfo.type) {
      case 'header': {
        for (let child of node.children) {
          res.push(child.layoutInfo);
          this.addVisibleLayoutInfos(res, child, rect);
        }
        break;
      }
      case 'headerrow': {
        for (let child of node.children) {
          if (child.layoutInfo.isSticky) {
            res.push(child.layoutInfo);
          } else {
            break;
          }
        }

        for (let child of node.children) {
          if (child.layoutInfo.rect.x <= rect.x + rect.width && rect.x <= child.layoutInfo.rect.x + child.layoutInfo.rect.width) {
            res.push(child.layoutInfo);
          }
        }
        break;
      }
      case 'rowgroup': {
        let firstVisibleRow = this.binarySearch(node.children, rect.topLeft, 'y');
        let lastVisibleRow = this.binarySearch(node.children, rect.bottomRight, 'y');
        for (let i = firstVisibleRow; i <= lastVisibleRow; i++) {
          res.push(node.children[i].layoutInfo);
          this.addVisibleLayoutInfos(res, node.children[i], rect);
        }
        break;
      }
      case 'row': {
        for (let child of node.children) {
          if (child.layoutInfo.isSticky) {
            res.push(child.layoutInfo);
          } else {
            break;
          }
        }

        let firstVisibleCell = this.binarySearch(node.children, rect.topLeft, 'x');
        let lastVisibleCell = this.binarySearch(node.children, rect.topRight, 'x');
        for (let i = firstVisibleCell; i <= lastVisibleCell; i++) {
          res.push(node.children[i].layoutInfo);
        }
        break;
      }
      default:
        throw new Error('Unknown node type ' + node.layoutInfo.type);
    }
  }

  binarySearch(items: LayoutNode[], point: Point, axis: 'x' | 'y') {
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      let mid = (low + high) >> 1;
      let item = items[mid];

      if ((axis === 'x' && item.layoutInfo.rect.maxX < point.x) || (axis === 'y' && item.layoutInfo.rect.maxY < point.y)) {
        low = mid + 1;
      } else if ((axis === 'x' && item.layoutInfo.rect.x > point.x) || (axis === 'y' && item.layoutInfo.rect.y > point.y)) {
        high = mid - 1;
      } else {
        return mid;
      }
    }

    return Math.max(0, Math.min(items.length - 1, low));
  }
}
