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

import {
  GridList as AriaGridList,
  GridLayoutOptions,
  GridListItem,
  GridListProps,
  UNSTABLE_Virtualizer
} from 'react-aria-components';
import {CardContext, CardViewContext} from './Card';
import {ImageCoordinator} from './ImageCoordinator';
import {Key, Node} from '@react-types/shared';
import {Layout, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useLoadMore} from '@react-aria/utils';
import {useMemo, useRef} from 'react';

export interface CardViewProps<T> extends Omit<GridListProps<T>, 'layout' | 'keyboardNavigationBehavior'> {
  layout?: 'grid' | 'waterfall',
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  density?: 'compact' | 'regular' | 'spacious',
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quiet',
  isLoading?: boolean,
  onLoadMore?: () => void
}

class FlexibleGridLayout<T extends object, O> extends Layout<Node<T>, O> {
  protected minItemSize: Size;
  protected maxItemSize: Size;
  protected minSpace: Size;
  protected maxColumns: number;
  protected dropIndicatorThickness: number;
  protected itemSize: Size = new Size();
  protected numColumns: number = 0;
  protected horizontalSpacing: number = 0;
  protected contentSize: Size = new Size();
  protected layoutInfos: Map<Key, LayoutInfo> = new Map();

  constructor(options: GridLayoutOptions) {
    super();
    this.minItemSize = options.minItemSize || new Size(200, 200);
    this.maxItemSize = options.maxItemSize || new Size(Infinity, Infinity);
    this.minSpace = options.minSpace || new Size(18, 18);
    this.maxColumns = options.maxColumns || Infinity;
    this.dropIndicatorThickness = options.dropIndicatorThickness || 2;
  }

