/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DropTarget, DropTargetDelegate, Key, LayoutDelegate, Node} from '@react-types/shared';
import {InvalidationContext, Layout, LayoutInfo, Point, Rect, Size} from '@react-stately/virtualizer';

export interface WaterfallLayoutOptions {
  /**
   * The minimum item size.
   * @default 200 x 200
   */
  minItemSize?: Size,
  /**
   * The maximum item size.
   * @default Infinity
   */
  maxItemSize?: Size,
  /**
   * The minimum space required between items.
   * @default 18 x 18
   */
  minSpace?: Size,
  /**
   * The maximum allowed horizontal space between items.
   * @default Infinity
   */
  maxHorizontalSpace?: number,
  /**
   * The maximum number of columns.
   * @default Infinity
   */
  maxColumns?: number,
  /**
   * The thickness of the drop indicator.
   * @default 2
   */
  dropIndicatorThickness?: number
}

class WaterfallLayoutInfo extends LayoutInfo {
  column = 0;

  copy(): WaterfallLayoutInfo {
    let res = super.copy() as WaterfallLayoutInfo;
    res.column = this.column;
    return res;
  }
}

const DEFAULT_OPTIONS = {
  minItemSize: new Size(200, 200),
  maxItemSize: new Size(Infinity, Infinity),
  minSpace: new Size(18, 18),
  maxSpace: Infinity,
  maxColumns: Infinity,
  dropIndicatorThickness: 2
};

