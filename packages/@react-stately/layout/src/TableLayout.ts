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

import {
  calculateColumnSizes,
  getMaxWidth,
  getMinWidth,
  isStatic,
  parseFractionalUnit
} from './TableUtils';
import {GridNode} from '@react-types/grid';
import {Key} from 'react';
import {LayoutInfo, Point, Rect, Size} from '@react-stately/virtualizer';
import {LayoutNode, ListLayout, ListLayoutOptions} from './ListLayout';
import {TableCollection} from '@react-types/table';

type TableLayoutOptions<T> = ListLayoutOptions<T> & {
  columnLayout: TableColumnLayout<T>
}

interface TableColumnLayoutOptions {
  getDefaultWidth: (props) => string | number,
  getDefaultMinWidth: (props) => string | number
}

export class TableColumnLayout<T> {
  resizingColumn: Key | null;
  getDefaultWidth: (props) => string | number;
  getDefaultMinWidth: (props) => string | number;
  columnWidths: Map<Key, number> = new Map();
  resizerPositions: Map<Key, number> = new Map();

  constructor(options: TableColumnLayoutOptions) {
    this.getDefaultWidth = options.getDefaultWidth;
    this.getDefaultMinWidth = options.getDefaultMinWidth;
  }

  setResizingColumn(key: Key | null): void {
    this.resizingColumn = key;
  }

  getResizerPosition(): number {
    return this.resizerPositions.get(this.resizingColumn);
  }

  getColumnWidth(key: Key): number {
    return this.columnWidths.get(key) ?? 0;
  }

  // TODO: need to send a grid node in so we can use getDefaultMinWidth
  getColumnMinWidth(minWidth: number | string, tableWidth: number): number {
    return getMinWidth(minWidth ?? this.getDefaultMinWidth({}), tableWidth);
  }

  getColumnMaxWidth(maxWidth: number | string, tableWidth: number): number {
    return getMaxWidth(maxWidth, tableWidth);
  }

  resizeColumnWidth(tableWidth: number, collection: TableCollection<T>, controlledWidths: Map<Key, number | string>, uncontrolledWidths: Map<Key, number | string>, col = null, width: number) {
    let prevColumnWidths = this.columnWidths;
    // resizing a column
    let resizeIndex = Infinity;
    let controlledArray = Array.from(controlledWidths);
    let uncontrolledArray = Array.from(uncontrolledWidths);
    let combinedArray = controlledArray.concat(uncontrolledArray);
    let resizingChanged = new Map<Key, number | string>(combinedArray);
    let frKeys = new Map();
    let percentKeys = new Map();
    let frKeysToTheRight = new Map();
    let minWidths = new Map();
    // freeze columns to the left to their previous pixel value
    // at the same time count how many total FR's are in play and which of those FRs are
    // to the right or left of the resizing column
    collection.columns.forEach((column, i) => {
      let frKey;
      minWidths.set(column.key, this.getDefaultMinWidth(collection.columns[i].props));
      if (col !== column.key && !column.column.props.width && !isStatic(uncontrolledWidths.get(column.key))) {
        // uncontrolled don't have props.width for us, so instead get from our state
        frKey = column.key;
        frKeys.set(column.key, parseFractionalUnit(uncontrolledWidths.get(column.key) as string));
      } else if (col !== column.key && !isStatic(column.column.props.width) && !uncontrolledWidths.get(column.key)) {
        // controlledWidths will be the same in the collection
        frKey = column.key;
        frKeys.set(column.key, parseFractionalUnit(column.column.props.width));
      } else if (col !== column.key && column.column.props.width?.endsWith?.('%')) {
        percentKeys.set(column.key, column.column.props.width);
      }
      // don't freeze columns to the right of the resizing one
      if (resizeIndex < i) {
        if (frKey) {
          frKeysToTheRight.set(frKey, frKeys.get(frKey));
        }
        return;
      }
      // we already know the new size of the resizing column
      if (column.key === col) {
        resizeIndex = i;
        return;
      }
      // freeze column to previous value
      resizingChanged.set(column.key, prevColumnWidths.get(column.key));
    });
    resizingChanged.set(col, Math.floor(width));

    // predict pixels sizes for all columns based on resize
    let columnWidths = calculateColumnSizes(
      tableWidth,
      collection.columns.map(col => ({...col.column.props, key: col.key})),
      resizingChanged,
      (i) => this.getDefaultWidth(collection.columns[i].props),
      (i) => this.getDefaultMinWidth(collection.columns[i].props)
    );

    // set all new column widths for onResize event
    // columns going in will be the same order as the columns coming out
    let newWidths = new Map<Key, number | string>();
    // set all column widths based on calculateColumnSize
    columnWidths.forEach((width, index) => {
      let key = collection.columns[index].key;
      newWidths.set(key, width);
    });

    // add FR's back as they were to columns to the right
    Array.from(frKeys).forEach(([key]) => {
      if (frKeysToTheRight.has(key)) {
        newWidths.set(key, `${frKeysToTheRight.get(key)}fr`);
      }
    });

    // put back in percents
    Array.from(percentKeys).forEach(([key, width]) => {
      // resizing locks a column to a px width
      if (key === col) {
        return;
      }
      newWidths.set(key, width);
    });
    return newWidths;
  }

