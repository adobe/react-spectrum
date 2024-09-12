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
import {focusRing, getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {ImageCoordinator} from './ImageCoordinator';
import {InvalidationContext, Layout, LayoutInfo, Rect, Size} from '@react-stately/virtualizer';
import {Key, LoadingState, Node} from '@react-types/shared';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useLoadMore} from '@react-aria/utils';
import {useMemo, useRef} from 'react';

export interface CardViewProps<T> extends Omit<GridListProps<T>, 'layout' | 'keyboardNavigationBehavior' | 'selectionBehavior' | 'className' | 'style'>, UnsafeStyles {
  /**
   * The layout of the cards.
   * @default 'grid'
   */
  layout?: 'grid' | 'waterfall',
  /**
   * The size of the cards.
   * @default 'M'
   */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the cards.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /**
   * The visual style of the cards.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quiet',
  /**
   * How selection should be displayed.
   * @default 'checkbox'
   */
  selectionStyle?: 'checkbox' | 'highlight',
  /** The loading state of the CardView. */
  loadingState?: LoadingState,
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => void,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

class FlexibleGridLayout<T extends object, O> extends Layout<Node<T>, O> {
  protected minItemSize: Size;
  protected maxItemSize: Size;
  protected minSpace: Size;
  protected maxColumns: number;
  protected dropIndicatorThickness: number;
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

