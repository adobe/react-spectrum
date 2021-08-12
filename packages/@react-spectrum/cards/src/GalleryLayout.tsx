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

import {BaseLayout, BaseLayoutOptions} from './';
import {Collection, Direction, KeyboardDelegate, Node} from '@react-types/shared';
import {InvalidationContext, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key} from 'react';

export interface GalleryLayoutOptions<T> extends BaseLayoutOptions<T> {
  /**
   * The card size in the grid.
   */
  cardSize?: 'S' | 'M' | 'L',
  /**
   * The the default row height.
   * @default 208
   */
  idealRowHeight?: number,
  /**
   * The spacing between items.
   * @default 24 x 24
   */
  itemSpacing?: Size,
  /**
   * The vertical padding for an item.
   * @default 32
   */
  itemPadding?: Size,
};

// TODO: copied from V2, update this with the proper spectrum values
// Should these be affected by Scale as well?
const DEFAULT_OPTIONS = {
  S: {
    idealRowHeight: 112,
    minItemSize: new Size(96, 96),
    itemSpacing: new Size(8, 16),
    itemPadding: 24,
    dropSpacing: 50
  },
  L: {
    idealRowHeight: 208,
    minItemSize: new Size(136, 136),
    itemSpacing: new Size(24, 32),
    itemPadding: 32,
    dropSpacing: 100
  }
};

export class GalleryLayout<T> extends BaseLayout<T> implements KeyboardDelegate {
  protected idealRowHeight: number;
  // TODO: should this have had a margin option? v2 seems to use itemSpacing
  protected itemSpacing: Size;
  protected itemPadding: number;

  constructor(options: GalleryLayoutOptions<T> = {}) {
    super(options);
    let cardSize = options.cardSize || 'L';
    this.idealRowHeight = options.idealRowHeight || DEFAULT_OPTIONS[cardSize].idealRowHeight;
    this.itemSpacing = options.itemSpacing || DEFAULT_OPTIONS[cardSize].itemSpacing;
    this.itemPadding = options.itemPadding != null ? options.itemPadding : DEFAULT_OPTIONS[cardSize].itemPadding;

    // TODO: add drag and drop later
    // /**
    //  * The space between items created when dragging between them
    //  * @type {number}
    //  * @default 100
    //  */
    // this.dropSpacing = options.dropSpacing != null ? options.dropSpacing : DEFAULT_OPTIONS[cardSize].dropSpacing;
  }

  get layoutType() {
    // GalleryLayout only supports quiet vertical cards
    // return 'quiet';
    return 'gallery';
  }

  // TODO: For now assume that we won't support sections here (double check with team)
  // For now use the current this.layoutInfos map. If sections become a thing, can make a local layoutNodes or something that
  // organizes everything into sections

  validate() {
    this.collection = this.virtualizer.collection;
    this.buildCollection();

    // Remove layout info that doesn't exist in new collection
    if (this.lastCollection) {
      for (let key of this.lastCollection.getKeys()) {
        if (!this.collection.getItem(key)) {
          this.layoutInfos.delete(key);
        }
      }
    }

    this.lastCollection = this.collection;
  }