  buildColumnWidths(tableWidth: number, collection: TableCollection<T>, controlledWidths) {
    this.columnWidths = new Map();
    this.resizerPositions = new Map();

   // initial layout or table/window resizing
    let columnWidths = calculateColumnSizes(
      tableWidth,
      collection.columns.map(col => ({...col.column.props, key: col.key})),
      controlledWidths,
      (i) => this.getDefaultWidth(collection.columns[i].props),
      (i) => this.getDefaultMinWidth(collection.columns[i].props)
    );

    // columns going in will be the same order as the columns coming out
    let resizerPosition = 0;
    columnWidths.forEach((width, index) => {
      let key = collection.columns[index].key;
      this.columnWidths.set(key, width);
      resizerPosition += width;
      this.resizerPositions.set(key, resizerPosition);
    });
    return this.columnWidths;
  }
}

export class TableLayout<T> extends ListLayout<T> {
  collection: TableCollection<T>;
  lastCollection: TableCollection<T>;
  columnWidths: Map<Key, number> = new Map();
  stickyColumnIndices: number[];
  wasLoading = false;
  isLoading = false;
  lastPersistedKeys: Set<Key> = null;
  persistedIndices: Map<Key, number[]> = new Map();
  private disableSticky: boolean;
  columnLayout: TableColumnLayout<T>;
  controlledWidths: Map<Key, GridNode<T>>;
  uncontrolledWidths: Map<Key, GridNode<T>>;
  widths: Map<Key, number | string>;
  lastVirtualizerWidth: number;

  constructor(options: TableLayoutOptions<T>) {
    super(options);
    this.collection = options.initialCollection;
    this.stickyColumnIndices = [];
    this.disableSticky = this.checkChrome105();
    this.columnLayout = options.columnLayout;
    this.getSplitColumns();
    this.lastVirtualizerWidth = 0;
    this.widths = new Map(Array.from(this.uncontrolledWidths).map(([key, col]) =>
      [key, col.props.defaultWidth ?? this.columnLayout.getDefaultWidth?.(col.props)]
    ));
  }

  getColumnWidth(key: Key): number {
    return this.columnLayout.getColumnWidth(key) ?? 0;
  }

  getColumnMinWidth(key: Key): number {
    let column = this.collection.columns.find(col => col.key === key);
    if (!column) {
      return 0;
    }
    return this.columnLayout.getColumnMinWidth(column.props.minWidth, this.virtualizer.visibleRect.width);
  }

  getColumnMaxWidth(key: Key): number {
    let column = this.collection.columns.find(col => col.key === key);
    if (!column) {
      return 0;
    }
    return this.columnLayout.getColumnMaxWidth(column.props.minWidth, this.virtualizer.visibleRect.width);
  }

