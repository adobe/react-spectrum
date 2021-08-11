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

import {BaseLayout} from './';
import {Collection, Direction, KeyboardDelegate, Node} from '@react-types/shared';
import {InvalidationContext, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key} from 'react';

export type GridLayoutOptions<T> = {
  /**
   * The card size in the grid.
   */
  cardSize?: 'S' | 'M' | 'L',
  /**
   * The minimum item size.
   * @default 208 x 208
   */
  minItemSize?: Size,
  /**
   * The maximum item size.
   * @default Infinity
   */
  maxItemSize?: Size,
  /**
   * The margin around the grid view between the edges and the items.
   * @default 24
   */
  margin?: number, // TODO: Perhaps should accept Responsive<DimensionValue>
  /**
   * The minimum space required between items.
   * @default 24 x 48
   */
  minSpace?: Size,
  /**
   * The maximum number of columns.
   * @default Infinity
   */
  maxColumns?: number,
  /**
   * The vertical padding for an item.
   * @default 52
   */
  itemPadding?: number,
  collator?: Intl.Collator
};

// TODO: copied from V2, update this with the proper spectrum values
// Should these be affected by Scale as well?
const DEFAULT_OPTIONS = {
  S: {
    itemPadding: 20,
    minItemSize: new Size(96, 96),
    maxItemSize: new Size(Infinity, Infinity),
    margin: 8,
    minSpace: new Size(8, 16),
    maxColumns: Infinity,
    dropSpacing: 50
  },
  L: {
    // TODO: for now bumping this higher since the new cards have more stuff in the content area.
    // Will need to ask Spectrum what these values should be. Used to be 52. Do the same for S above
    itemPadding: 100,
    minItemSize: new Size(208, 208),
    maxItemSize: new Size(Infinity, Infinity),
    margin: 24,
    minSpace: new Size(24, 48),
    maxColumns: Infinity,
    dropSpacing: 100
  }
};

export class GridLayout<T> extends BaseLayout<T> implements KeyboardDelegate {
  protected minItemSize: Size;
  protected maxItemSize: Size;
  protected margin: number;
  protected minSpace: Size;
  protected maxColumns: number;
  protected itemPadding: number;
  protected itemSize: Size;
  protected numColumns: number;
  protected numRows: number;
  protected horizontalSpacing: number;
  protected collator: Intl.Collator;
  protected lastCollection: Collection<Node<T>>;
  protected invalidateEverything: boolean;
  // The following are set in CardView, not through options
  collection: Collection<Node<T>>;
  isLoading: boolean;
  // TODO: is this a thing? I know its available in CardView's props due to multipleSelection type
  disabledKeys: Set<Key> = new Set();
  direction: Direction;

  constructor(options: GridLayoutOptions<T> = {}) {
    super();
    let cardSize = options.cardSize || 'L';
    this.minItemSize = options.minItemSize || DEFAULT_OPTIONS[cardSize].minItemSize;
    this.maxItemSize = options.maxItemSize || DEFAULT_OPTIONS[cardSize].maxItemSize;
    this.margin = options.margin != null ? options.margin : DEFAULT_OPTIONS[cardSize].margin;
    this.minSpace = options.minSpace || DEFAULT_OPTIONS[cardSize].minSpace;
    this.maxColumns = options.maxColumns || DEFAULT_OPTIONS[cardSize].maxColumns;
    this.itemPadding = options.itemPadding != null ? options.itemPadding : DEFAULT_OPTIONS[cardSize].itemPadding;

    // TODO: add drag and drop later
    //   /**
    //    * The space between items created when dragging between them
    //    * @type {number}
    //    * @default 100
    //    */
    //   this.dropSpacing = options.dropSpacing != null ? options.dropSpacing : DEFAULT_OPTIONS[cardSize].dropSpacing;

    this.itemSize = null;
    this.numColumns = 0;
    this.numRows = 0;
    this.horizontalSpacing = 0;
    this.lastCollection = null;
    this.collator = options.collator;
  }

  get layoutType() {
    // GridLayout only supports quiet cards
    return 'grid';
  }