  buildCollection() {
    // TODO: split up the below further.
    let visibleWidth = this.virtualizer.visibleRect.width;
    let visibleHeight = this.virtualizer.visibleRect.height;
    let y = this.itemSpacing.height;
    let availableWidth = visibleWidth - this.itemSpacing.width * 2;

    // TODO: readd when bringing back drag and drop
    // let dropTarget = this.collectionView._dropTarget;
    // if (!this.shouldShowDropSpacing()) {
    //   dropTarget = null;
    // }

    // Compute aspect ratios for all of the items, and the total width if all items were on in a single row.
    let ratios = [];
    let totalWidth = 0;
    for (let node of this.collection) {
      // TODO: Is there any way to calculate the aspect ratios without the user explictly passing in the width + height of the image?
      // Check table overflowmode wrap and see how it calculates the item height
      let ratio = node.props.width / node.props.height;
      ratios.push(ratio);
      totalWidth += ratio * this.idealRowHeight;
    }

    // Determine how many rows we'll need, and partition the items into rows
    // using the aspect ratios as weights.
    let rows = Math.max(1, Math.round(totalWidth / availableWidth));
    let partition = linearPartition(ratios, rows);

    let index = 0;
    for (let row of partition) {
      // Compute the total weight for this row
      let totalWeight = 0;
      for (let j = index; j < index + row.length; j++) {
        totalWeight += ratios[j];
      }

      // Determine the row height based on the total available width and weight of this row.
      let rowHeight = (availableWidth - (row.length - 1) * this.itemSpacing.width) / totalWeight;
      if (row === partition[partition.length - 1] && rowHeight > this.idealRowHeight * 2) {
        rowHeight = this.idealRowHeight;
      }

      let itemHeight = Math.round(rowHeight) + this.itemPadding;
      let x = this.itemSpacing.width;

      // TODO: readd when adding drag and drop
      // // If the drop target is on this row, shift the whole row to the left to create space for the dropped item
      // if (dropTarget && y === this.dropTargetY) {
      //   x -= this.dropSpacing / 2;
      // }

      // Create items for this row.
      for (let j = index; j < index + row.length; j++) {
        let node = this.collection.at(j);
        let itemWidth = Math.round(rowHeight * ratios[j]);

        // TODO: readd when adding drag and drop
        // // Shift items in this row after the drop target to the right
        // if (dropTarget && dropTarget.indexPath.index === j && y === this.dropTargetY) {
        //   x += this.dropSpacing;
        // }

        let rect = new Rect(x, y, itemWidth, itemHeight)
        let layoutInfo = new LayoutInfo(node.type, node.key, rect);
        this.layoutInfos.set(node.key, layoutInfo)
        x += itemWidth + this.itemSpacing.width;
        // TODO: readd this when adding drag and drop
        // layoutInfo.isLastInRow = j === index + row.length - 1;
      }

      y += itemHeight + this.itemSpacing.height;
      index += row.length;
    }

    if (this.isLoading) {
      let loaderY = y;
      let loaderHeight = 60;
      // If there aren't any items, make loader take all avaliable room and remove margin from y calculation
      // so it doesn't scroll
      if (this.collection.size === 0) {
        loaderY = 0;
        loaderHeight = visibleHeight || 60;
      }

      let rect = new Rect(0, loaderY, visibleWidth, loaderHeight);
      let loader = new LayoutInfo('loader', 'loader', rect);
      this.layoutInfos.set('loader', loader);
      y = loader.rect.maxY;
    }

    if (this.collection.size === 0 && !this.isLoading) {
      let rect = new Rect(0, 0, visibleWidth, visibleHeight);
      let placeholder = new LayoutInfo('placeholder', 'placeholder', rect);
      this.layoutInfos.set('placeholder', placeholder);
      y = placeholder.rect.maxY;
    }

    this.contentSize = new Size(visibleWidth, y);
  }

  // TODO: add updateItemSize since Virtualizer statelly needs it?
  // Do we really need this? Only triggers if do any size estimates
  updateItemSize(key: Key, size: Size) {
    console.log('update')
    let layoutInfo = this.layoutInfos.get(key);
    // If no layoutInfo, item has been deleted/removed.
    if (!layoutInfo) {
      return false;
    }

    layoutInfo.estimatedSize = false;
    // TODO: updated this to check width as well, double check if we need this
    if (layoutInfo.rect.height !== size.height || layoutInfo.rect.width !== size.width) {
      // Copy layout info rather than mutating so that later caches are invalidated.
      let newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect.height = size.height;
      newLayoutInfo.rect.width = size.width;
      this.layoutInfos.set(key, newLayoutInfo);
      return true;
    }

    return false;
  }


  // TODO: readd when adding drag and drop back in. Double check if sections are a thing for GalleryLayout
  // itemInserted(indexPath) {
  //   this.layoutInfos[indexPath.section].splice(indexPath.index, 0, null);
  // }

  // itemRemoved(indexPath) {
  //   this.layoutInfos[indexPath.section].splice(indexPath.index, 1);
  // }

  // itemMoved(from, to) {
  //   let layoutInfo = this.layoutInfos[from.section].splice(from.index, 1)[0];
  //   this.layoutInfos[to.section].splice(to.index, 0, layoutInfo);
  // }

  // itemReplaced(indexPath) {
  //   this.layoutInfos[indexPath.section][indexPath.index] = null;
  // }

  // sectionInserted(section) {
  //   this.layoutInfos.splice(section, 0, []);
  // }

  // sectionRemoved(section) {
  //   this.layoutInfos.splice(section, 1);
  // }

  // sectionMoved(fromSection, toSection) {
  //   let section = this.layoutInfos.splice(fromSection, 1)[0];
  //   this.layoutInfos.splice(toSection, 0, section);
  // }

