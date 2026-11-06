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
import {getChildNodes} from '../collections/getChildNodes';
import {InvalidationContext} from '../virtualizer/types';
import {Layout} from '../virtualizer/Layout';
import {LayoutInfo} from '../virtualizer/LayoutInfo';
import {Rect} from '../virtualizer/Rect';
import {Size} from '../virtualizer/Size';

export interface GridLayoutOptions {
  /**
   * The minimum item size.
   *
   * @default 200 x 200
   */
  minItemSize?: Size;
  /**
   * The maximum item size.
   *
   * @default Infinity
   */
  maxItemSize?: Size;
  /**
   * Whether to preserve the aspect ratio of the `minItemSize`.
   * By default, grid rows may have variable heights. When `preserveAspectRatio`
   * is true, all rows will have equal heights.
   *
   * @default false
   */
  preserveAspectRatio?: boolean;
  /**
   * The minimum space required between items.
   *
   * @default 18 x 18
   */
  minSpace?: Size;
  /**
   * The maximum allowed horizontal space between items.
   *
   * @default Infinity
   */
  maxHorizontalSpace?: number;
  /**
   * The maximum number of columns.
   *
   * @default Infinity
   */
  maxColumns?: number;
  /**
   * The thickness of the drop indicator.
   *
   * @default 2
   */
  dropIndicatorThickness?: number;
  /**
   * The fixed height of a loader element in px. This loader is specifically for "load more"
   * elements rendered when loading more rows at the root level or inside nested row/sections.
   *
   * @default 48
   */
  loaderHeight?: number;
  /**
   * The fixed height of a section header in px. Section headers are laid out as
   * full width rows interleaved with the grid items.
   *
   * @default 48
   */
  headingSize?: number;
  /**
   * The estimated height of a section header in px, when heading sizes are variable.
   */
  estimatedHeadingSize?: number;
  /**
   * The layout direction. When `'rtl'`, drop target positions (`'before'`/`'after'`)
   * are computed correctly for right-to-left locales in multi-column grids.
   *
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';
}

const DEFAULT_OPTIONS = {
  minItemSize: new Size(200, 200),
  maxItemSize: new Size(Infinity, Infinity),
  preserveAspectRatio: false,
  minSpace: new Size(18, 18),
  maxSpace: Infinity,
  maxColumns: Infinity,
  dropIndicatorThickness: 2,
  loaderHeight: 48
};

const DEFAULT_HEADING_SIZE = 48;

/**
 * GridLayout is a virtualizer Layout implementation
 * that arranges its items in a grid.
 * The items are sized between a minimum and maximum size
 * depending on the width of the container.
 */
export class GridLayout<T, O extends GridLayoutOptions = GridLayoutOptions>
  extends Layout<Node<T>, O>
  implements DropTargetDelegate
{
  protected gap: Size = DEFAULT_OPTIONS.minSpace;
  protected dropIndicatorThickness = 2;
  protected numColumns: number = 0;
  protected direction: 'ltr' | 'rtl' = 'ltr';
  private contentSize: Size = new Size();
  private layoutInfos: Map<Key, LayoutInfo> = new Map();
  private margin: number = 0;

  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return (
      newOptions.maxColumns !== oldOptions.maxColumns ||
      newOptions.dropIndicatorThickness !== oldOptions.dropIndicatorThickness ||
      newOptions.preserveAspectRatio !== oldOptions.preserveAspectRatio ||
      !(newOptions.minItemSize || DEFAULT_OPTIONS.minItemSize).equals(
        oldOptions.minItemSize || DEFAULT_OPTIONS.minItemSize
      ) ||
      !(newOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize).equals(
        oldOptions.maxItemSize || DEFAULT_OPTIONS.maxItemSize
      ) ||
      !(newOptions.minSpace || DEFAULT_OPTIONS.minSpace).equals(
        oldOptions.minSpace || DEFAULT_OPTIONS.minSpace
      ) ||
      newOptions.maxHorizontalSpace !== oldOptions.maxHorizontalSpace ||
      newOptions.loaderHeight !== oldOptions.loaderHeight ||
      newOptions.headingSize !== oldOptions.headingSize ||
      newOptions.estimatedHeadingSize !== oldOptions.estimatedHeadingSize ||
      newOptions.direction !== oldOptions.direction
    );
  }