  update(invalidationContext): void {
    let visibleWidth = this.virtualizer.visibleRect.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(this.maxItemSize.width, visibleWidth);
    let maxItemHeight = Number.isFinite(this.maxItemSize.height) 
      ? this.maxItemSize.height
      : Math.floor((this.minItemSize.height / this.minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(visibleWidth / (this.minItemSize.width + this.minSpace.width));
    this.numColumns = Math.max(1, Math.min(this.maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (this.minSpace.width * Math.max(0, this.numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / this.numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / Math.max(1, maxItemWidth - this.minItemSize.width));
    let itemHeight = this.minItemSize.height +  Math.floor((maxItemHeight - this.minItemSize.height) * t);
    itemHeight = Math.max(this.minItemSize.height, Math.min(maxItemHeight, itemHeight));    

    // Compute the horizontal spacing and content height
    this.horizontalSpacing = Math.floor((visibleWidth - this.numColumns * itemWidth) / (this.numColumns + 1));

    let rows = Math.ceil(this.virtualizer.collection.size / this.numColumns);
    let iterator = this.virtualizer.collection[Symbol.iterator]();
    let y = this.minSpace.height;
    for (let row = 0; row < rows; row++) {
      let maxHeight = 0;
      let rowLayoutInfos: LayoutInfo[] = [];
      for (let col = 0; col < this.numColumns; col++) {
        let node = iterator.next().value;
        if (!node) {
          break;
        }

        let x = this.horizontalSpacing + col * (itemWidth + this.horizontalSpacing);
        let oldLayoutInfo = this.layoutInfos.get(node.key);
        let height = itemHeight;
        let estimatedSize = true;
        if (oldLayoutInfo) {
          height = oldLayoutInfo.rect.height;
          estimatedSize = invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize;
        }

        let rect = new Rect(x, y, itemWidth, height);
        let layoutInfo = new LayoutInfo('item', node.key, rect);
        layoutInfo.estimatedSize = estimatedSize;
        layoutInfo.allowOverflow = true;
        this.layoutInfos.set(node.key, layoutInfo);
        rowLayoutInfos.push(layoutInfo);

        maxHeight = Math.max(maxHeight, rect.height);
      }

      for (let layoutInfo of rowLayoutInfos) {
        layoutInfo.rect.height = maxHeight;
      }

      y += maxHeight + this.minSpace.height;
    }

    this.contentSize = new Size(this.virtualizer.visibleRect.width, y);
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
      if (layoutInfo.rect.intersects(rect) || this.virtualizer.isPersistedKey(layoutInfo.key)) {
        layoutInfos.push(layoutInfo);
      }
    }
    return layoutInfos;
  }

  updateItemSize(key: Key, size: Size) {
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
}

class WaterfallLayout<T extends object, O> extends Layout<Node<T>, O> {
  protected minItemSize: Size;
  protected maxItemSize: Size;
  protected minSpace: Size;
  protected maxColumns: number;
  protected dropIndicatorThickness: number;
  protected itemSize: Size = new Size();
  protected numColumns: number = 0;
  protected horizontalSpacing: number = 0;
  protected contentSize: Size = new Size();
  protected layoutInfos: Map<Key, LayoutInfo> = new Map();

  constructor(options: GridLayoutOptions) {
    super();
    this.minItemSize = options.minItemSize || new Size(200, 200);
    this.maxItemSize = options.maxItemSize || new Size(Infinity, Infinity);
    this.minSpace = options.minSpace || new Size(18, 18);
    this.maxColumns = options.maxColumns || Infinity;
    this.dropIndicatorThickness = options.dropIndicatorThickness || 2;
  }

  update(invalidationContext): void {
    let visibleWidth = this.virtualizer.visibleRect.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(this.maxItemSize.width, visibleWidth);
    let maxItemHeight = Number.isFinite(this.maxItemSize.height) 
      ? this.maxItemSize.height
      : Math.floor((this.minItemSize.height / this.minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(visibleWidth / (this.minItemSize.width + this.minSpace.width));
    this.numColumns = Math.max(1, Math.min(this.maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (this.minSpace.width * Math.max(0, this.numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / this.numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / Math.max(1, maxItemWidth - this.minItemSize.width));
    let itemHeight = this.minItemSize.height +  Math.floor((maxItemHeight - this.minItemSize.height) * t);
    itemHeight = Math.max(this.minItemSize.height, Math.min(maxItemHeight, itemHeight));    

    // Compute the horizontal spacing and content height
    this.horizontalSpacing = Math.floor((visibleWidth - this.numColumns * itemWidth) / (this.numColumns + 1));

    // Setup an array of column heights
    let columnHeights = Array(this.numColumns).fill(this.minSpace.height);
    for (let node of this.virtualizer.collection) {
      let key = node.key;
      let oldLayoutInfo = this.layoutInfos.get(key);
      let height = itemHeight;
      let estimatedSize = true;
      if (oldLayoutInfo) {
        height = oldLayoutInfo.rect.height;
        estimatedSize = invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize;
      } /* else if (node.props.width && node.props.height) {
        let nodeWidth = node.props.width;
        let nodeHeight = node.props.height;
        let scaledHeight = Math.round(nodeHeight * ((itemWidth) / nodeWidth));
        // height = Math.max(this.minItemSize.height, Math.min(this.maxItemSize.height, scaledHeight));
        height = scaledHeight;
        console.log(nodeWidth, nodeHeight, scaledHeight)
      }*/

      // Figure out which column to place the item in, and compute its position.
      let column = columnHeights.reduce((minIndex, h, i) => h < columnHeights[minIndex] ? i : minIndex, 0);
      let x = this.horizontalSpacing + column * (itemWidth + this.horizontalSpacing);
      let y = columnHeights[column];

      let rect = new Rect(x, y, itemWidth, height);
      let layoutInfo = new LayoutInfo(node.type, key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      this.layoutInfos.set(key, layoutInfo);

      columnHeights[column] += layoutInfo.rect.height + this.minSpace.height;
    }

    // Reset all columns to the maximum for the next section
    let maxHeight = Math.max(...columnHeights);
    this.contentSize = new Size(this.virtualizer.visibleRect.width, maxHeight);
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
      if (layoutInfo.rect.intersects(rect) || this.virtualizer.isPersistedKey(layoutInfo.key)) {
        layoutInfos.push(layoutInfo);
      }
    }
    return layoutInfos;
  }

  updateItemSize(key: Key, size: Size) {
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
}

const layoutOptions = {
  XS: {
    compact: {
      minSpace: new Size(6, 6),
      minItemSize: new Size(100, 100),
      maxItemSize: new Size(140, 140)
    },
    regular: {
      minSpace: new Size(8, 8),
      minItemSize: new Size(100, 100),
      maxItemSize: new Size(140, 140)
    },
    spacious: {
      minSpace: new Size(12, 12),
      minItemSize: new Size(100, 100),
      maxItemSize: new Size(140, 140)
    }
  },
  S: {
    compact: {
      minSpace: new Size(8, 8),
      minItemSize: new Size(150, 150),
      maxItemSize: new Size(210, 210)
    },
    regular: {
      minSpace: new Size(12, 12),
      minItemSize: new Size(150, 150),
      maxItemSize: new Size(210, 210)
    },
    spacious: {
      minSpace: new Size(16, 16),
      minItemSize: new Size(150, 150),
      maxItemSize: new Size(210, 210)
    }
  },
  M: {
    compact: {
      minSpace: new Size(12, 12),
      minItemSize: new Size(200, 200),
      maxItemSize: new Size(280, 280)
    },
    regular: {
      minSpace: new Size(16, 16),
      minItemSize: new Size(200, 200),
      maxItemSize: new Size(280, 280)
    },
    spacious: {
      minSpace: new Size(20, 20),
      minItemSize: new Size(200, 200),
      maxItemSize: new Size(280, 280)
    }
  },
  L: {
    compact: {
      minSpace: new Size(16, 16),
      minItemSize: new Size(270, 270),
      maxItemSize: new Size(370, 370)
    },
    regular: {
      minSpace: new Size(20, 20),
      minItemSize: new Size(270, 270),
      maxItemSize: new Size(370, 370)
    },
    spacious: {
      minSpace: new Size(24, 24),
      minItemSize: new Size(270, 270),
      maxItemSize: new Size(370, 370)
    }
  },
  XL: {
    compact: {
      minSpace: new Size(20, 20),
      minItemSize: new Size(340, 340),
      maxItemSize: new Size(460, 460)
    },
    regular: {
      minSpace: new Size(24, 24),
      minItemSize: new Size(340, 340),
      maxItemSize: new Size(460, 460)
    },
    spacious: {
      minSpace: new Size(28, 28),
      minItemSize: new Size(340, 340),
      maxItemSize: new Size(460, 460)
    }
  }
};

export function CardView<T extends object>(props: CardViewProps<T>) {
  let {children, layout: layoutName = 'grid', size = 'M', density = 'regular', variant = 'primary', ...otherProps} = props;
  let options = layoutOptions[size][density];
  let layout = useMemo(() => {
    variant; // needed to invalidate useMemo
    return layoutName === 'waterfall' ? new WaterfallLayout(options) : new FlexibleGridLayout(options);
  }, [options, variant, layoutName]);

  let ref = useRef(null);
  useLoadMore({
    isLoading: props.isLoading,
    items: props.items,
    onLoadMore: props.onLoadMore
  }, ref);

  return (
    <UNSTABLE_Virtualizer layout={layout}>
      <CardViewContext.Provider value={GridListItem}>
        <CardContext.Provider value={{size, variant}}>
          <ImageCoordinator>
            <AriaGridList ref={ref} {...otherProps} layout="grid" className={style({scrollPadding: '[18px]'})}>
              {children}
            </AriaGridList>
          </ImageCoordinator>
        </CardContext.Provider>
      </CardViewContext.Provider>
    </UNSTABLE_Virtualizer>
  );
}