  // sectionReplaced(section) {
  //   this.layoutInfos[section] = [];
  // }

  // TODO: perhaps have baseLayout implement KeyboardDelegate so we can have these common funcs stored there (right,left, first, getKeyForSearch are all the same)?
  getKeyRightOf(key: Key) {
    key = this.direction === 'rtl' ?  this.collection.getKeyBefore(key) : this.collection.getKeyAfter(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      // Don't check if item is disabled because we want to be able to focus disabled items in a grid (double check this)
      if (item.type === 'item') {
        return key;
      }

      key = this.direction === 'rtl' ?  this.collection.getKeyBefore(key) : this.collection.getKeyAfter(key);
    }
  }

  getKeyLeftOf(key: Key) {
    key = this.direction === 'rtl' ?  this.collection.getKeyAfter(key) : this.collection.getKeyBefore(key);
    while (key != null) {
      let item = this.collection.getItem(key);
      // Don't check if item is disabled because we want to be able to focus disabled items in a grid (double check this)
      if (item.type === 'item') {
        return key;
      }

      key = this.direction === 'rtl' ?  this.collection.getKeyAfter(key) : this.collection.getKeyBefore(key);
    }
  }

  // TODO: add when re-enabling drag and drop
  // getDropTarget(point) {
  //   let dropPosition = this.component.props.dropPosition === 'on' && !this.collectionView._dragTarget
  //     ? DragTarget.DROP_ON
  //     : DragTarget.DROP_BETWEEN;

  //   let indexPath;
  //   if (dropPosition === DragTarget.DROP_ON) {
  //     indexPath = this.collectionView.indexPathAtPoint(point);
  //   } else {
  //     // Find the closest item in this row
  //     let layoutInfo = this._findClosestLayoutInfo(point, new Rect(0, point.y, this.collectionView.size.width, this.itemSpacing.height));
  //     if (layoutInfo) {
  //       indexPath = new IndexPath(layoutInfo.section, layoutInfo.index);

  //       // If the item is the last in a row, and the point is at least half way across, insert the new items after.
  //       if (layoutInfo.isLastInRow && (point.x - layoutInfo.rect.x) > layoutInfo.rect.width / 2) {
  //         indexPath.index++;
  //       }

  //       // Store the row Y position so we can compare in `validate`.
  //       this.dropTargetY = layoutInfo.rect.y;
  //     }
  //   }

  //   if (indexPath) {
  //     return new DragTarget('item', indexPath, dropPosition);
  //   }

  //   let index = dropPosition === DragTarget.DROP_ON ? 0 : this.collectionView.getSectionLength(0);
  //   return new DragTarget('item', new IndexPath(0, index), DragTarget.DROP_BETWEEN);
  // }
}

// https://www8.cs.umu.se/kurser/TDBA77/VT06/algorithms/BOOK/BOOK2/NODE45.HTM
function linearPartition(seq, k) {
  let n = seq.length;
  if (k <= 0) {
    return [];
  }

  if (k >= n) {
    return seq.map(x => [x]);
  }

  if (n === 1) {
    return [seq];
  }

  let table = Array(n).fill().map(() => Array(k).fill(0));
  let solution = Array(n - 1).fill().map(() => Array(k - 1).fill(0));

  for (let i = 0; i < n; i++) {
    table[i][0] = seq[i] + (i > 0 ? table[i - 1][0] : 0);
  }

  for (let i = 0; i < k; i++) {
    table[0][i] = seq[0];
  }

  for (let i = 1; i < n; i++) {
    for (let j = 1; j < k; j++) {
      let currentMin = 0;
      let minX = Infinity;

      for (let x = 0; x < i; x++) {
        let c1 = table[x][j - 1];
        let c2 = table[i][0] - table[x][0];
        let cost = Math.max(c1, c2);

        if (!x || cost < currentMin) {
          currentMin = cost;
          minX = x;
        }
      }

      table[i][j] = currentMin;
      solution[i - 1][j - 1] = minX;
    }
  }

  n = n - 1;
  k = k - 2;

  let result = [];
  while (k >= 0) {
    if (n >= 1) {
      let row = [];
      for (let i = solution[n - 1][k] + 1; i < n + 1; i++) {
        row.push(seq[i]);
      }

      result.unshift(row);
      n = solution[n - 1][k];
    }

    k--;
  }

  let row = [];
  for (let i = 0; i < n + 1; i++) {
    row.push(seq[i]);
  }

  result.unshift(row);

  return result;
}
