/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import BaseLayout from './BaseLayout';
import {DragTarget, IndexPath, LayoutInfo, Rect, Size} from '@react/collection-view';

/**
 * A WaterfallLayout displays items with variable heights in equal-width columns,
 * similar to Pinterest.
 */
export default class WaterfallLayout extends BaseLayout {
  constructor(options = {}) {
    super();

    /** 
     * The minimum item size
     * @type {Size}
     * @default 240 x 136
     */
    this.minItemSize = options.minItemSize || new Size(240, 136);

    /** 
     * The maximum item size.
     * @type {Size}
     * @default Infinity
     */
    this.maxItemSize = options.maxItemSize || new Size(Infinity, Infinity);

    /** 
     * The margin around the grid view between the edges and the items
     * @type {Size}
     * @default 24
     */
    this.margin = 24;

    /**
     * The minimum space required between items
     * @type {Size}
     * @default 24 x 24
     */
    this.minSpace = options.minSpace || new Size(24, 24);

    /**
     * The maximum number of columns. Default is infinity.
     * @type {number}
     * @default Infinity
     */
    this.maxColumns = options.maxColumns || Infinity;

    /**
     * The vertical padding for an item
     * @type {number}
     * @default 56
     */
    this.itemPadding = options.itemPadding != null ? options.itemPadding : 56;

    this.itemWidth = 0;
    this.numColumns = 0;
    this.layoutInfos = [];
    this.cardType = 'standard';
  }

  getLayoutInfo(type, section, index) {
    return this.layoutInfos[section][index];
  }

  getVisibleLayoutInfos(rect) {
    let res = [];
    for (let section of this.layoutInfos) {
      for (let layoutInfo of section) {
        if (layoutInfo.rect.intersects(rect)) {
          res.push(layoutInfo);
        }
      }
    }

    return res;
  }

