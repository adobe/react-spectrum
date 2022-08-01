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

import {Collection, KeyboardDelegate, Node} from '@react-types/shared';
import {InvalidationContext, Layout, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key} from 'react';
// import { DragTarget, DropTarget, DropPosition } from '@react-types/shared';

export type ListLayoutOptions<T> = {
  /** The height of a row in px. */
  rowHeight?: number,
  estimatedRowHeight?: number,
  headingHeight?: number,
  estimatedHeadingHeight?: number,
  padding?: number,
  indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number,
  collator?: Intl.Collator,
  loaderHeight?: number,
  placeholderHeight?: number,
  allowDisabledKeyFocus?: boolean
};

// A wrapper around LayoutInfo that supports hierarchy
export interface LayoutNode {
  node?: Node<unknown>,
  layoutInfo: LayoutInfo,
  header?: LayoutInfo,
  children?: LayoutNode[]
}

const DEFAULT_HEIGHT = 48;

/**
 * The ListLayout class is an implementation of a collection view {@link Layout}
 * it is used for creating lists and lists with indented sub-lists.
 *
 * To configure a ListLayout, you can use the properties to define the
 * layouts and/or use the method for defining indentation.
 * The {@link ListKeyboardDelegate} extends the existing collection view
 * delegate with an additional method to do this (it uses the same delegate object as
 * the collection view itself).
 */
export class ListLayout<T> extends Layout<Node<T>> implements KeyboardDelegate {
  protected rowHeight: number;
  protected estimatedRowHeight: number;
  protected headingHeight: number;
  protected estimatedHeadingHeight: number;
  protected padding: number;
  protected indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number;
  protected layoutInfos: Map<Key, LayoutInfo>;
  protected layoutNodes: Map<Key, LayoutNode>;
  protected contentSize: Size;
  collection: Collection<Node<T>>;
  disabledKeys: Set<Key> = new Set();
  allowDisabledKeyFocus: boolean = false;
  isLoading: boolean;
  protected lastWidth: number;
  protected lastCollection: Collection<Node<T>>;
  protected rootNodes: LayoutNode[];
  protected collator: Intl.Collator;
  protected invalidateEverything: boolean;
  protected loaderHeight: number;
  protected placeholderHeight: number;

  /**
   * Creates a new ListLayout with options. See the list of properties below for a description
   * of the options that can be provided.
   */
  constructor(options: ListLayoutOptions<T> = {}) {
    super();
    this.rowHeight = options.rowHeight;
    this.estimatedRowHeight = options.estimatedRowHeight;
    this.headingHeight = options.headingHeight;
    this.estimatedHeadingHeight = options.estimatedHeadingHeight;
    this.padding = options.padding || 0;
    this.indentationForItem = options.indentationForItem;
    this.collator = options.collator;
    this.loaderHeight = options.loaderHeight;
    this.placeholderHeight = options.placeholderHeight;
    this.layoutInfos = new Map();
    this.layoutNodes = new Map();
    this.rootNodes = [];
    this.lastWidth = 0;
    this.lastCollection = null;
    this.allowDisabledKeyFocus = options.allowDisabledKeyFocus;
  }

  getLayoutInfo(key: Key) {
    return this.layoutInfos.get(key);
  }

  getVisibleLayoutInfos(rect: Rect) {
    let res: LayoutInfo[] = [];

    let addNodes = (nodes: LayoutNode[]) => {
      for (let node of nodes) {
        if (this.isVisible(node, rect)) {
          res.push(node.layoutInfo);
          if (node.header) {
            res.push(node.header);
          }

          if (node.children) {
            addNodes(node.children);
          }
        }
      }
    };

    addNodes(this.rootNodes);
    return res;
  }

  isVisible(node: LayoutNode, rect: Rect) {
    return node.layoutInfo.rect.intersects(rect) || node.layoutInfo.isSticky;
  }

  validate(invalidationContext: InvalidationContext<Node<T>, unknown>) {
    // Invalidate cache if the size of the collection changed.
    // In this case, we need to recalculate the entire layout.
    this.invalidateEverything = invalidationContext.sizeChanged;

    this.collection = this.virtualizer.collection;
    this.rootNodes = this.buildCollection();

    // Remove deleted layout nodes
    if (this.lastCollection) {
      for (let key of this.lastCollection.getKeys()) {
        if (!this.collection.getItem(key)) {
          let layoutNode = this.layoutNodes.get(key);
          if (layoutNode) {
            this.layoutInfos.delete(layoutNode.layoutInfo.key);
            this.layoutInfos.delete(layoutNode.header?.key);
            this.layoutNodes.delete(key);
          }
        }
      }
    }

    this.lastWidth = this.virtualizer.visibleRect.width;
    this.lastCollection = this.collection;
  }