export class WaterfallLayout<T extends object, O extends WaterfallLayoutOptions = WaterfallLayoutOptions> extends Layout<Node<T>, O> implements LayoutDelegate, DropTargetDelegate {
  private contentSize: Size = new Size();
  private layoutInfos: Map<Key, WaterfallLayoutInfo> = new Map();
  protected numColumns = 0;
  protected dropIndicatorThickness = 2;
  private margin: number = 0;

  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions.maxColumns !== oldOptions.maxColumns
      || newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness
      || (!(newOptions.minItemSize || DEFAULT_OPTIONS.minItemSize).equals(oldOptions.minItemSize || DEFAULT_OPTIONS.minItemSize))
      || (!(newOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize).equals(oldOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize))
      || (!(newOptions.minSpace || DEFAULT_OPTIONS.minSpace).equals(oldOptions.minSpace || DEFAULT_OPTIONS.minSpace))
      || (newOptions.maxHorizontalSpace !== oldOptions.maxHorizontalSpace);
  }

  update(invalidationContext: InvalidationContext<O>): void {
    let {
      minItemSize = DEFAULT_OPTIONS.minItemSize,
      maxItemSize = DEFAULT_OPTIONS.maxItemSize,
      minSpace = DEFAULT_OPTIONS.minSpace,
      maxHorizontalSpace = DEFAULT_OPTIONS.maxSpace,
      maxColumns = DEFAULT_OPTIONS.maxColumns,
      dropIndicatorThickness = DEFAULT_OPTIONS.dropIndicatorThickness
    } = invalidationContext.layoutOptions || {};
    this.dropIndicatorThickness = dropIndicatorThickness;
    let visibleWidth = this.virtualizer!.visibleRect.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(maxItemSize.width, visibleWidth);
    let maxItemHeight = Number.isFinite(maxItemSize.height)
      ? maxItemSize.height
      : Math.floor((minItemSize.height / minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(visibleWidth / (minItemSize.width + minSpace.width));
    let numColumns = Math.max(1, Math.min(maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (minSpace.width * Math.max(0, numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / numColumns);
    itemWidth = Math.max(minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - minItemSize.width) / Math.max(1, maxItemWidth - minItemSize.width));
    let itemHeight = minItemSize.height +  Math.floor((maxItemHeight - minItemSize.height) * t);
    itemHeight = Math.max(minItemSize.height, Math.min(maxItemHeight, itemHeight));

    // Compute the horizontal spacing, content height and horizontal margin
    let horizontalSpacing = Math.min(Math.max(maxHorizontalSpace, minSpace.width), Math.floor((visibleWidth - numColumns * itemWidth) / (numColumns + 1)));
    this.margin = Math.floor((visibleWidth - numColumns * itemWidth - horizontalSpacing * (numColumns + 1)) / 2);

    // Setup an array of column heights
    let columnHeights = Array(numColumns).fill(minSpace.height);
    let newLayoutInfos = new Map();
    let addNode = (key: Key, node: Node<T>) => {
      let oldLayoutInfo = this.layoutInfos.get(key);
      let height = itemHeight;
      let estimatedSize = true;
      if (oldLayoutInfo) {
        height = oldLayoutInfo.rect.height;
        estimatedSize = invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize || oldLayoutInfo.content !== node;
      }

      // Figure out which column to place the item in, and compute its position.
      // Preserve the previous column index so items don't jump around during resizing unless the number of columns changed.
      let prevColumn = numColumns === this.numColumns && oldLayoutInfo && oldLayoutInfo.rect.y < this.virtualizer!.visibleRect.maxY ? oldLayoutInfo.column : undefined;
      let column = prevColumn ?? columnHeights.reduce((minIndex, h, i) => h < columnHeights[minIndex] ? i : minIndex, 0);
      let x = horizontalSpacing + column * (itemWidth + horizontalSpacing) + this.margin;
      let y = columnHeights[column];

      let rect = new Rect(x, y, itemWidth, height);
      let layoutInfo = new WaterfallLayoutInfo(node.type, key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      layoutInfo.content = node;
      layoutInfo.column = column;
      newLayoutInfos.set(key, layoutInfo);

      columnHeights[column] += layoutInfo.rect.height + minSpace.height;
    };

    let collection = this.virtualizer!.collection;
    let skeletonCount = 0;
    for (let node of collection) {
      if (node.type === 'skeleton') {
        // Add skeleton cards until every column has at least one, and we fill the viewport.
        let startingHeights = [...columnHeights];
        while (
          !columnHeights.every((h, i) => h !== startingHeights[i]) ||
          Math.min(...columnHeights) < this.virtualizer!.visibleRect.height
        ) {
          let key = `${node.key}-${skeletonCount++}`;
          let content = this.layoutInfos.get(key)?.content || {...node};
          addNode(key, content);
        }
        break;
      } else if (node.type !== 'loader') {
        addNode(node.key, node);
      }
    }

    // Always add the loader sentinel if present in the collection so we can make sure it is never virtualized out.
    // Add it under the first column for simplicity
    let lastNode = collection.getItem(collection.getLastKey()!);
    if (lastNode?.type === 'loader') {
      let rect = new Rect(horizontalSpacing, columnHeights[0], itemWidth, 0);
      let layoutInfo = new LayoutInfo('loader', lastNode.key, rect);
      newLayoutInfos.set(lastNode.key, layoutInfo);
    }

    // Reset all columns to the maximum for the next section. If loading, set to 0 so virtualizer doesn't render its body since there aren't items to render,
    // except if we are performing skeleton loading
    let isEmptyOrLoading = collection?.size === 0 && collection.getItem(collection.getFirstKey()!)?.type !== 'skeleton';
    let maxHeight = isEmptyOrLoading ? 0 : Math.max(...columnHeights);
    this.contentSize = new Size(this.virtualizer!.visibleRect.width, maxHeight);
    this.layoutInfos = newLayoutInfos;
    this.numColumns = numColumns;
  }

  getLayoutInfo(key: Key): LayoutInfo {
    return this.layoutInfos.get(key)!;
  }

  getContentSize(): Size {
    return this.contentSize;
  }

  getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    let layoutInfos: LayoutInfo[] = [];
    for (let layoutInfo of this.layoutInfos.values()) {
      if (layoutInfo.rect.intersects(rect) || this.virtualizer!.isPersistedKey(layoutInfo.key) || layoutInfo.type === 'loader') {
        layoutInfos.push(layoutInfo);
      }
    }
    return layoutInfos;
  }

  updateItemSize(key: Key, size: Size): boolean {
    let layoutInfo = this.layoutInfos.get(key);
    if (!size || !layoutInfo) {
      return false;
    }

    if (size.height !== layoutInfo.rect.height) {
      let newLayoutInfo = layoutInfo.copy();
      newLayoutInfo.rect.height = size.height;
      newLayoutInfo.estimatedSize = false;
      this.layoutInfos.set(key, newLayoutInfo);
      return true;
    }

    return false;
  }

  // Override keyboard navigation to work spatially.
  getKeyRightOf(key: Key): Key | null {
    let layoutInfo = this.getLayoutInfo(key);
    if (!layoutInfo) {
      return null;
    }

    let rect = new Rect(layoutInfo.rect.maxX, layoutInfo.rect.y, this.virtualizer!.visibleRect.maxX - layoutInfo.rect.maxX, layoutInfo.rect.height);
    let layoutInfos = this.getVisibleLayoutInfos(rect);
    let bestKey: Key | null = null;
    let bestDistance = Infinity;
    for (let candidate of layoutInfos) {
      if (candidate.key === key) {
        continue;
      }

      // Find the closest item in the x direction with the most overlap in the y direction.
      let deltaX = candidate.rect.x - rect.x;
      let overlapY = Math.min(candidate.rect.maxY, rect.maxY) - Math.max(candidate.rect.y, rect.y);
      let distance = deltaX - overlapY;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestKey = candidate.key;
      }
    }

    return bestKey;
  }

  getKeyLeftOf(key: Key): Key | null {
    let layoutInfo = this.getLayoutInfo(key);
    if (!layoutInfo) {
      return null;
    }

    let rect = new Rect(0, layoutInfo.rect.y, layoutInfo.rect.x, layoutInfo.rect.height);
    let layoutInfos = this.getVisibleLayoutInfos(rect);
    let bestKey: Key | null = null;
    let bestDistance = Infinity;
    for (let candidate of layoutInfos) {
      if (candidate.key === key) {
        continue;
      }

      // Find the closest item in the x direction with the most overlap in the y direction.
      let deltaX = rect.maxX - candidate.rect.maxX;
      let overlapY = Math.min(candidate.rect.maxY, rect.maxY) - Math.max(candidate.rect.y, rect.y);
      let distance = deltaX - overlapY;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestKey = candidate.key;
      }
    }

    return bestKey;
  }

  // This overrides the default behavior of shift selection to work spatially
  // rather than following the order of the items in the collection (which may appear unpredictable).
  getKeyRange(from: Key, to: Key): Key[] {
    let fromLayoutInfo = this.getLayoutInfo(from);
    let toLayoutInfo = this.getLayoutInfo(to);
    if (!fromLayoutInfo || !toLayoutInfo) {
      return [];
    }

    // Find items where half of the area intersects the rectangle
    // formed from the first item to the last item in the range.
    let rect = fromLayoutInfo.rect.union(toLayoutInfo.rect);
    let keys: Key[] = [];
    for (let layoutInfo of this.layoutInfos.values()) {
      if (rect.intersection(layoutInfo.rect).area > layoutInfo.rect.area / 2) {
        keys.push(layoutInfo.key);
      }
    }
    return keys;
  }

  getDropTargetFromPoint(x: number, y: number): DropTarget {
    if (this.layoutInfos.size === 0) {
      return {type: 'root'};
    }

    x += this.virtualizer!.visibleRect.x;
    y += this.virtualizer!.visibleRect.y;
    let key = this.virtualizer!.keyAtPoint(new Point(x, y));
    if (key == null) {
      return {type: 'root'};
    }

    // Only support "on" drop position in waterfall layout.
    // Reordering doesn't make sense because the items don't have a deterministic order.
    return {
      type: 'item',
      key,
      dropPosition: 'on'
    };
  }
}
