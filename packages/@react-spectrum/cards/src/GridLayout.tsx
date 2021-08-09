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

// TODO: add GridLayoutOptions types
export type GridLayoutOptions<T> = {
  cardSize?: 'S' | 'M' | 'L',
  minItemSize?: Size,
  maxItemSize?: Size,
  margin?: any, // TODO: Perhaps should accept Responsive<DimensionValue>
  minSpace?: Size,
  maxColumns?: number,
  itemPadding?: number
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

// TODO Perhaps this extends something else, maybe BaseLayout doesn't need to exist and we can extend off a different layout
// Maybe extend GridKeyboardDelegate?

export class GridLayout<T> extends BaseLayout<T> implements KeyboardDelegate {
  protected minItemSize;
  protected maxItemSize;
  protected margin;
  protected minSpace;
  protected maxColumns;
  protected itemPadding;
  protected itemSize;
  protected numColumns;
  protected numRows;
  protected horizontalSpacing

  // The following are set in CardView, not through options
  collection: Collection<Node<T>>;
  protected lastCollection: Collection<Node<T>>;
  isLoading: boolean;
  // TODO: is this a thing? I know its available in CardView's props due to multipleSelection type
  disabledKeys: Set<Key> = new Set();
  direction: Direction;
  protected invalidateEverything: boolean;
  // Not sure we need the below for GridLayout, the loader height and placeholder height
  // protected loaderHeight: number;
  // protected placeholderHeight: number;

  constructor(options: GridLayoutOptions<T> = {}) {
    super();
    let cardSize = options.cardSize || 'L';

    // TODO: move the descriptions to the GridLayoutOptions type

    /**
     * The minimum item size
     * @type {Size}
     * @default 208 x 208
     */
    this.minItemSize = options.minItemSize || DEFAULT_OPTIONS[cardSize].minItemSize;

    /**
     * The maximum item size.
     * @type {Size}
     * @default Infinity
     */
    this.maxItemSize = options.maxItemSize || DEFAULT_OPTIONS[cardSize].maxItemSize;

    /**
     * The margin around the grid view between the edges and the items
     * @type {Size} (actually isn't this just a string/interger?)
     * @default 24
     */
    this.margin = options.margin != null ? options.margin : DEFAULT_OPTIONS[cardSize].margin;

    /**
     * The minimum space required between items
     * @type {Size}
     * @default 24 x 48
     */
    this.minSpace = options.minSpace || DEFAULT_OPTIONS[cardSize].minSpace;

    /**
     * The maximum number of columns. Default is infinity.
     * @type {number}
     * @default Infinity
     */
    this.maxColumns = options.maxColumns || DEFAULT_OPTIONS[cardSize].maxColumns;

    /**
     * The vertical padding for an item
     * @type {number}
     * @default 52
     */
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
  }

  get cardType() {
    // GridLayout only supports quiet cards
    return 'quiet';
  }

  // TODO: Below functions From V2 Maybe don't need this? Might be a short cut for getting all visible rects since otherwise we'd have to iterate across all nodes
  getIndexAtPoint(x, y, allowInsertingAtEnd = false) {
    let itemHeight = this.itemSize.height + this.minSpace.height;
    let itemWidth = this.itemSize.width + this.horizontalSpacing;
    return Math.max(0,
      Math.min(
        // Adapted from v2 where collectionView.getSectionLength(0) returned the number of items + 1
        this.collection.size + (allowInsertingAtEnd ? 1 : 0),
        // this.collectionView.getSectionLength(0) - (allowInsertingAtEnd ? 0 : 1),
        Math.floor(y / itemHeight) * this.numColumns + Math.floor((x - this.horizontalSpacing) / itemWidth)
      )
    );
  }

  getVisibleLayoutInfos(rect) {
    let res = [];
    // Adapted from v2
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

      // TBH, do we really need to check isVisible here? Is there a case where an item between the first/last visible item wouldn't be visible?
      for (let index = firstVisibleItem; index < lastVisibleItem; index++) {
        let keyFromIndex = this.collection.at(index).key;
        // TODO: double check that this is retrieving the correct layoutInfos
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

  isVisible(layoutInfo: LayoutInfo, rect: Rect) {
    return layoutInfo.rect.intersects(rect);
  }

  validate(invalidationContext: InvalidationContext<Node<T>, unknown>) {
    // TODO: think about what else could cause the layoutinfo cache to be invalid (would I need to invalidate everything if the min/max item size changes)
    // Invalidate cache if the size of the collection changed.
    // In this case, we need to recalculate the entire layout.
    this.invalidateEverything = invalidationContext.sizeChanged;
    this.collection = this.virtualizer.collection;

    // Below adapted from V2 code
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

    // TODO: grabbed from ListLayout, not entirely sure if necessary
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
        // TODO: filler loader and placeholder heights, get the desired loader height later
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
    let cached = this.layoutInfos.get(node.key);
    if (!this.invalidateEverything && cached  && y === cached.rect.y) {
      return cached;
    }

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
    if (layoutInfo.rect.height !== size.height) {
      // Copy layout info rather than mutating so that later caches are invalidated.
      let newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect.height = size.height;
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
    // Alternative approach is to do a for loop that repeats this.numColumns times and calls getKeyAfter each time
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

  // TODO: perhaps I can use the GridKeyboardDelegate for these instead
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

  // TODO: Having these mean that Home and End will bring focus to the first and last item in the list which differs from what v2 does
  getFirstKey() {
    return this.collection.getFirstKey();
  }

  getLastKey() {
    return this.collection.getLastKey();
  }

  // TODO: does this need getKeyPageUp/Down? Page up and page down don't do anything in v2

}