  buildCollection(): LayoutNode[] {
    let y = this.padding;
    let nodes = [];
    for (let node of this.collection) {
      let layoutNode = this.buildChild(node, 0, y);
      y = layoutNode.layoutInfo.rect.maxY;
      nodes.push(layoutNode);
    }

    if (this.isLoading) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width,
        this.loaderHeight ?? this.virtualizer.visibleRect.height);
      let loader = new LayoutInfo('loader', 'loader', rect);
      this.layoutInfos.set('loader', loader);
      nodes.push({layoutInfo: loader});
      y = loader.rect.maxY;
    }

    if (nodes.length === 0) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width,
        this.placeholderHeight ?? this.virtualizer.visibleRect.height);
      let placeholder = new LayoutInfo('placeholder', 'placeholder', rect);
      this.layoutInfos.set('placeholder', placeholder);
      nodes.push({layoutInfo: placeholder});
      y = placeholder.rect.maxY;
    }

    this.contentSize = new Size(this.virtualizer.visibleRect.width, y + this.padding);
    return nodes;
  }

  buildChild(node: Node<T>, x: number, y: number): LayoutNode {
    let cached = this.layoutNodes.get(node.key);
    if (!this.invalidateEverything && cached && cached.node === node && y === (cached.header || cached.layoutInfo).rect.y) {
      return cached;
    }

    let layoutNode = this.buildNode(node, x, y);
    layoutNode.node = node;

    layoutNode.layoutInfo.parentKey = node.parentKey ?? null;
    this.layoutInfos.set(layoutNode.layoutInfo.key, layoutNode.layoutInfo);
    if (layoutNode.header) {
      this.layoutInfos.set(layoutNode.header.key, layoutNode.header);
    }

    this.layoutNodes.set(node.key, layoutNode);
    return layoutNode;
  }

  buildNode(node: Node<T>, x: number, y: number): LayoutNode {
    switch (node.type) {
      case 'section':
        return this.buildSection(node, x, y);
      case 'item':
        return this.buildItem(node, x, y);
    }
  }

  buildSection(node: Node<T>, x: number, y: number): LayoutNode {
    let width = this.virtualizer.visibleRect.width;
    let rectHeight = this.headingHeight;
    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (rectHeight == null) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall collection view changed,
      // or the content of the item changed.
      let previousLayoutNode = this.layoutNodes.get(node.key);
      if (previousLayoutNode && previousLayoutNode.header) {
        let curNode = this.collection.getItem(node.key);
        let lastNode = this.lastCollection ? this.lastCollection.getItem(node.key) : null;
        rectHeight = previousLayoutNode.header.rect.height;
        isEstimated = width !== this.lastWidth || curNode !== lastNode || previousLayoutNode.header.estimatedSize;
      } else {
        rectHeight = (node.rendered ? this.estimatedHeadingHeight : 0);
        isEstimated = true;
      }
    }

    if (rectHeight == null) {
      rectHeight = DEFAULT_HEIGHT;
    }

    let headerRect = new Rect(0, y, width, rectHeight);
    let header = new LayoutInfo('header', node.key + ':header', headerRect);
    header.estimatedSize = isEstimated;
    header.parentKey = node.key;
    y += header.rect.height;

    let rect = new Rect(0, y, width, 0);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);

    let startY = y;
    let children = [];
    for (let child of node.childNodes) {
      let layoutNode = this.buildChild(child, x, y);
      y = layoutNode.layoutInfo.rect.maxY;
      children.push(layoutNode);
    }

    rect.height = y - startY;

    return {
      header,
      layoutInfo,
      children
    };
  }

  buildItem(node: Node<T>, x: number, y: number): LayoutNode {
    let width = this.virtualizer.visibleRect.width;
    let rectHeight = this.rowHeight;
    let isEstimated = false;

    // If no explicit height is available, use an estimated height.
    if (rectHeight == null) {
      // If a previous version of this layout info exists, reuse its height.
      // Mark as estimated if the size of the overall collection view changed,
      // or the content of the item changed.
      let previousLayoutNode = this.layoutNodes.get(node.key);
      if (previousLayoutNode) {
        let curNode = this.collection.getItem(node.key);
        let lastNode = this.lastCollection ? this.lastCollection.getItem(node.key) : null;
        rectHeight = previousLayoutNode.layoutInfo.rect.height;
        isEstimated = width !== this.lastWidth || curNode !== lastNode || previousLayoutNode.layoutInfo.estimatedSize;
      } else {
        rectHeight = this.estimatedRowHeight;
        isEstimated = true;
      }
    }

    if (rectHeight == null) {
      rectHeight = DEFAULT_HEIGHT;
    }

    if (typeof this.indentationForItem === 'function') {
      x += this.indentationForItem(this.collection, node.key) || 0;
    }

    let rect = new Rect(x, y, width - x, rectHeight);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);
    // allow overflow so the focus ring/selection ring can extend outside to overlap with the adjacent items borders
    layoutInfo.allowOverflow = true;
    layoutInfo.estimatedSize = isEstimated;
    return {
      layoutInfo
    };
  }

  updateItemSize(key: Key, size: Size) {
    let layoutInfo = this.layoutInfos.get(key);
    // If no layoutInfo, item has been deleted/removed.
    if (!layoutInfo) {
      return false;
    }

    layoutInfo.estimatedSize = false;
    if (layoutInfo.rect.height !== size.height) {
      // Copy layout info rather than mutating so that later caches are invalidated.
      let newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect.height = size.height;
      this.layoutInfos.set(key, newLayoutInfo);

      // Invalidate layout for this layout node and all parents
      this.updateLayoutNode(key, layoutInfo, newLayoutInfo);

      let node = this.collection.getItem(layoutInfo.parentKey);
      while (node) {
        this.updateLayoutNode(node.key, layoutInfo, newLayoutInfo);
        node = this.collection.getItem(node.parentKey);
      }

      return true;
    }

    return false;
  }

  updateLayoutNode(key: Key, oldLayoutInfo: LayoutInfo, newLayoutInfo: LayoutInfo) {
    let n = this.layoutNodes.get(key);
    if (n) {
      // Invalidate by clearing node.
      n.node = null;

      // Replace layout info in LayoutNode
      if (n.header === oldLayoutInfo) {
        n.header = newLayoutInfo;
      } else if (n.layoutInfo === oldLayoutInfo) {
        n.layoutInfo = newLayoutInfo;
      }
    }
  }

  getContentSize() {
    return this.contentSize;
  }

  getKeyAbove(key: Key) {
    let collection = this.collection;

    key = collection.getKeyBefore(key);
    while (key != null) {
      let item = collection.getItem(key);
      if (item.type === 'item' && (this.allowDisabledKeyFocus || !this.disabledKeys.has(item.key))) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }
  }

  getKeyBelow(key: Key) {
    let collection = this.collection;

    key = collection.getKeyAfter(key);
    while (key != null) {
      let item = collection.getItem(key);
      if (item.type === 'item' && (this.allowDisabledKeyFocus || !this.disabledKeys.has(item.key))) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getKeyLeftOf(key: Key): Key {
    return key;
  }

  getKeyRightOf(key: Key): Key {
    return key;
  }

  getKeyPageAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);

    if (layoutInfo) {
      let pageY = Math.max(0, layoutInfo.rect.y + layoutInfo.rect.height - this.virtualizer.visibleRect.height);
      while (layoutInfo && layoutInfo.rect.y > pageY) {
        let keyAbove = this.getKeyAbove(layoutInfo.key);
        layoutInfo = this.getLayoutInfo(keyAbove);
      }

      if (layoutInfo) {
        return layoutInfo.key;
      }
    }

    return this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo(key != null ? key : this.getFirstKey());

    if (layoutInfo) {
      let pageY = Math.min(this.virtualizer.contentSize.height, layoutInfo.rect.y - layoutInfo.rect.height + this.virtualizer.visibleRect.height);
      while (layoutInfo && layoutInfo.rect.y < pageY) {
        let keyBelow = this.getKeyBelow(layoutInfo.key);
        layoutInfo = this.getLayoutInfo(keyBelow);
      }

      if (layoutInfo) {
        return layoutInfo.key;
      }
    }

    return this.getLastKey();
  }

  getFirstKey() {
    let collection = this.collection;
    let key = collection.getFirstKey();
    while (key != null) {
      let item = collection.getItem(key);
      if (item.type === 'item' && (this.allowDisabledKeyFocus || !this.disabledKeys.has(item.key))) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getLastKey() {
    let collection = this.collection;
    let key = collection.getLastKey();
    while (key != null) {
      let item = collection.getItem(key);
      if (item.type === 'item' && (this.allowDisabledKeyFocus || !this.disabledKeys.has(item.key))) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey || this.getFirstKey();
    while (key != null) {
      let item = collection.getItem(key);
      let substring = item.textValue.slice(0, search.length);
      if (item.textValue && this.collator.compare(substring, search) === 0) {
        return key;
      }

      key = this.getKeyBelow(key);
    }

    return null;
  }

  // getDragTarget(point: Point): DragTarget {
  //   let visible = this.getVisibleLayoutInfos(new Rect(point.x, point.y, 1, 1));
  //   if (visible.length > 0) {
  //     visible = visible.sort((a, b) => b.zIndex - a.zIndex);
  //     return {
  //       type: 'item',
  //       key: visible[0].key
  //     };
  //   }

  //   return null;
  // }

  // getDropTarget(point: Point): DropTarget {
  //   let key = this.virtualizer.keyAtPoint(point);
  //   if (key) {
  //     return {
  //       type: 'item',
  //       key,
  //       dropPosition: DropPosition.ON
  //     };
  //   }

  //   return null;
  // }

  getInitialLayoutInfo(layoutInfo: LayoutInfo) {
    layoutInfo.opacity = 0;
    layoutInfo.transform = 'scale3d(0.8, 0.8, 0.8)';
    return layoutInfo;
  }

  getFinalLayoutInfo(layoutInfo: LayoutInfo) {
    layoutInfo.opacity = 0;
    layoutInfo.transform = 'scale3d(0.8, 0.8, 0.8)';
    return layoutInfo;
  }
}