  // TODO: Below functions From V2 Maybe don't need this? Might be a short cut for getting all visible rects since otherwise we'd have to iterate across all nodes
  getIndexAtPoint(x, y, allowInsertingAtEnd = false) {
    let itemHeight = this.itemSize.height + this.minSpace.height;
    let itemWidth = this.itemSize.width + this.horizontalSpacing;
    return Math.max(0,
      Math.min(
        this.collection.size + (allowInsertingAtEnd ? 1 : 0),
        Math.floor(y / itemHeight) * this.numColumns + Math.floor((x - this.horizontalSpacing) / itemWidth)
      )
    );
  }

  getVisibleLayoutInfos(rect) {
    let res: LayoutInfo[] = [];
    let numItems = this.collection.size;
    if (numItems <= 0 || !this.itemSize) {
      // If there aren't any items in the collection, we are in a loader/placeholder state. Return those layoutInfos as
      // the currently visible items
      if (this.layoutInfos.size > 0) {
        for (let layoutInfo of this.layoutInfos.values()) {
          if (this.isVisible(layoutInfo, rect)) {
            res.push(layoutInfo);
          }
        }
      }
    } else {
      // The approach from v2 uses indexes where other v3 layouts iterate through every node/root node. This feels more efficient
      let firstVisibleItem = this.getIndexAtPoint(rect.x, rect.y);
      let lastVisibleItem = this.getIndexAtPoint(rect.maxX, rect.maxY);

      for (let index = firstVisibleItem; index < lastVisibleItem; index++) {
        let keyFromIndex = this.collection.at(index).key;
        let layoutInfo = this.layoutInfos.get(keyFromIndex);
        if (this.isVisible(layoutInfo, rect)) {
          res.push(layoutInfo);
        }
      }

      // Check if loader is in view and add to res if so
      let loader = this.layoutInfos.get('loader');
      if (loader && this.isVisible(loader, rect)) {
        res.push(loader)
      }

    }

    return res;
  }

  validate() {
    // TODO: Removed the invalidateEverything check since in ListLayout that was mainly for Sections it seems?
    this.collection = this.virtualizer.collection;

    // Compute the number of rows and columns needed to display the content
    let availableWidth = this.virtualizer.visibleRect.width - this.margin * 2;
    let columns = Math.floor(availableWidth / (this.minItemSize.width + this.minSpace.width));
    this.numColumns = Math.max(1, Math.min(this.maxColumns, columns));
    this.numRows = Math.ceil(this.collection.size / this.numColumns);

    // Compute the available width (minus the space between items)
    let width = availableWidth - (this.minSpace.width * Math.max(0, this.numColumns - 1));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / this.numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(this.maxItemSize.width, itemWidth));

