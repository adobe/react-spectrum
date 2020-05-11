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

import {Collection, InvalidationContext, Node} from './types';
import {Key} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
// import {Point} from './Point';
import {Rect} from './Rect';
import {Size} from './Size';
// import { DragTarget, DropTarget, DropPosition } from '@react-types/shared';

type ListLayoutOptions<T> = {
  /** the height of a row in px. */
  rowHeight?: number,
  estimatedRowHeight?: number,
  headingHeight?: number,
  estimatedHeadingHeight?: number,
  padding?: number,
  indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number,
  collator?: Intl.Collator
};

// A wrapper around LayoutInfo that supports heirarchy
export interface LayoutNode {
  layoutInfo: LayoutInfo,
  header?: LayoutInfo,
  children?: LayoutNode[]
}

const DEFAULT_HEIGHT = 48;

/**
 * The ListLayout class is an implementation of a collection view {@link Layout}
 * it is used for creating lists and lists with indented sub-lists
 *
 * To configure a ListLayout, you can use the properties to define the
 * layouts and/or use the method for defining indentation.
 * The {@link ListLayoutDelegate} extends the existing collection view
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
  private layoutNodes: Map<Key, LayoutNode>;
  protected contentSize: Size;
  collection: Collection<Node<T>>;
  disabledKeys: Set<Key> = new Set();
  protected lastWidth: number;
  protected lastCollection: Collection<Node<T>>;
  protected rootNodes: LayoutNode[];
  private collator: Intl.Collator;
  private cache: WeakMap<Node<T>, LayoutNode> = new WeakMap();

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
    this.layoutInfos = new Map();
    this.layoutNodes = new Map();
    this.rootNodes = [];
    this.lastWidth = 0;
    this.lastCollection = null;
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

  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean {
    // We only care if the width changes.
    return newRect.width !== oldRect.width;
  }

  validate(invalidationContext: InvalidationContext<Node<T>, unknown>) {
    // Invalidate cache if the size of the collection changed.
    // In this case, we need to recalculate the entire layout.
    if (invalidationContext.sizeChanged) {
      this.cache = new WeakMap();
    }

    this.rootNodes = this.buildCollection();

    this.lastWidth = this.collectionManager.visibleRect.width;
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

    this.contentSize = new Size(this.collectionManager.visibleRect.width, y + this.padding);
    return nodes;
  }

  buildChild(node: Node<T>, x: number, y: number): LayoutNode {
    let cached = this.cache.get(node);
    if (cached && y === (cached.header || cached.layoutInfo).rect.y) {
      return cached;
    }

    let layoutNode = this.buildNode(node, x, y);

    layoutNode.layoutInfo.parentKey = node.parentKey || null;
    this.layoutInfos.set(layoutNode.layoutInfo.key, layoutNode.layoutInfo);
    if (layoutNode.header) {
      this.layoutInfos.set(layoutNode.header.key, layoutNode.header);
    }

    // Remove deleted child layout nodes from key mapping.
    let prev = this.layoutNodes.get(node.key);
    if (prev) {
      let childKeys = new Set();
      if (layoutNode.children) {
        for (let child of layoutNode.children) {
          childKeys.add(child.layoutInfo.key);
        }
      }

      if (prev.children) {
        for (let child of prev.children) {
          if (!childKeys.has(child.layoutInfo.key)) {
            this.removeLayoutNode(child);
          }
        }
      }
    }

    this.layoutNodes.set(node.key, layoutNode);
    this.cache.set(node, layoutNode);
    return layoutNode;
  }

  removeLayoutNode(layoutNode: LayoutNode) {
    this.layoutNodes.delete(layoutNode.layoutInfo.key);

    this.layoutInfos.delete(layoutNode.layoutInfo.key);
    if (layoutNode.header) {
      this.layoutInfos.delete(layoutNode.header.key);
    }

    if (layoutNode.children) {
      for (let child of layoutNode.children) {
        if (this.layoutNodes.get(child.layoutInfo.key) === child) {
          this.removeLayoutNode(child);
        }
      }
    }
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
    let width = this.collectionManager.visibleRect.width;
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
    let width = this.collectionManager.visibleRect.width;
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
    layoutInfo.estimatedSize = isEstimated;
    return {
      layoutInfo
    };
  }

  updateItemSize(key: Key, size: Size) {
    let layoutInfo = this.layoutInfos.get(key);
    layoutInfo.estimatedSize = false;
    if (layoutInfo.rect.height !== size.height) {
      layoutInfo.rect.height = size.height;

      // Invalidate layout for this layout node and all parents
      this.cache.delete(this.collection.getItem(key));

      let node = this.collection.getItem(layoutInfo.parentKey);
      while (node) {
        this.cache.delete(this.collection.getItem(node.key));
        node = this.collection.getItem(node.parentKey);
      }

      return true;
    }

    return false;
  }

  getContentSize() {
    return this.contentSize;
  }

  getKeyAbove(key: Key) {
    let collection = this.collection;

    key = collection.getKeyBefore(key);
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }
  }

  getKeyBelow(key: Key) {
    let collection = this.collection;

    key = collection.getKeyAfter(key);
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getKeyPageAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);
    let pageY = Math.max(0, layoutInfo.rect.y + layoutInfo.rect.height - this.collectionManager.visibleRect.height);
    while (layoutInfo && layoutInfo.rect.y > pageY && layoutInfo) {
      let keyAbove = this.getKeyAbove(layoutInfo.key);
      layoutInfo = this.getLayoutInfo(keyAbove);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);
    let pageY = Math.min(this.collectionManager.contentSize.height, layoutInfo.rect.y - layoutInfo.rect.height + this.collectionManager.visibleRect.height);
    while (layoutInfo && layoutInfo.rect.y < pageY) {
      let keyBelow = this.getKeyBelow(layoutInfo.key);
      layoutInfo = this.getLayoutInfo(keyBelow);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getLastKey();
  }

  getFirstKey() {
    let collection = this.collection;
    let key = collection.getFirstKey();
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getLastKey() {
    let collection = this.collection;
    let key = collection.getLastKey();
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !this.disabledKeys.has(item.key)) {
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
    let key = fromKey ? this.getKeyBelow(fromKey) : this.getFirstKey();
    while (key) {
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
  //   let key = this.collectionManager.keyAtPoint(point);
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
