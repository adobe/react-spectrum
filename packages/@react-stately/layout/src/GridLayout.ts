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

import {DropTarget, DropTargetDelegate, ItemDropTarget, Key, Node} from '@react-types/shared';
import {InvalidationContext, Layout, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';

export interface GridLayoutOptions {
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
   * Whether to preserve the aspect ratio of the `minItemSize`.
   * By default, grid rows may have variable heights. When `preserveAspectRatio`
   * is true, all rows will have equal heights.
   * @default false
   */
  preserveAspectRatio?: boolean,
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

const DEFAULT_OPTIONS = {
  minItemSize: new Size(200, 200),
  maxItemSize: new Size(Infinity, Infinity),
  preserveAspectRatio: false,
  minSpace: new Size(18, 18),
  maxSpace: Infinity,
  maxColumns: Infinity,
  dropIndicatorThickness: 2
};

/**
 * GridLayout is a virtualizer Layout implementation
 * that arranges its items in a grid.
 * The items are sized between a minimum and maximum size
 * depending on the width of the container.
 */
export class GridLayout<T, O extends GridLayoutOptions = GridLayoutOptions> extends Layout<Node<T>, O> implements DropTargetDelegate {
  protected gap: Size = DEFAULT_OPTIONS.minSpace;
  protected dropIndicatorThickness = 2;
  protected numColumns: number = 0;
  private contentSize: Size = new Size();
  private layoutInfos: Map<Key, LayoutInfo> = new Map();
  private margin: number = 0;

  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions.maxColumns !== oldOptions.maxColumns
      || newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness
      || newOptions.preserveAspectRatio !== oldOptions.preserveAspectRatio
      || (!(newOptions.minItemSize || DEFAULT_OPTIONS.minItemSize).equals(oldOptions.minItemSize || DEFAULT_OPTIONS.minItemSize))
      || (!(newOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize).equals(oldOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize))
      || (!(newOptions.minSpace || DEFAULT_OPTIONS.minSpace).equals(oldOptions.minSpace || DEFAULT_OPTIONS.minSpace))
      || newOptions.maxHorizontalSpace !== oldOptions.maxHorizontalSpace;
  }

  update(invalidationContext: InvalidationContext<O>): void {
    let {
      minItemSize = DEFAULT_OPTIONS.minItemSize,
      maxItemSize = DEFAULT_OPTIONS.maxItemSize,
      preserveAspectRatio = DEFAULT_OPTIONS.preserveAspectRatio,
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
    this.numColumns = numColumns;

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (minSpace.width * Math.max(0, numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / numColumns);
    itemWidth = Math.max(minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - minItemSize.width) / Math.max(1, maxItemWidth - minItemSize.width));
    let itemHeight = minItemSize.height + Math.floor((maxItemHeight - minItemSize.height) * t);
    itemHeight = Math.max(minItemSize.height, Math.min(maxItemHeight, itemHeight));

    // Compute the horizontal spacing, content height and horizontal margin
    let horizontalSpacing = Math.min(Math.max(maxHorizontalSpace, minSpace.width), Math.floor((visibleWidth - numColumns * itemWidth) / (numColumns + 1)));
    this.gap = new Size(horizontalSpacing, minSpace.height);
    this.margin = Math.floor((visibleWidth - numColumns * itemWidth - horizontalSpacing * (numColumns + 1)) / 2);

    // If there is a skeleton loader within the last 2 items in the collection, increment the collection size
    // so that an additional row is added for the skeletons.
    let collection = this.virtualizer!.collection;
    let collectionSize = collection.size;
    let lastKey = collection.getLastKey();
    for (let i = 0; i < 2 && lastKey != null; i++) {
      let item = collection.getItem(lastKey);
      if (item?.type === 'skeleton') {
        collectionSize++;
        break;
      }
      lastKey = collection.getKeyBefore(lastKey);
    }

    let rows = Math.ceil(collectionSize / numColumns);
    let iterator = collection[Symbol.iterator]();
    let y = rows > 0 ? minSpace.height : 0;
    let newLayoutInfos = new Map();
    let skeleton: Node<T> | null = null;
    let skeletonCount = 0;
    for (let row = 0; row < rows; row++) {
      let maxHeight = 0;
      let rowLayoutInfos: LayoutInfo[] = [];
      for (let col = 0; col < numColumns; col++) {
        // Repeat skeleton until the end of the current row.
        let node = skeleton || iterator.next().value;
        if (!node) {
          break;
        }

        // We will add the loader after the skeletons so skip here
        if (node.type === 'loader') {
          continue;
        }

        if (node.type === 'skeleton') {
          skeleton = node;
        }

        let key = skeleton ? `${skeleton.key}-${skeletonCount++}` : node.key;
        let oldLayoutInfo = this.layoutInfos.get(key);
        let content = node;
        if (skeleton) {
          content = oldLayoutInfo && oldLayoutInfo.content.key === key ? oldLayoutInfo.content : {...skeleton, key};
        }
        let x = horizontalSpacing + col * (itemWidth + horizontalSpacing) + this.margin;
        let height = itemHeight;
        let estimatedSize = !preserveAspectRatio;
        if (oldLayoutInfo && estimatedSize) {
          height = oldLayoutInfo.rect.height;
          estimatedSize = invalidationContext.layoutOptionsChanged || invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize || (oldLayoutInfo.content !== content);
        }

        let rect = new Rect(x, y, itemWidth, height);
        let layoutInfo = new LayoutInfo(node.type, key, rect);
        layoutInfo.estimatedSize = estimatedSize;
        layoutInfo.allowOverflow = true;
        layoutInfo.content = content;
        newLayoutInfos.set(key, layoutInfo);
        rowLayoutInfos.push(layoutInfo);

        maxHeight = Math.max(maxHeight, layoutInfo.rect.height);
      }

      for (let layoutInfo of rowLayoutInfos) {
        layoutInfo.rect.height = maxHeight;
      }

      y += maxHeight + minSpace.height;

      // Keep adding skeleton rows until we fill the viewport
      if (skeleton && row === rows - 1 && y < this.virtualizer!.visibleRect.height) {
        rows++;
      }
    }

    // Always add the loader sentinel if present in the collection so we can make sure it is never virtualized out.
    let lastNode = collection.getItem(collection.getLastKey()!);
    if (lastNode?.type === 'loader') {
      let rect = new Rect(horizontalSpacing, y, itemWidth, 0);
      let layoutInfo = new LayoutInfo('loader', lastNode.key, rect);
      newLayoutInfos.set(lastNode.key, layoutInfo);
    }

    this.layoutInfos = newLayoutInfos;
    this.contentSize = new Size(this.virtualizer!.visibleRect.width, y);
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    return this.layoutInfos.get(key) || null;
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

  getDropTargetFromPoint(x: number, y: number, isValidDropTarget: (target: DropTarget) => boolean): DropTarget {
    if (this.layoutInfos.size === 0) {
      return {type: 'root'};
    }

    x += this.virtualizer!.visibleRect.x;
    y += this.virtualizer!.visibleRect.y;

    // Find the closest item within on either side of the point using the gap width.
    let key: Key | null = null;
    if (this.numColumns === 1) {
      let searchRect = new Rect(x, Math.max(0, y - this.gap.height), 1, Math.max(1, this.gap.height * 2));
      let candidates = this.getVisibleLayoutInfos(searchRect);
      let minDistance = Infinity;
      for (let candidate of candidates) {
        // Ignore items outside the search rect, e.g. persisted keys.
        if (!candidate.rect.intersects(searchRect)) {
          continue;
        }

        let yDist = Math.abs(candidate.rect.y - y);
        let maxYDist = Math.abs(candidate.rect.maxY - y);
        let dist = Math.min(yDist, maxYDist);
        if (dist < minDistance) {
          minDistance = dist;
          key = candidate.key;
        }
      }
    } else {
      let searchRect = new Rect(Math.max(0, x - this.gap.width), y, this.gap.width * 2, 1);
      let candidates = this.getVisibleLayoutInfos(searchRect);
      let minDistance = Infinity;
      for (let candidate of candidates) {
        // Ignore items outside the search rect, e.g. persisted keys.
        if (!candidate.rect.intersects(searchRect)) {
          continue;
        }

        let xDist = Math.abs(candidate.rect.x - x);
        let maxXDist = Math.abs(candidate.rect.maxX - x);
        let dist = Math.min(xDist, maxXDist);
        if (dist < minDistance) {
          minDistance = dist;
          key = candidate.key;
        }
      }
    }

    let layoutInfo = key != null ? this.getLayoutInfo(key) : null;
    if (!layoutInfo) {
      return {type: 'root'};
    }

    let target: DropTarget =  {
      type: 'item',
      key: layoutInfo.key,
      dropPosition: 'on'
    };

    let pos = this.numColumns === 1 ? y : x;
    let layoutInfoPos = this.numColumns === 1 ? layoutInfo.rect.y : layoutInfo.rect.x;
    let size = this.numColumns === 1 ? layoutInfo.rect.height : layoutInfo.rect.width;
    if (isValidDropTarget(target)) {
      // If dropping on the item is accepted, try the before/after positions
      // if within 5px of the start or end of the item.
      if (pos < layoutInfoPos + 5) {
        target.dropPosition = 'before';
      } else if (pos > layoutInfoPos + size - 5) {
        target.dropPosition = 'after';
      }
    } else {
      // If dropping on the item isn't accepted, try the target before or after depending on the position.
      let mid = layoutInfoPos + size / 2;
      if (pos <= mid && isValidDropTarget({...target, dropPosition: 'before'})) {
        target.dropPosition = 'before';
      } else if (pos >= mid && isValidDropTarget({...target, dropPosition: 'after'})) {
        target.dropPosition = 'after';
      }
    }

    return target;
  }

  getDropTargetLayoutInfo(target: ItemDropTarget): LayoutInfo {
    let layoutInfo = this.getLayoutInfo(target.key)!;
    let rect: Rect;
    if (this.numColumns === 1) {
      // Flip from vertical to horizontal if only one column is visible.
      rect = new Rect(
        layoutInfo.rect.x,
        target.dropPosition === 'before'
          ? layoutInfo.rect.y - this.gap.height / 2 - this.dropIndicatorThickness / 2
          : layoutInfo.rect.maxY + this.gap.height / 2 - this.dropIndicatorThickness / 2,
        layoutInfo.rect.width,
        this.dropIndicatorThickness
      );
    } else {
      rect = new Rect(
        target.dropPosition === 'before'
          ? layoutInfo.rect.x - this.gap.width / 2 - this.dropIndicatorThickness / 2
          : layoutInfo.rect.maxX + this.gap.width / 2 - this.dropIndicatorThickness / 2,
        layoutInfo.rect.y,
        this.dropIndicatorThickness,
        layoutInfo.rect.height
      );
    }

    return new LayoutInfo('dropIndicator', target.key + ':' + target.dropPosition, rect);
  }
}