    // TODO: Right now the v2 code here assumes a static number for itemPadding (aka the content area below the preview)
    // Perhaps rewrite this so that it uses that itemPadding as a estimated height, then on the second run through it checks the largest
    // description height in the DOM and uses that
    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / this.minItemSize.width);
    let itemHeight = this.minItemSize.height + this.minItemSize.height * t;
    itemHeight = Math.max(this.minItemSize.height, Math.min(this.maxItemSize.height, itemHeight)) + this.itemPadding;

    this.itemSize = new Size(itemWidth, itemHeight);

    // Compute the horizontal spacing and content height
    this.horizontalSpacing = Math.floor((this.virtualizer.visibleRect.width - this.numColumns * this.itemSize.width) / (this.numColumns + 1));

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
    let y = this.margin;
    let index = 0;
    for (let node of this.collection) {
      let layoutInfo = this.buildChild(node, y, index);
      y = layoutInfo.rect.maxY;
      index++;
    }

    if (this.isLoading) {
      let loaderY = y;
      let loaderHeight = 60;
      let marginOffset = this.margin;
      // If there aren't any items, make loader take all avaliable room and remove margin from y calculation
      // so it doesn't scroll
      if (this.collection.size === 0) {
        loaderY = 0;
        loaderHeight = this.virtualizer.visibleRect.height || 60;
      }

      let rect = new Rect(0, loaderY, this.virtualizer.visibleRect.width, loaderHeight);
      let loader = new LayoutInfo('loader', 'loader', rect);
      this.layoutInfos.set('loader', loader);
      y = loader.rect.maxY - marginOffset;
    }

    if (this.collection.size === 0 && !this.isLoading) {
      let rect = new Rect(0, 0, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let placeholder = new LayoutInfo('placeholder', 'placeholder', rect);
      this.layoutInfos.set('placeholder', placeholder);
      y = placeholder.rect.maxY - this.margin;
    }

    this.contentSize = new Size(this.virtualizer.visibleRect.width, y + this.margin);
  }

  buildChild(node: Node<T>, y: number, index: number): LayoutInfo {
    // TODO: Removed the cache check not entirely convinced it is useful in this case
    let row = Math.floor(index / this.numColumns);
    let column = index % this.numColumns;
    let x = this.margin + column * (this.itemSize.width + this.horizontalSpacing);
    y = this.margin + row * (this.itemSize.height + this.minSpace.height);

    let rect = new Rect(x, y, this.itemSize.width, this.itemSize.height);
    let layoutInfo = new LayoutInfo(node.type, node.key, rect);
    this.layoutInfos.set(node.key, layoutInfo)
    // TODO: add drop spacing logic from v2's getLayoutInfo when drop functionality is added
    return layoutInfo;
  }

  // TODO: add updateItemSize since Virtualizer statelly needs it?
  // Do we really need this?
  updateItemSize(key: Key, size: Size) {
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


  // TODO: add drop and drop later
  // getDropTarget(point) {
  //   let dropPosition = this.component.props.dropPosition === 'on' && !this.collectionView._dragTarget
  //     ? DragTarget.DROP_ON
  //     : DragTarget.DROP_BETWEEN;

  //   // If we are dropping between rows, the target should move to the
  //   // next item halfway through a row.
  //   if (dropPosition === DragTarget.DROP_BETWEEN) {
  //     point = point.copy();
  //     point.x += (this.itemSize.width + this.horizontalSpacing) / 2;
  //   }

  //   let indexPath;
  //   if (dropPosition === DragTarget.DROP_ON) {
  //     indexPath = this.collectionView.indexPathAtPoint(point);
  //   } else {
  //     let index = this.getIndexAtPoint(point.x, point.y, true);
  //     indexPath = new IndexPath(0, index);
  //   }

  //   if (indexPath) {
  //     return new DragTarget('item', indexPath, dropPosition);
  //   }

  //   let index = dropPosition === DragTarget.DROP_ON ? 0 : this.collectionView.getSectionLength(0);
  //   return new DragTarget('item', new IndexPath(0, index), DragTarget.DROP_BETWEEN);
  // }

  // Since the collection doesn't represent the visual layout, need to calculate what row and column the current key is in,
  // then return the key that occupies the row + column below. This can be done by figuring out how many cards exist per column then dividing the
  // collection contents by that number (which will give us the row distribution)
  getKeyBelow(key: Key) {
    let indexRowBelow;
    // TODO: Alternative approach is to do a for loop that repeats this.numColumns times and calls getKeyAfter each time
    let keyArray = [...this.collection.getKeys()];
    let index = keyArray.findIndex(k => k === key);
    if (index !== -1) {
      indexRowBelow = index + this.numColumns;
    } else {
      return null;
    }

    return this.collection.at(indexRowBelow)?.key || null;
  }

  getKeyAbove(key: Key) {
    let indexRowAbove;
    let keyArray = [...this.collection.getKeys()];
    let index = keyArray.findIndex(k => k === key);
    if (index !== -1) {
      indexRowAbove = index - this.numColumns;
    } else {
      return null;
    }

    return this.collection.at(indexRowAbove)?.key || null;
  }

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

  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }

  // TODO: Page up and down mimics that of listlayout, perhaps change to an index based search for performance?
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

      key = this.collection.getKeyAfter(key);
    }

    return null;
  }
}
