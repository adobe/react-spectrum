/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Direction, KeyboardDelegate, Node} from '@react-types/shared';
import {GridCollection} from '@react-stately/grid';
import {InvalidationContext, Layout, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key} from 'react';
import {Scale} from '@react-types/provider';

export interface BaseLayoutOptions {
  collator?: Intl.Collator,
  // TODO: is this valid or is scale a spectrum specific thing that should be left out of the layouts?
  scale?: Scale,
  /**
   * The margin around the grid view between the edges and the items.
   * @default 24
   */
  margin?: number
}

export class BaseLayout<T> extends Layout<Node<T>> implements KeyboardDelegate {
  protected contentSize: Size;
  protected layoutInfos: Map<Key, LayoutInfo>;
  protected collator: Intl.Collator;
  protected lastCollection: GridCollection<T>;
  collection:  GridCollection<T>;
  isLoading: boolean;
  disabledKeys: Set<Key> = new Set();
  direction: Direction;
  scale: Scale;
  margin: number;

  constructor(options: BaseLayoutOptions = {}) {
    super();
    this.layoutInfos = new Map();
    this.collator = options.collator;
    this.lastCollection = null;
    this.scale = options.scale || 'medium';
    this.margin = options.margin || 24;
  }

  validate(invalidationContext: InvalidationContext<Node<T>, unknown>) {
    this.collection = this.virtualizer.collection as GridCollection<T>;
    this.buildCollection(invalidationContext);

    // Remove layout info that doesn't exist in new collection
    if (this.lastCollection) {
      for (let key of this.lastCollection.getKeys()) {
        if (!this.collection.getItem(key)) {
          this.layoutInfos.delete(key);
        }
      }

      if (!this.isLoading) {
        this.layoutInfos.delete('loader');
      }

      if (this.collection.size > 0) {
        this.layoutInfos.delete('placeholder');
      }
    }

    this.lastCollection = this.collection;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildCollection(invalidationContext?: InvalidationContext<Node<T>, unknown>) {}

  getContentSize() {
    return this.contentSize;
  }

  getLayoutInfo(key: Key) {
    return this.layoutInfos.get(key);
  }

  getVisibleLayoutInfos(rect) {
    let res: LayoutInfo[] = [];

    for (let layoutInfo of this.layoutInfos.values()) {
      if (this.isVisible(layoutInfo, rect)) {
        res.push(layoutInfo);
      }
    }

    return res;
  }

  isVisible(layoutInfo: LayoutInfo, rect: Rect) {
    return layoutInfo.rect.intersects(rect);
  }

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

  _findClosestLayoutInfo(target: Rect, rect: Rect) {
    let layoutInfos = this.getVisibleLayoutInfos(rect);
    let best = null;
    let bestDistance = Infinity;

    // Calculates distance as the distance between the center of 2 rects.
    for (let cur of layoutInfos) {
      if (cur.type === 'item') {
        let curRect = cur.rect;
        let targetMidX = (target.x + target.maxX) / 2;
        let targetMidY = (target.y + target.maxY) / 2;
        let curMidX = (curRect.x + curRect.maxX) / 2;
        let curMidY = (curRect.y + curRect.maxY) / 2;
        let dist = Math.pow(targetMidX - curMidX, 2) + Math.pow(targetMidY - curMidY, 2);
        if (dist < bestDistance) {
          best = cur;
          bestDistance = dist;
        }
      }
    }

    return best;
  }

  _findClosest(target: Rect, rect: Rect) {
    let best = this._findClosestLayoutInfo(target, rect);
    return best || null;
  }

  getKeyBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);
    let rect = new Rect(layoutInfo.rect.x, layoutInfo.rect.maxY + 1, layoutInfo.rect.width, this.virtualizer.visibleRect.height);
    return this._findClosest(layoutInfo.rect, rect)?.key;
  }

  getKeyAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);
    let rect = new Rect(layoutInfo.rect.x, 0, layoutInfo.rect.width, layoutInfo.rect.y - 1);
    return this._findClosest(layoutInfo.rect, rect)?.key;
  }

  getKeyRightOf(key: Key) {
    return this.direction === 'rtl' ?  this.collection.getKeyBefore(key) : this.collection.getKeyAfter(key);
  }

  getKeyLeftOf(key: Key) {
    return  key = this.direction === 'rtl' ?  this.collection.getKeyAfter(key) : this.collection.getKeyBefore(key);
  }

  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }

  getKeyPageAbove(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);

    if (layoutInfo) {
      let pageY = Math.max(0, layoutInfo.rect.y + layoutInfo.rect.height - this.virtualizer.visibleRect.height);
      // If the node is so large that it spans multiple page heights, return the key of the item immediately above
      // Otherwise keep going up until we exceed a single page height worth of nodes
      let keyAbove = this.getKeyAbove(key);
      layoutInfo = this.getLayoutInfo(keyAbove);
      if (layoutInfo && layoutInfo.rect.y > pageY) {
        while (layoutInfo && layoutInfo.rect.y > pageY) {
          layoutInfo = this.getLayoutInfo(this.getKeyAbove(layoutInfo.key));
        }
      }

      if (layoutInfo) {
        return layoutInfo.key;
      }
    }

    return this.getFirstKey();
  }

  getKeyPageBelow(key: Key) {
    let layoutInfo = this.getLayoutInfo(key);
    if (layoutInfo) {
      let pageY = Math.min(this.virtualizer.contentSize.height, layoutInfo.rect.y - layoutInfo.rect.height + this.virtualizer.visibleRect.height);
      // If the node is so large that it spans multiple page heights, return the key of the item immediately below
      // Otherwise keep going up until we exceed a single page height worth of nodes
      let keyBelow =  this.getKeyBelow(key);
      layoutInfo = this.getLayoutInfo(keyBelow);
      if (layoutInfo && layoutInfo.rect.y < pageY) {
        while (layoutInfo && layoutInfo.rect.y < pageY) {
          layoutInfo = this.getLayoutInfo(this.getKeyBelow(layoutInfo.key));
        }
      }

      if (layoutInfo) {
        return layoutInfo.key;
      }
    }

    return this.getLastKey();
  }

  getKeyForSearch(search: string, fromKey?: Key) {
    if (!this.collator) {
      return null;
    }

    let collection = this.collection;
    let key = fromKey ?? this.getFirstKey();

    while (key != null) {
      let item = collection.getItem(key);
      if (item.textValue) {
        let substring = item.textValue.slice(0, search.length);
        if (this.collator.compare(substring, search) === 0) {
          return item.key;
        }
      }

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }
}
