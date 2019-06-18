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

/**
 * A GalleryLayout is designed to display photos in a grid, filling all available space by
 * scaling the photos to fill each row.
 */
export default class GalleryLayout extends BaseLayout {
  constructor(options = {}) {
    super();

    let cardSize = options.cardSize || 'L';

    /**
     * The the default row height
     * @type {number}
     * @default 208
     */
    this.idealRowHeight = options.idealRowHeight || DEFAULT_OPTIONS[cardSize].idealRowHeight;

    // TODO
    // this.minItemSize = options.minItemSize || DEFAULT_OPTIONS[cardSize].minItemSize;

    /**
     * The spacing between items
     * @type {Size}
     * @default 24 x 24
     */
    this.itemSpacing = options.itemSpacing || DEFAULT_OPTIONS[cardSize].itemSpacing;

    /**
     * The vertical padding for an item
     * @type {number}
     * @default 32
     */
    this.itemPadding = options.itemPadding != null ? options.itemPadding : DEFAULT_OPTIONS[cardSize].itemPadding;

    /**
     * The space between items created when dragging between them
     * @type {number}
     * @default 100
     */
    this.dropSpacing = options.dropSpacing != null ? options.dropSpacing : DEFAULT_OPTIONS[cardSize].dropSpacing;

    this.layoutInfos = [];
    this.cardType = 'gallery';
  }

  validate() {
    this.layoutInfos = [];

    let y = this.itemSpacing.height;
    let availableWidth = this.collectionView.size.width - this.itemSpacing.width * 2;
    let dropTarget = this.collectionView._dropTarget;
    if (!this.shouldShowDropSpacing()) {
      dropTarget = null;
    }

    let numSections = this.collectionView.getNumberOfSections();
    for (let section = 0; section < numSections; section++) {
      this.layoutInfos[section] = [];

      let numItems = this.collectionView.getSectionLength(section);

      // Compute aspect ratios for all of the items, and the total width if all items were on in a single row.
      let ratios = [];
      let totalWidth = 0;
      for (let index = 0; index < numItems; index++) {
        let size = this.collectionView.delegate.getItemSize(this.collectionView.getItem(section, index));
        let ratio = size.width / size.height;
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

        // Deternine the row height based on the total available width and weight of this row.
        let ratio = (availableWidth - (row.length - 1) * this.itemSpacing.width) / totalWeight;
        if (row === partition[partition.length - 1] && ratio > this.idealRowHeight * 2) {
          ratio = this.idealRowHeight;
        }

        let height = Math.round(ratio) + this.itemPadding;
        let x = this.itemSpacing.width;

        // If the drop target is on this row, shift the whole row to the left to create space for the dropped item
        if (dropTarget && y === this.dropTargetY) {
          x -= this.dropSpacing / 2;
        }

        // Create items for this row.
        for (let j = index; j < index + row.length; j++) {
          let layoutInfo = new LayoutInfo('item', section, j);
          let width = Math.round(ratio * ratios[j]);

          // Shift items in this row after the drop target to the right
          if (dropTarget && dropTarget.indexPath.index === j && y === this.dropTargetY) {
            x += this.dropSpacing;
          }
  
          layoutInfo.rect = new Rect(x, y, width, height);
          layoutInfo.isLastInRow = j === index + row.length - 1;
          this.layoutInfos[section][j] = layoutInfo;

          x += width + this.itemSpacing.width;
        }

        y += height + this.itemSpacing.height;
        index += row.length;
      }
    }

    this.contentHeight = y;
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

  getLayoutInfo(type, section, index) {
    return this.layoutInfos[section][index];
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
    let rect = new Rect(layoutInfo.rect.x, 0, 1, layoutInfo.rect.y - 1);

    return this._findClosest(layoutInfo.rect, rect);
  }

  indexPathBelow(indexPath) {
    let layoutInfo = this.getLayoutInfo('item', indexPath.section, indexPath.index);
    let rect = new Rect(layoutInfo.rect.x, layoutInfo.rect.maxY + 1, 1, this.collectionView.contentSize.height);

    return this._findClosest(layoutInfo.rect, rect);
  }

  indexPathLeftOf(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, -1);
  }

  indexPathRightOf(indexPath) {
    return this.collectionView.incrementIndexPath(indexPath, 1);
  }

  getDropTarget(point) {
    let dropPosition = this.component.props.dropPosition === 'on' && !this.collectionView._dragTarget 
      ? DragTarget.DROP_ON 
      : DragTarget.DROP_BETWEEN;

    let indexPath;
    if (dropPosition === DragTarget.DROP_ON) {
      indexPath = this.collectionView.indexPathAtPoint(point);
    } else {
      // Find the closest item in this row
      let layoutInfo = this._findClosestLayoutInfo(point, new Rect(0, point.y, this.collectionView.size.width, this.itemSpacing.height));
      if (layoutInfo) {
        indexPath = new IndexPath(layoutInfo.section, layoutInfo.index);

        // If the item is the last in a row, and the point is at least half way across, insert the new items after.
        if (layoutInfo.isLastInRow && (point.x - layoutInfo.rect.x) > layoutInfo.rect.width / 2) {
          indexPath.index++;
        }

        // Store the row Y position so we can compare in `validate`.
        this.dropTargetY = layoutInfo.rect.y;
      }
    }

    if (indexPath) {
      return new DragTarget('item', indexPath, dropPosition);
    }

    let index = dropPosition === DragTarget.DROP_ON ? 0 : this.collectionView.getSectionLength(0);
    return new DragTarget('item', new IndexPath(0, index), DragTarget.DROP_BETWEEN);
  }
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
