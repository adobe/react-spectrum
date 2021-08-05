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
import {GridCollection} from '@react-types/grid';
import {InvalidationContext, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key} from 'react';

// TODO: add GridLayoutOptions types
export type GridLayoutOptions<T> = {
  cardSize?: 'S' | 'M' | 'L',
  minItemSize?: Size,
  maxItemSize?: Size,
  margin?: any, // Perhaps should accept Responsive<DimensionValue>
  minSpace?: Size,
  maxColumns?: number,
  itemPadding?: number
};

// TODO: copied from V2, update this with the proper spectrum values
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
    itemPadding: 52,
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
// Info that will come in handy/replace stuff below
/*
this.virtualizer.visibleRect.width => use this to calculate the number of columns. Subtitutes collectionView.size.width
*/

export class GridLayout<T> extends BaseLayout<T> implements KeyboardDelegate {
  // from v2, TODO: type these, do these need to be protected?
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
  // TODO: Removed protected so that we can access it within CardView. Perhaps update this so it matches the Card "layout" prop types
  // Make keep it as protected and implement a getter method so that it can be accessed but not modified from the outside
  cardType;

  // The following are set in CardView, not through options
  collection: Collection<Node<T>>;
  protected lastCollection: Collection<Node<T>>;
  isLoading: boolean;
  // TODO: is this a thing? I know its available in CardView's props due to multipleSelection type
  disabledKeys: Set<Key> = new Set();
  direction: Direction;
  protected invalidateEverything: boolean;
  // Not sure we need the below for GridLayout, the loader height and placeholder hei
  // protected loaderHeight: number;
  // protected placeholderHeight: number;

// TODO: Determine how to calculate the layout info
// look at what is currently available from v2 and compare with what is in v3 Layouts (buildCollection/buildChild etc)

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
    // Grid layout only supports quiet cards, perhaps change this to be
    this.cardType = 'quiet';
    this.lastCollection = null;
  }

  // TODO: Replaced by the getLayoutInfo in BaseLayout which queries this.layoutInfo.
  // Dunno if any of the other logic will need to be carried over, keep for now
  // getLayoutInfo(type, section, index) {
  //   let row = Math.floor(index / this.numColumns);
  //   let column = index % this.numColumns;
  //   let x = this.margin + column * (this.itemSize.width + this.horizontalSpacing);
  //   let y = this.margin + row * (this.itemSize.height + this.minSpace.height);

  //   if (this.shouldShowDropSpacing()) {
  //     let dropTarget = this.collectionView._dropTarget;
  //     let dropRow = Math.floor(dropTarget.indexPath.index / this.numColumns);
  //     if (dropRow === row) {
  //       x -= this.dropSpacing / 2;

  //       if (index >= dropTarget.indexPath.index) {
  //         x += this.dropSpacing;
  //       }
  //     }
  //   }

  //   let layoutInfo = new LayoutInfo(type, section, index);
  //   layoutInfo.rect = new Rect(x, y, this.itemSize.width, this.itemSize.height);
  //   layoutInfo.estimatedSize = false;

  //   return layoutInfo;
  // }

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
    console.log('tweagaweg', numItems)
    //  let numItems = this.collectionView.getSectionLength(0) - 1;
    if (numItems < 0 || !this.itemSize) {
      return res;
    }

    // The approach from v2 uses indexes where other v3 layouts iterate through every node/root node. This feels more efficient
    let firstVisibleItem = this.getIndexAtPoint(rect.x, rect.y);
    let lastVisibleItem = this.getIndexAtPoint(rect.maxX, rect.maxY);
    console.log('LAST VISIBLE', lastVisibleItem)

    // TBH, do we really need to check isVisible here? Is there a case where an item between the first/last visible item wouldn't be visible?
    for (let index = firstVisibleItem; index < lastVisibleItem; index++) {
      // Can't use collection.at unfortunately because the collection.keyMap.keys has row and child node as a separate key.
      // Perhaps I should change up what gets provided to new GridCollection items
      // console.log('this', this.collection.at)
      let keyFromIndex = this.collection.at(index).key;
      // let keyFromIndex = this.collection.at(index).key;
      // TODO: double check that this is retrieving the correct layoutInfos
      // Right now it is grabbing the row keys, not the cell keys. I think that is correct
      let layoutInfo = this.layoutInfos.get(keyFromIndex);
      if (this.isVisible(layoutInfo, rect)) {
        res.push(layoutInfo);
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
    // TODO: grabbed from ListLayout, not entirely sure if necessary
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

    //   let row = Math.floor(index / this.numColumns);
  //   let column = index % this.numColumns;
  //   let x = this.margin + column * (this.itemSize.width + this.horizontalSpacing);
  //   let y = this.margin + row * (this.itemSize.height + this.minSpace.height);

  //   if (this.shouldShowDropSpacing()) {
  //     let dropTarget = this.collectionView._dropTarget;
  //     let dropRow = Math.floor(dropTarget.indexPath.index / this.numColumns);
  //     if (dropRow === row) {
  //       x -= this.dropSpacing / 2;

  //       if (index >= dropTarget.indexPath.index) {
  //         x += this.dropSpacing;
  //       }
  //     }
  //   }

  //   let layoutInfo = new LayoutInfo(type, section, index);
  //   layoutInfo.rect = new Rect(x, y, this.itemSize.width, this.itemSize.height);
  //   layoutInfo.estimatedSize = false;

  //   return layoutInfo;

  // I don't think I need to construct the node list
  buildCollection() {
    let y = this.margin;
    let index = 0;
    for (let node of this.collection) {
      let layoutInfo = this.buildChild(node, y, index);
      y = layoutInfo.rect.maxY;
      index++;
    }

    // TODO: removed instances of loaderHeight and placeholderHeight
    if (this.isLoading) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let loader = new LayoutInfo('loader', 'loader', rect);
      this.layoutInfos.set('loader', loader);
      y = loader.rect.maxY;
    }

    if (this.collection.size === 0) {
      let rect = new Rect(0, y, this.virtualizer.visibleRect.width, this.virtualizer.visibleRect.height);
      let placeholder = new LayoutInfo('placeholder', 'placeholder', rect);
      this.layoutInfos.set('placeholder', placeholder);
      y = placeholder.rect.maxY;
    }

    this.contentSize = new Size(this.virtualizer.visibleRect.width, y + this.margin);
    // TODO: compare this content Size with the below to make sure it lines up
        // let contentHeight = this.margin * 2 + (this.numRows * this.itemSize.height) + ((this.numRows - 1) * this.minSpace.height);
    // this.contentSize = new Size(this.virtualizer.visibleRect.width, contentHeight);
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

  // TODO: does this need getKeyPageUp/Down? Page up and page down don't do anything in v2

}