  // outside, where this is called, should call props.onColumnResizeStart...
  onColumnResizeStart(column: GridNode<T>): void {
    this.columnLayout.setResizingColumn(column.key);
  }

  // only way to call props.onColumnResize with the new size outside of Layout is to send the result back
  onColumnResize(column: GridNode<T>, width: number): Map<Key, number | string> {
    let newControlled = new Map(Array.from(this.controlledWidths).map(([key, entry]) => [key, entry.props.width]));
    let newSizes = this.columnLayout.resizeColumnWidth(this.virtualizer.visibleRect.width, this.collection, newControlled, this.widths, column.key, width);

    let map = new Map(Array.from(this.uncontrolledWidths).map(([key]) => [key, newSizes.get(key)]));
    map.set(column.key, width);
    this.widths = map;
    // relayoutNow still uses setState, should happen at the same time the parent
    // component's state is processed as a result of props.onColumnResize
    this.virtualizer.relayoutNow({sizeChanged: true});
    return newSizes;
  }

  onColumnResizeEnd(column: GridNode<T>): void {
    this.columnLayout.setResizingColumn(null);
  }

  getSplitColumns() {
    let [controlledWidths, uncontrolledWidths] = this.collection.columns.reduce((acc, col) => {
      if (col.props.width !== undefined) {
        acc[0].set(col.key, col);
      } else {
        acc[1].set(col.key, col);
      }
      return acc;
    }, [new Map(), new Map()]);
    this.controlledWidths = controlledWidths;
    this.uncontrolledWidths = uncontrolledWidths;
  }

  recombineColumns() {
    return new Map(this.collection.columns.map(col => {
      if (this.uncontrolledWidths.has(col.key)) {
        return [col.key, this.widths.get(col.key)];
      } else {
        return [col.key, this.controlledWidths.get(col.key).props.width];
      }
    }));
  }

  buildCollection(): LayoutNode[] {
    this.getSplitColumns();
    let cWidths = this.recombineColumns();
    // I think this runs every render cycle?
    // Which would mean that we'd be behind by one render since invalidate
    // will take a render to resolve.
    // If columns changed, clear layout cache.
    if (
      !this.lastCollection ||
      this.collection.columns.length !== this.lastCollection.columns.length ||
      this.collection.columns.some((c, i) =>
        c.key !== this.lastCollection.columns[i].key ||
        c.props.width !== this.lastCollection.columns[i].props.width ||
        c.props.minWidth !== this.lastCollection.columns[i].props.minWidth ||
        c.props.maxWidth !== this.lastCollection.columns[i].props.maxWidth
      ) ||
      this.virtualizer.visibleRect.width !== this.lastVirtualizerWidth
    ) {
      // Invalidate everything in this layout pass. Will be reset in ListLayout on the next pass.
      this.invalidateEverything = true;
    }
    this.lastVirtualizerWidth = this.virtualizer.visibleRect.width;

    // Track whether we were previously loading. This is used to adjust the animations of async loading vs inserts.
    let loadingState = this.collection.body.props.loadingState;
    this.wasLoading = this.isLoading;
    this.isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
    this.stickyColumnIndices = [];

    for (let column of this.collection.columns) {
      // The selection cell and any other sticky columns always need to be visible.
      // In addition, row headers need to be in the DOM for accessibility labeling.
      if (column.props.isSelectionCell || this.collection.rowHeaderColumnKeys.has(column.key)) {
        this.stickyColumnIndices.push(column.index);
      }
    }

    this.columnWidths = this.columnLayout.buildColumnWidths(this.virtualizer.visibleRect.width, this.collection, cWidths);

    let header = this.buildHeader();
    let body = this.buildBody(0);
    this.lastPersistedKeys = null;

    body.layoutInfo.rect.width = Math.max(header.layoutInfo.rect.width, body.layoutInfo.rect.width);
    this.contentSize = new Size(body.layoutInfo.rect.width, body.layoutInfo.rect.maxY);
    return [
      header,
      body
    ];
  }