  validate(invalidationContext) {
    // Compute the number of columns needed to display the content
    let availableWidth = this.collectionView.size.width - this.margin * 2;
    let columns = Math.floor(this.collectionView.size.width / (this.minItemSize.width + this.minSpace.width));
    this.numColumns = Math.max(1, Math.min(this.maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = availableWidth - (this.minSpace.width * (this.numColumns - 1));

    // Compute the item width based on the space available
    let itemWidth = Math.round(width / this.numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(this.maxItemSize.width, itemWidth));
    this.itemWidth = itemWidth;

    // Compute the horizontal spacing
    let horizontalSpacing = Math.round((availableWidth - this.numColumns * itemWidth) / (this.numColumns - 1));

    // Setup an array of column heights
    let columnHeights = Array(this.numColumns).fill(this.margin);

    let delegate = this.collectionView.delegate;
    let oldLayoutInfos = this.layoutInfos;
    this.layoutInfos = [];

    let columnLayoutInfos = Array(this.numColumns).fill().map(() => []);

    let numSections = this.collectionView.getNumberOfSections();
    for (let section = 0; section < numSections; section++) {
      this.layoutInfos[section] = [];

      let numItems = this.collectionView.getSectionLength(section);
      for (let i = 0; i < numItems; i++) {
        let layoutInfo = new LayoutInfo('item', section, i);

        // Compute the height of the item. Use the existing height if available,
        // otherwise call the delegate to estimate the size.
        let old = oldLayoutInfos[section] && oldLayoutInfos[section][i];
        let height;
        let estimatedSize = true;
        if (old) {
          height = old.rect.height;
          estimatedSize = invalidationContext.sizeChanged || old.estimatedSize;
        } else if (delegate.getItemSize) {
          let size = delegate.getItemSize(this.collectionView.getItem(section, i));
          let scaledHeight = Math.round(size.height * ((itemWidth) / size.width));
          height = Math.max(this.minItemSize.height, Math.min(this.maxItemSize.height, scaledHeight)) + this.itemPadding;
        } else {
          height = itemWidth;
        }

        // Figure out which column to place the item in, and compute its position.
        let column = this.getNextColumnIndex(columnHeights);
        let x = this.margin + column * (itemWidth + horizontalSpacing);
        let y = columnHeights[column];

        layoutInfo.rect = new Rect(x, y, itemWidth, height);
        layoutInfo.estimatedSize = estimatedSize;
        this.layoutInfos[section][i] = layoutInfo;
        columnLayoutInfos[column].push(layoutInfo);

        if (layoutInfo.estimatedSize && !invalidationContext.contentChanged && !this.collectionView._transaction) {
          this.updateItemSize(new IndexPath(section, i));
        }

        columnHeights[column] += layoutInfo.rect.height + this.minSpace.height;
      }

      // Reset all columns to the maximum for the next section
      let maxHeight = Math.max.apply(Math, columnHeights) - this.minSpace.height + this.margin;
      columnHeights.fill(maxHeight);
    }

    this.contentHeight = columnHeights[0];
  }

  getContentSize() {
    return new Size(this.collectionView.size.width, this.contentHeight);
  }

  getNextColumnIndex(columnHeights) {
    let minIndex = 0;
    for (let i = 0; i < columnHeights.length; i++) {
      if (columnHeights[i] < columnHeights[minIndex]) {
        minIndex = i;
      }
    }

    return minIndex;
  }

  updateItemSize(indexPath) {
    let {section, index} = indexPath;
    let view = this.collectionView.getItemView(section, index);
    if (!view) {
      return false;
    }


    let layoutInfo = this.layoutInfos[section][index];
    let size = view.getSize();

    if (size.height !== layoutInfo.rect.height) {
      layoutInfo.rect.height = size.height;
      layoutInfo.estimatedSize = view.estimatedSize || false;
      return true;
    }

    return false;
  }

  itemInserted(indexPath) {
    this.layoutInfos[indexPath.section].splice(indexPath.index, 0, null);
  }

  itemRemoved(indexPath) {
    this.layoutInfos[indexPath.section].splice(indexPath.index, 1);
  }

  itemMoved(from, to) {
    let layoutInfo = this.layoutInfos[from.section].splice(from.index, 1)[0];
    this.layoutInfos[to.section].splice(to.index, 0, layoutInfo);
  }

  itemReplaced(indexPath) {
    this.layoutInfos[indexPath.section][indexPath.index] = null;
  }

  sectionInserted(section) {
    this.layoutInfos.splice(section, 0, []);
  }

  sectionRemoved(section) {
    this.layoutInfos.splice(section, 1);
  }

  sectionMoved(fromSection, toSection) {
    let section = this.layoutInfos.splice(fromSection, 1)[0];
    this.layoutInfos.splice(toSection, 0, section);
  }

  sectionReplaced(section) {
    this.layoutInfos[section] = [];
  }

  indexPathAbove(indexPath) {
    let layoutInfo = this.getLayoutInfo('item', indexPath.section, indexPath.index);
    let rect = new Rect(layoutInfo.rect.x, 0, this.itemWidth, layoutInfo.rect.y - 1);

    return this._findClosest(layoutInfo.rect, rect);
  }

  indexPathBelow(indexPath) {
    let layoutInfo = this.getLayoutInfo('item', indexPath.section, indexPath.index);
    let rect = new Rect(layoutInfo.rect.x, layoutInfo.rect.maxY + 1, this.itemWidth, this.collectionView.contentSize.height);

    return this._findClosest(layoutInfo.rect, rect);
  }

  indexPathLeftOf(indexPath) {
    let layoutInfo = this.getLayoutInfo('item', indexPath.section, indexPath.index);
    let rect = new Rect(0, 0, layoutInfo.rect.x - 1, this.collectionView.contentSize.height);

    return this._findClosest(layoutInfo.rect, rect);
  }

  indexPathRightOf(indexPath) {
    let layoutInfo = this.getLayoutInfo('item', indexPath.section, indexPath.index);
    let rect = new Rect(layoutInfo.rect.maxX + 1, 0, this.collectionView.size.width, this.collectionView.contentSize.height);

    return this._findClosest(layoutInfo.rect, rect);
  }

  getDropTarget(point) {
    let indexPath = this.collectionView.indexPathAtPoint(point);
    if (indexPath) {
      return new DragTarget('item', indexPath, DragTarget.DROP_ON);
    }

    return new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN);
  }
}