  update(invalidationContext: InvalidationContext<O>): void {
    let {
      minItemSize = DEFAULT_OPTIONS.minItemSize,
      maxItemSize = DEFAULT_OPTIONS.maxItemSize,
      preserveAspectRatio = DEFAULT_OPTIONS.preserveAspectRatio,
      minSpace = DEFAULT_OPTIONS.minSpace,
      maxHorizontalSpace = DEFAULT_OPTIONS.maxSpace,
      maxColumns = DEFAULT_OPTIONS.maxColumns,
      dropIndicatorThickness = DEFAULT_OPTIONS.dropIndicatorThickness,
      loaderHeight = DEFAULT_OPTIONS.loaderHeight,
      headingSize = null,
      estimatedHeadingSize = null,
      direction = 'ltr' as const
    } = invalidationContext.layoutOptions || {};
    this.dropIndicatorThickness = dropIndicatorThickness;
    this.direction = direction;

    let virtualizerWidth = this.virtualizer!.size.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(maxItemSize.width, virtualizerWidth);
    let maxItemHeight = Number.isFinite(maxItemSize.height)
      ? maxItemSize.height
      : Math.floor((minItemSize.height / minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(virtualizerWidth / (minItemSize.width + minSpace.width));
    let numColumns = Math.max(1, Math.min(maxColumns, columns));
    this.numColumns = numColumns;

    // Compute the available width (minus the space between items)
    let width = virtualizerWidth - minSpace.width * Math.max(0, numColumns);

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / numColumns);
    itemWidth = Math.max(minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = (itemWidth - minItemSize.width) / Math.max(1, maxItemWidth - minItemSize.width);
    let itemHeight = minItemSize.height + Math.floor((maxItemHeight - minItemSize.height) * t);
    itemHeight = Math.max(minItemSize.height, Math.min(maxItemHeight, itemHeight));

    // Compute the horizontal spacing, content height and horizontal margin
    let horizontalSpacing = Math.min(
      Math.max(maxHorizontalSpace, minSpace.width),
      Math.floor((virtualizerWidth - numColumns * itemWidth) / (numColumns + 1))
    );
    this.gap = new Size(horizontalSpacing, minSpace.height);
    this.margin = Math.floor(
      (virtualizerWidth - numColumns * itemWidth - horizontalSpacing * (numColumns + 1)) / 2
    );

    let collection = this.virtualizer!.collection;
    let y = collection.size > 0 ? minSpace.height : 0;
    let newLayoutInfos = new Map<Key, LayoutInfo>();
    let skeleton: Node<T> | null = null;
    let skeletonCount = 0;

    // The cells in the current (unfinished) row of the grid.
    let rowLayoutInfos: LayoutInfo[] = [];
    // The number of grid slots used in the current row. This can be greater than
    // rowLayoutInfos.length because loaders consume a slot without producing a cell.
    let colIndex = 0;

    let finishRow = () => {
      if (colIndex === 0) {
        return;
      }

      let maxHeight = 0;
      for (let layoutInfo of rowLayoutInfos) {
        maxHeight = Math.max(maxHeight, layoutInfo.rect.height);
      }

      for (let layoutInfo of rowLayoutInfos) {
        layoutInfo.rect.height = maxHeight;
      }

      y += maxHeight + minSpace.height;
      rowLayoutInfos = [];
      colIndex = 0;
    };

    let layoutCell = (node: Node<T>, parentKey: Key | null) => {
      let key = skeleton ? `${skeleton.key}-${skeletonCount++}` : node.key;
      let oldLayoutInfo = this.layoutInfos.get(key);
      let content = node;
      if (skeleton) {
        content =
          oldLayoutInfo && oldLayoutInfo.content.key === key
            ? oldLayoutInfo.content
            : {...skeleton, key};
      }
      let x = horizontalSpacing + colIndex * (itemWidth + horizontalSpacing) + this.margin;
      let height = itemHeight;
      let estimatedSize = !preserveAspectRatio;
      if (oldLayoutInfo && estimatedSize) {
        height = oldLayoutInfo.rect.height;
        estimatedSize =
          invalidationContext.layoutOptionsChanged ||
          invalidationContext.sizeChanged ||
          oldLayoutInfo.estimatedSize ||
          oldLayoutInfo.content !== content;
      }

      let rect = new Rect(x, y, itemWidth, height);
      let layoutInfo = new LayoutInfo(node.type, key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      layoutInfo.content = content;
      layoutInfo.parentKey = parentKey;
      newLayoutInfos.set(key, layoutInfo);
      rowLayoutInfos.push(layoutInfo);
      colIndex++;
      if (colIndex === numColumns) {
        finishRow();
      }
    };

    // Section headers are laid out as full width rows, aligned with the grid content.
    let headerX = this.margin + horizontalSpacing;
    let headerWidth = virtualizerWidth - headerX * 2;

    let layoutHeader = (node: Node<T>, parentKey: Key | null) => {
      finishRow();
      let height = headingSize;
      let estimatedSize = false;
      if (height == null) {
        // If no explicit height is available, reuse the last measured height,
        // or use an estimated height until the actual size is measured.
        let oldLayoutInfo = this.layoutInfos.get(node.key);
        if (oldLayoutInfo) {
          height = oldLayoutInfo.rect.height;
          estimatedSize =
            invalidationContext.layoutOptionsChanged ||
            invalidationContext.sizeChanged ||
            oldLayoutInfo.estimatedSize ||
            oldLayoutInfo.content !== node;
        } else {
          height = node.rendered ? (estimatedHeadingSize ?? DEFAULT_HEADING_SIZE) : 0;
          estimatedSize = true;
        }
      }

      let rect = new Rect(headerX, y, headerWidth, height);
      let layoutInfo = new LayoutInfo('header', node.key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      layoutInfo.content = node;
      layoutInfo.parentKey = parentKey;
      newLayoutInfos.set(node.key, layoutInfo);
      y = rect.maxY + (height > 0 ? minSpace.height : 0);
    };

    let layoutLoader = (node: Node<T>, parentKey: Key | null) => {
      finishRow();
      let height = node.props.isLoading ? loaderHeight : 0;
      let rect = new Rect(headerX, y, headerWidth, height);
      let layoutInfo = new LayoutInfo('loader', node.key, rect);
      layoutInfo.parentKey = parentKey;
      newLayoutInfos.set(node.key, layoutInfo);
      if (height > 0) {
        y = rect.maxY + minSpace.height;
      }
    };

    let layoutSection = (node: Node<T>) => {
      finishRow();
      let sectionY = y;
      let rect = new Rect(0, sectionY, virtualizerWidth, 0);
      let layoutInfo = new LayoutInfo(node.type, node.key, rect);
      layoutInfo.allowOverflow = true;
      // Add the section before its children so the map stays in topological order.
      newLayoutInfos.set(node.key, layoutInfo);

      for (let child of getChildNodes(node, collection)) {
        switch (child.type) {
          case 'header':
            layoutHeader(child, node.key);
            break;
          case 'loader':
            layoutLoader(child, node.key);
            break;
          default:
            layoutCell(child, node.key);
        }
      }

      finishRow();

      // Exclude the trailing gap after the last row from the section height.
      rect.height = Math.max(0, y - minSpace.height - sectionY);
    };

    for (let node of collection) {
      if (node.type === 'section') {
        layoutSection(node);
      } else if (node.type === 'header') {
        layoutHeader(node, null);
      } else if (node.type === 'loader') {
        // The loader is added after all other items, but still consumes a grid slot.
        colIndex++;
        if (colIndex === numColumns) {
          finishRow();
        }
      } else if (node.type === 'skeleton') {
        // Repeat the skeleton in every remaining cell, stopping below.
        skeleton = node;
        break;
      } else {
        layoutCell(node, null);
      }
    }

    if (skeleton) {
      // Fill the remainder of the current row with skeletons, and keep
      // adding skeleton rows until we fill the viewport.
      do {
        layoutCell(skeleton, null);
      } while (colIndex !== 0 || y < this.virtualizer!.size.height);
    } else {
      finishRow();
    }

    // Always add the loader sentinel if present in the collection so we can make sure it is never virtualized out.
    let lastNode = collection.getItem(collection.getLastKey()!);
    if (lastNode?.type === 'loader') {
      if (skeletonCount > 0 || !lastNode.props.isLoading) {
        loaderHeight = 0;
      }
      const loaderWidth = virtualizerWidth - horizontalSpacing * 2;
      // Note that if the user provides isLoading to their sentinel during a case where they only want to render the emptyState, this will reserve
      // room for the loader alongside rendering the emptyState
      let rect = new Rect(horizontalSpacing, y, loaderWidth, loaderHeight);
      let layoutInfo = new LayoutInfo('loader', lastNode.key, rect);
      newLayoutInfos.set(lastNode.key, layoutInfo);
      y = layoutInfo.rect.maxY;
    }

    this.layoutInfos = newLayoutInfos;
    this.contentSize = new Size(this.virtualizer!.size.width, y);
  }

  getLayoutInfo(key: Key): LayoutInfo | null {
    return this.layoutInfos.get(key) || null;
  }

  getContentSize(): Size {
    return this.contentSize;
  }

  getVisibleLayoutInfos(rect: Rect): LayoutInfo[] {
    let layoutInfos: LayoutInfo[] = [];
    // Layout infos within a section are always preceded by their section in the map,
    // so the result stays in topological order (parents before children).
    let visibleSections = new Set<Key>();
    for (let layoutInfo of this.layoutInfos.values()) {
      let isInVisibleSection =
        layoutInfo.parentKey == null || visibleSections.has(layoutInfo.parentKey);
      if (
        layoutInfo.rect.intersects(rect) ||
        this.virtualizer!.isPersistedKey(layoutInfo.key) ||
        // Loaders and section headers are always visible within their section,
        // e.g. to support load more sentinels and sticky headers.
        ((layoutInfo.type === 'loader' || layoutInfo.type === 'header') && isInVisibleSection)
      ) {
        if (layoutInfo.type === 'section') {
          visibleSections.add(layoutInfo.key);
        }
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

  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget {
    if (this.layoutInfos.size === 0) {
      return {type: 'root'};
    }

    x += this.virtualizer!.visibleRect.x;
    y += this.virtualizer!.visibleRect.y;

    // In RTL mode the virtualizer positions items using CSS `right` with the
    // layout rect's x value as the right-offset, but pointer coordinates are
    // in visual (left-origin) space. Flip x so it matches the layout coords.
    if (this.direction === 'rtl' && this.numColumns > 1) {
      x = this.contentSize.width - x;
    }

    // Find the closest item within on either side of the point using the gap width.
    let key: Key | null = null;
    if (this.numColumns === 1) {
      let searchRect = new Rect(
        x,
        Math.max(0, y - this.gap.height),
        1,
        Math.max(1, this.gap.height * 2)
      );
      let candidates = this.getVisibleLayoutInfos(searchRect);
      let minDistance = Infinity;
      for (let candidate of candidates) {
        // Ignore items outside the search rect, e.g. persisted keys,
        // and section/header rows which are not valid drop targets.
        if (
          !candidate.rect.intersects(searchRect) ||
          candidate.type === 'section' ||
          candidate.type === 'header'
        ) {
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
        // Ignore items outside the search rect, e.g. persisted keys,
        // and section/header rows which are not valid drop targets.
        if (
          !candidate.rect.intersects(searchRect) ||
          candidate.type === 'section' ||
          candidate.type === 'header'
        ) {
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

    let target: DropTarget = {
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