  buildHeader(): LayoutNode {
    let rect = new Rect(0, 0, 0, 0);
    let layoutInfo = new LayoutInfo('header', 'header', rect);

    let y = 0;
    let width = 0;
    let children: LayoutNode[] = [];
    for (let headerRow of this.collection.headerRows) {
      let layoutNode = this.buildChild(headerRow, 0, y);
      layoutNode.layoutInfo.parentKey = 'header';
      y = layoutNode.layoutInfo.rect.maxY;
      width = Math.max(width, layoutNode.layoutInfo.rect.width);
      children.push(layoutNode);
    }

    rect.width = width;
    rect.height = y;

    this.layoutInfos.set('header', layoutInfo);

    return {
      layoutInfo,
      children
    };
  }

  buildHeaderRow(headerRow: GridNode<T>, x: number, y: number) {
    let rect = new Rect(0, y, 0, 0);
    let row = new LayoutInfo('headerrow', headerRow.key, rect);

    let height = 0;
    let columns: LayoutNode[] = [];
    for (let cell of headerRow.childNodes) {
      let layoutNode = this.buildChild(cell, x, y);
      layoutNode.layoutInfo.parentKey = row.key;
      x = layoutNode.layoutInfo.rect.maxX;
      height = Math.max(height, layoutNode.layoutInfo.rect.height);
      columns.push(layoutNode);
    }
    for (let [i, layout] of columns.entries()) {
      layout.layoutInfo.zIndex = columns.length - i + 1;
    }

    this.setChildHeights(columns, height);

    rect.height = height;
    rect.width = x;

    return {
      layoutInfo: row,
      children: columns
    };
  }

  setChildHeights(children: LayoutNode[], height: number) {
    for (let child of children) {
      if (child.layoutInfo.rect.height !== height) {
        // Need to copy the layout info before we mutate it.
        child.layoutInfo = child.layoutInfo.copy();
        this.layoutInfos.set(child.layoutInfo.key, child.layoutInfo);

        child.layoutInfo.rect.height = height;
      }
    }
  }

  // used to get the column widths when rendering to the DOM
  getRenderedColumnWidth(node: GridNode<T>) {
    let colspan = node.colspan ?? 1;
    let colIndex = node.colIndex ?? node.index;
    let width = 0;
    for (let i = colIndex; i < colIndex + colspan; i++) {
      let column = this.collection.columns[i];
      if (column?.key != null) {
        width += this.columnWidths.get(column.key);
      }
    }

    return width;
  }

  getEstimatedHeight(node: GridNode<T>, width: number, height: number, estimatedHeight: number) {
    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (height == null) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall collection view changed,
      // or the content of the item changed.
      let previousLayoutNode = this.layoutNodes.get(node.key);
      if (previousLayoutNode) {
        let curNode = this.collection.getItem(node.key);
        let lastNode = this.lastCollection ? this.lastCollection.getItem(node.key) : null;
        height = previousLayoutNode.layoutInfo.rect.height;
        isEstimated = curNode !== lastNode || width !== previousLayoutNode.layoutInfo.rect.width || previousLayoutNode.layoutInfo.estimatedSize;
      } else {
        height = estimatedHeight;
        isEstimated = true;
      }
    }

