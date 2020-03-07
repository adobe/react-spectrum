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
  indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number
};

// A wrapper around LayoutInfo that supports heirarchy
interface LayoutNode {
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
  private rowHeight: number;
  private estimatedRowHeight: number;
  private headingHeight: number;
  private estimatedHeadingHeight: number;
  private indentationForItem?: (collection: Collection<Node<T>>, key: Key) => number;
  private layoutInfos: {[key: string]: LayoutInfo};
  private contentHeight: number;
  private lastCollection: Collection<Node<T>>;
  private rootNodes: LayoutNode[];

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
    this.indentationForItem = options.indentationForItem;
    this.layoutInfos = {};
    this.rootNodes = [];
    this.lastCollection = null;
    this.contentHeight = 0;
  }

  getLayoutInfo(type: string, key: Key) {
    return this.layoutInfos[key];
  }

  getVisibleLayoutInfos(rect: Rect) {
    let res: LayoutInfo[] = [];

    let addNodes = (nodes: LayoutNode[]) => {
      for (let node of nodes) {
        if (node.layoutInfo.rect.intersects(rect)) {
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

  validate(invalidationContext: InvalidationContext<any, any>) {
    let previousLayoutInfos = this.layoutInfos;
    this.layoutInfos = {};

    let build = (nodes: Iterable<Node<T>>, y = 0): [number, LayoutNode[]] => {
      let startY = y;
      let layoutNodes: LayoutNode[] = [];
      for (let node of nodes) {
        let rectHeight = node.type === 'item' ? this.rowHeight : this.headingHeight;
        let isEstimated = false;

        // If no explicit height is available, use an estimated height.
        if (rectHeight == null) {
          // If a previous version of this layout info exists, reuse its height.
          // Mark as estimated if the size of the overall collection view changed,
          // or the content of the item changed.
          let previousLayoutInfo = previousLayoutInfos[node.type === 'item' ? node.key : node.key + ':header'];
          if (previousLayoutInfo) {
            let lastNode = this.lastCollection ? this.lastCollection.getItem(node.key) : null;
            rectHeight = previousLayoutInfo.rect.height;
            isEstimated = invalidationContext.sizeChanged || node !== lastNode || previousLayoutInfo.estimatedSize;
          } else {
            rectHeight = node.type === 'item' ? this.estimatedRowHeight : this.estimatedHeadingHeight;
            isEstimated = true;
          }
        }

        if (rectHeight == null) {
          rectHeight = DEFAULT_HEIGHT;
        }

        let layoutInfo: LayoutInfo;
        if (node.type === 'section') {
          let headerRect = new Rect(0, y, this.collectionManager.visibleRect.width, rectHeight);
          let header = new LayoutInfo('header', node.key + ':header', headerRect);
          header.estimatedSize = isEstimated;
          header.parentKey = node.key;
          this.layoutInfos[header.key] = header;
          y += header.rect.height;

          let rect = new Rect(0, y, this.collectionManager.visibleRect.width, 0);
          layoutInfo = new LayoutInfo(node.type, node.key, rect);
          let [height, children] = build(node.childNodes, y);
          rect.height = height;

          layoutNodes.push({
            header,
            layoutInfo,
            children
          });
        } else {
          let x = 0;
          if (typeof this.indentationForItem === 'function') {
            x = this.indentationForItem(this.collectionManager.collection, node.key) || 0;
          }
    
          let rect = new Rect(x, y, this.collectionManager.visibleRect.width - x, rectHeight);
          layoutInfo = new LayoutInfo(node.type, node.key, rect);
          layoutInfo.estimatedSize = isEstimated;
          layoutNodes.push({
            layoutInfo
          });
        }

        layoutInfo.parentKey = node.parentKey || null;
        this.layoutInfos[node.key] = layoutInfo;

        y += layoutInfo.rect.height;
      }

      return [y - startY, layoutNodes];
    };

    let [height, nodes] = build(this.collectionManager.collection);
    this.contentHeight = height;
    this.rootNodes = nodes;

    this.lastCollection = this.collectionManager.collection;
  }

  updateItemSize(key: Key, size: Size) {
    let layoutInfo = this.layoutInfos[key];
    layoutInfo.estimatedSize = false;
    if (layoutInfo.rect.height !== size.height) {
      layoutInfo.rect.height = size.height;
      return true;
    }

    return false;
  }

  getContentSize() {
    return new Size(this.collectionManager.visibleRect.width, this.contentHeight);
  }

  getKeyAbove(key: Key) {
    let collection = this.collectionManager.collection;

    key = collection.getKeyBefore(key);
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }
  }

  getKeyBelow(key: Key) {
    let collection = this.collectionManager.collection;

    key = collection.getKeyAfter(key);
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getKeyPageAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo('item', key);
    let pageY = Math.max(0, layoutInfo.rect.y + layoutInfo.rect.height - this.collectionManager.visibleRect.height);
    while (layoutInfo && layoutInfo.rect.y > pageY && layoutInfo) {
      let keyAbove = this.getKeyAbove(layoutInfo.key);
      layoutInfo = this.getLayoutInfo('item', keyAbove);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo('item', key);
    let pageY = Math.min(this.collectionManager.contentSize.height, layoutInfo.rect.y - layoutInfo.rect.height + this.collectionManager.visibleRect.height);
    while (layoutInfo && layoutInfo.rect.y < pageY) {
      let keyBelow = this.getKeyBelow(layoutInfo.key);
      layoutInfo = this.getLayoutInfo('item', keyBelow);
    }

    if (layoutInfo) {
      return layoutInfo.key;
    }

    return this.getLastKey();
  }

  getFirstKey() {
    let collection = this.collectionManager.collection;
    let key = collection.getFirstKey();
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }
  }

  getLastKey() {
    let collection = this.collectionManager.collection;
    let key = collection.getLastKey();
    while (key) {
      let item = collection.getItem(key);
      if (item.type === 'item' && !item.isDisabled) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }
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