  update(invalidationContext: InvalidationContext): void {
    let visibleWidth = this.virtualizer.visibleRect.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(this.maxItemSize.width, visibleWidth);
    let maxItemHeight = Number.isFinite(this.maxItemSize.height) 
      ? this.maxItemSize.height
      : Math.floor((this.minItemSize.height / this.minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(visibleWidth / (this.minItemSize.width + this.minSpace.width));
    let numColumns = Math.max(1, Math.min(this.maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (this.minSpace.width * Math.max(0, numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / Math.max(1, maxItemWidth - this.minItemSize.width));
    let itemHeight = this.minItemSize.height +  Math.floor((maxItemHeight - this.minItemSize.height) * t);
    itemHeight = Math.max(this.minItemSize.height, Math.min(maxItemHeight, itemHeight));    

    // Compute the horizontal spacing and content height
    let horizontalSpacing = Math.floor((visibleWidth - numColumns * itemWidth) / (numColumns + 1));

    let rows = Math.ceil(this.virtualizer.collection.size / numColumns);
    let iterator = this.virtualizer.collection[Symbol.iterator]();
    let y = rows > 0 ? this.minSpace.height : 0;
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

        if (node.type === 'skeleton') {
          skeleton = node;
        }

        let key = skeleton ? `${skeleton.key}-${skeletonCount++}` : node.key;
        let x = horizontalSpacing + col * (itemWidth + horizontalSpacing);
        let oldLayoutInfo = this.layoutInfos.get(key);
        let height = itemHeight;
        let estimatedSize = true;
        if (oldLayoutInfo) {
          height = oldLayoutInfo.rect.height;
          estimatedSize = invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize;
        }

        let rect = new Rect(x, y, itemWidth, height);
        let layoutInfo = new LayoutInfo(node.type, key, rect);
        layoutInfo.estimatedSize = estimatedSize;
        layoutInfo.allowOverflow = true;
        if (skeleton) {
          layoutInfo.content = {...skeleton};
        }
        newLayoutInfos.set(key, layoutInfo);
        rowLayoutInfos.push(layoutInfo);

        maxHeight = Math.max(maxHeight, rect.height);
      }

      for (let layoutInfo of rowLayoutInfos) {
        layoutInfo.rect.height = maxHeight;
      }

      y += maxHeight + this.minSpace.height;

      // Keep adding skeleton rows until we fill the viewport
      if (skeleton && row === rows - 1 && y < this.virtualizer.visibleRect.height) {
        rows++;
      }
    }

    this.layoutInfos = newLayoutInfos;
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

  update(invalidationContext: InvalidationContext): void {
    let visibleWidth = this.virtualizer.visibleRect.width;

    // The max item width is always the entire viewport.
    // If the max item height is infinity, scale in proportion to the max width.
    let maxItemWidth = Math.min(this.maxItemSize.width, visibleWidth);
    let maxItemHeight = Number.isFinite(this.maxItemSize.height) 
      ? this.maxItemSize.height
      : Math.floor((this.minItemSize.height / this.minItemSize.width) * maxItemWidth);

    // Compute the number of rows and columns needed to display the content
    let columns = Math.floor(visibleWidth / (this.minItemSize.width + this.minSpace.width));
    let numColumns = Math.max(1, Math.min(this.maxColumns, columns));

    // Compute the available width (minus the space between items)
    let width = visibleWidth - (this.minSpace.width * Math.max(0, numColumns));

    // Compute the item width based on the space available
    let itemWidth = Math.floor(width / numColumns);
    itemWidth = Math.max(this.minItemSize.width, Math.min(maxItemWidth, itemWidth));

    // Compute the item height, which is proportional to the item width
    let t = ((itemWidth - this.minItemSize.width) / Math.max(1, maxItemWidth - this.minItemSize.width));
    let itemHeight = this.minItemSize.height +  Math.floor((maxItemHeight - this.minItemSize.height) * t);
    itemHeight = Math.max(this.minItemSize.height, Math.min(maxItemHeight, itemHeight));    

    // Compute the horizontal spacing and content height
    let horizontalSpacing = Math.floor((visibleWidth - numColumns * itemWidth) / (numColumns + 1));

    // Setup an array of column heights
    let columnHeights = Array(numColumns).fill(this.minSpace.height);
    let newLayoutInfos = new Map();
    let addNode = (key, node) => {
      let oldLayoutInfo = this.layoutInfos.get(key);
      let height = itemHeight;
      let estimatedSize = true;
      if (oldLayoutInfo) {
        height = oldLayoutInfo.rect.height;
        estimatedSize = invalidationContext.sizeChanged || oldLayoutInfo.estimatedSize;
      }

      // Figure out which column to place the item in, and compute its position.
      let column = columnHeights.reduce((minIndex, h, i) => h < columnHeights[minIndex] ? i : minIndex, 0);
      let x = horizontalSpacing + column * (itemWidth + horizontalSpacing);
      let y = columnHeights[column];

      let rect = new Rect(x, y, itemWidth, height);
      let layoutInfo = new LayoutInfo(node.type, key, rect);
      layoutInfo.estimatedSize = estimatedSize;
      layoutInfo.allowOverflow = true;
      newLayoutInfos.set(key, layoutInfo);

      columnHeights[column] += layoutInfo.rect.height + this.minSpace.height;
      return layoutInfo;
    };

    let skeletonCount = 0;
    for (let node of this.virtualizer.collection) {
      if (node.type === 'skeleton') {
        // Add skeleton cards until every column has at least one, and we fill the viewport.
        let startingHeights = [...columnHeights];
        while (
          !columnHeights.every((h, i) => h !== startingHeights[i]) ||
          Math.min(...columnHeights) < this.virtualizer.visibleRect.height
        ) {
          let layoutInfo = addNode(`${node.key}-${skeletonCount++}`, node);
          layoutInfo.content = this.layoutInfos.get(layoutInfo.key)?.content || {...node};
        }
        break;
      } else {
        addNode(node.key, node);
      }
    }

    // Reset all columns to the maximum for the next section
    let maxHeight = Math.max(...columnHeights);
    this.contentSize = new Size(this.virtualizer.visibleRect.width, maxHeight);
    this.layoutInfos = newLayoutInfos;
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

  // Override keyboard navigation to work spacially.
  getKeyRightOf(key: Key): Key | null {
    let layoutInfo = this.getLayoutInfo(key);
    if (!layoutInfo) {
      return null;
    }

    let rect = new Rect(layoutInfo.rect.maxX, layoutInfo.rect.y, this.virtualizer.visibleRect.maxX - layoutInfo.rect.maxX, layoutInfo.rect.height);
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

const cardViewStyles = style({
  overflowY: {
    default: 'auto',
    isLoading: 'hidden'
  },
  display: {
    isEmpty: 'flex'
  },
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  ...focusRing(),
  outlineStyle: {
    default: 'none',
    isEmpty: {
      isFocusVisible: 'solid'
    }
  },
  outlineOffset: -2
}, getAllowedOverrides({height: true}));

export function CardView<T extends object>(props: CardViewProps<T>) {
  let {children, layout: layoutName = 'grid', size = 'M', density = 'regular', variant = 'primary', selectionStyle = 'checkbox', UNSAFE_className = '', UNSAFE_style, styles, ...otherProps} = props;
  let options = layoutOptions[size][density];
  let layout = useMemo(() => {
    variant; // needed to invalidate useMemo
    return layoutName === 'waterfall' ? new WaterfallLayout(options) : new FlexibleGridLayout(options);
  }, [options, variant, layoutName]);

  let ref = useRef(null);
  useLoadMore({
    isLoading: props.loadingState !== 'idle' && props.loadingState !== 'error',
    items: props.items, // TODO: ideally this would be the collection. items won't exist for static collections, or those using <Collection>
    onLoadMore: props.onLoadMore
  }, ref);

  return (
    <UNSTABLE_Virtualizer layout={layout}>
      <CardViewContext.Provider value={GridListItem}>
        <CardContext.Provider value={{size, variant}}>
          <ImageCoordinator>
            <AriaGridList
              ref={ref}
              {...otherProps}
              layout="grid"
              selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
              style={{
                ...UNSAFE_style,
                scrollPadding: options.minSpace.height
              }}
              className={renderProps => UNSAFE_className + cardViewStyles({...renderProps, isLoading: props.loadingState === 'loading'}, styles)}>
              {children}
            </AriaGridList>
          </ImageCoordinator>
        </CardContext.Provider>
      </CardViewContext.Provider>
    </UNSTABLE_Virtualizer>
  );
}