    return {height, isEstimated};
  }

  buildColumn(node: GridNode<T>, x: number, y: number): LayoutNode {
    let width = this.getRenderedColumnWidth(node);
    let {height, isEstimated} = this.getEstimatedHeight(node, width, this.headingHeight, this.estimatedHeadingHeight);
    let rect = new Rect(x, y, width, height);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.isSticky = !this.disableSticky && node.props?.isSelectionCell;
    layoutInfo.zIndex = layoutInfo.isSticky ? 2 : 1;
    layoutInfo.estimatedSize = isEstimated;

    return {
      layoutInfo
    };
  }

  buildBody(y: number): LayoutNode {
    let rect = new Rect(0, y, 0, 0);
    let layoutInfo = new LayoutInfo('rowgroup', 'body', rect);

    let startY = y;
    let width = 0;
    let children: LayoutNode[] = [];
    for (let node of this.collection.body.childNodes) {
      let layoutNode = this.buildChild(node, 0, y);
      layoutNode.layoutInfo.parentKey = 'body';
      y = layoutNode.layoutInfo.rect.maxY;
      width = Math.max(width, layoutNode.layoutInfo.rect.width);
      children.push(layoutNode);
    }

    if (this.isLoading) {
      // Add some margin around the loader to ensure that scrollbars don't flicker in and out.
      let rect = new Rect(40,  Math.max(y, 40), (width || this.virtualizer.visibleRect.width) - 80, children.length === 0 ? this.virtualizer.visibleRect.height - 80 : 60);
      let loader = new LayoutInfo('loader', 'loader', rect);
      loader.parentKey = 'body';
      loader.isSticky = !this.disableSticky && children.length === 0;
      this.layoutInfos.set('loader', loader);
      children.push({layoutInfo: loader});
      y = loader.rect.maxY;
      width = Math.max(width, rect.width);
    } else if (children.length === 0) {
      let rect = new Rect(40, Math.max(y, 40), this.virtualizer.visibleRect.width - 80, this.virtualizer.visibleRect.height - 80);
      let empty = new LayoutInfo('empty', 'empty', rect);
      empty.parentKey = 'body';
      empty.isSticky = !this.disableSticky;
      this.layoutInfos.set('empty', empty);
      children.push({layoutInfo: empty});
      y = empty.rect.maxY;
      width = Math.max(width, rect.width);
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
      case 'headerrow':
        return this.buildHeaderRow(node, x, y);
      case 'item':
        return this.buildRow(node, x, y);
      case 'column':
      case 'placeholder':
        return this.buildColumn(node, x, y);
      case 'cell':
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

    this.setChildHeights(children, height);

    rect.width = x;
    rect.height = height + 1; // +1 for bottom border

    return {
      layoutInfo,
      children
    };
  }

  buildCell(node: GridNode<T>, x: number, y: number): LayoutNode {
    let width = this.getRenderedColumnWidth(node);
    let {height, isEstimated} = this.getEstimatedHeight(node, width, this.rowHeight, this.estimatedRowHeight);
    let rect = new Rect(x, y, width, height);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);
    layoutInfo.isSticky = !this.disableSticky && node.props?.isSelectionCell;
    layoutInfo.zIndex = layoutInfo.isSticky ? 2 : 1;
    layoutInfo.estimatedSize = isEstimated;

    return {
      layoutInfo
    };
  }

  getVisibleLayoutInfos(rect: Rect) {
    let res: LayoutInfo[] = [];

    this.buildPersistedIndices();
    for (let node of this.rootNodes) {
      res.push(node.layoutInfo);
      this.addVisibleLayoutInfos(res, node, rect);
    }

    return res;
  }

  addVisibleLayoutInfos(res: LayoutInfo[], node: LayoutNode, rect: Rect) {
    if (!node.children || node.children.length === 0) {
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
      case 'rowgroup': {
        let firstVisibleRow = this.binarySearch(node.children, rect.topLeft, 'y');
        let lastVisibleRow = this.binarySearch(node.children, rect.bottomRight, 'y');

        // Add persisted rows before the visible rows.
        let persistedRowIndices = this.persistedIndices.get(node.layoutInfo.key);
        let persistIndex = 0;
        while (
          persistedRowIndices &&
          persistIndex < persistedRowIndices.length &&
          persistedRowIndices[persistIndex] < firstVisibleRow
        ) {
          let idx = persistedRowIndices[persistIndex];
          res.push(node.children[idx].layoutInfo);
          this.addVisibleLayoutInfos(res, node.children[idx], rect);
          persistIndex++;
        }

        for (let i = firstVisibleRow; i <= lastVisibleRow; i++) {
          // Skip persisted rows that overlap with visible cells.
          while (persistedRowIndices && persistIndex < persistedRowIndices.length && persistedRowIndices[persistIndex] < i) {
            persistIndex++;
          }

          res.push(node.children[i].layoutInfo);
          this.addVisibleLayoutInfos(res, node.children[i], rect);
        }

        // Add persisted rows after the visible rows.
        while (persistedRowIndices && persistIndex < persistedRowIndices.length) {
          let idx = persistedRowIndices[persistIndex++];
          res.push(node.children[idx].layoutInfo);
        }
        break;
      }
      case 'headerrow':
      case 'row': {
        let firstVisibleCell = this.binarySearch(node.children, rect.topLeft, 'x');
        let lastVisibleCell = this.binarySearch(node.children, rect.topRight, 'x');
        let stickyIndex = 0;

        // Add persisted/sticky cells before the visible cells.
        let persistedCellIndices = this.persistedIndices.get(node.layoutInfo.key) || this.stickyColumnIndices;
        while (stickyIndex < persistedCellIndices.length && persistedCellIndices[stickyIndex] < firstVisibleCell) {
          let idx = persistedCellIndices[stickyIndex];
          res.push(node.children[idx].layoutInfo);
          stickyIndex++;
        }

        for (let i = firstVisibleCell; i <= lastVisibleCell; i++) {
          // Skip sticky cells that overlap with visible cells.
          while (stickyIndex < persistedCellIndices.length && persistedCellIndices[stickyIndex] < i) {
            stickyIndex++;
          }

          res.push(node.children[i].layoutInfo);
        }

        // Add any remaining sticky cells after the visible cells.
        while (stickyIndex < persistedCellIndices.length) {
          let idx = persistedCellIndices[stickyIndex++];
          res.push(node.children[idx].layoutInfo);
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

  buildPersistedIndices() {
    if (this.virtualizer.persistedKeys === this.lastPersistedKeys) {
      return;
    }

    this.lastPersistedKeys = this.virtualizer.persistedKeys;
    this.persistedIndices.clear();

    // Build a map of parentKey => indices of children to persist.
    for (let key of this.virtualizer.persistedKeys) {
      let layoutInfo = this.layoutInfos.get(key);

      // Walk up ancestors so parents are also persisted if children are.
      while (layoutInfo && layoutInfo.parentKey) {
        let collectionNode = this.collection.getItem(layoutInfo.key);
        let indices = this.persistedIndices.get(layoutInfo.parentKey);
        if (!indices) {
          // stickyColumnIndices are always persisted along with any cells from persistedKeys.
          indices = collectionNode.type === 'cell' ? [...this.stickyColumnIndices] : [];
          this.persistedIndices.set(layoutInfo.parentKey, indices);
        }

        let index = collectionNode.index;
        if (layoutInfo.parentKey === 'body') {
          index -= this.collection.headerRows.length;
        }

        if (!indices.includes(index)) {
          indices.push(index);
        }

        layoutInfo = this.layoutInfos.get(layoutInfo.parentKey);
      }
    }

    for (let indices of this.persistedIndices.values()) {
      indices.sort((a, b) => a - b);
    }
  }

  getInitialLayoutInfo(layoutInfo: LayoutInfo) {
    let res = super.getInitialLayoutInfo(layoutInfo);

    // If this insert was the result of async loading, remove the zoom effect and just keep the fade in.
    if (this.wasLoading) {
      res.transform = null;
    }

    return res;
  }

  // Checks if Chrome version is 105 or greater
  private checkChrome105() {
    if (typeof window === 'undefined' || window.navigator == null) {
      return false;
    }

    let isChrome105;
    if (window.navigator['userAgentData']) {
      isChrome105 = window.navigator['userAgentData']?.brands.some(b => b.brand === 'Chromium' && Number(b.version) === 105);
    } else {
      let regex = /Chrome\/(\d+)/;
      let matches = regex.exec(window.navigator.userAgent);
      isChrome105 = matches && matches.length >= 2 && Number(matches[1]) === 105;
    }

    return isChrome105;
  }
}
