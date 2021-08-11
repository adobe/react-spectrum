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

export type WaterfallLayoutOptions<T> = {
  /**
   * The minimum item size.
   * @default 240 x 136
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
   * @default 24 x 24
   */
  minSpace?: Size,
  /**
   * The maximum number of columns.
   * @default Infinity
   */
  maxColumns?: number,
  /**
   * The vertical padding for an item.
   * @default 56
   */
  itemPadding?: number,
  collator?: Intl.Collator
};

// TODO: this didn't have any options that varied with card size, should it have?

export class WaterfallLayout<T> extends BaseLayout<T> implements KeyboardDelegate {
  protected minItemSize: Size;
  protected maxItemSize: Size;
  protected margin: number;
  protected minSpace: Size;
  protected maxColumns: number;
  protected itemPadding: number;
  // protected itemSize: Size;
  protected numColumns: number;
  // protected numRows: number;
  // protected horizontalSpacing: number;
  protected collator: Intl.Collator;
  protected lastCollection: Collection<Node<T>>;
  protected invalidateEverything: boolean;
  // The following are set in CardView, not through options
  collection: Collection<Node<T>>;
  isLoading: boolean;
  // TODO: is this a thing? I know its available in CardView's props due to multipleSelection type
  disabledKeys: Set<Key> = new Set();
  direction: Direction;

  constructor(options: WaterfallLayoutOptions<T> = {}) {
    super();
    // TODO: This doesn't have card size from v2, but perhaps it should support it?
    this.minItemSize = options.minItemSize || new Size(240, 136);
    this.maxItemSize = options.maxItemSize || new Size(Infinity, Infinity);
    this.margin = 24;
    this.minSpace = options.minSpace || new Size(24, 24);
    this.maxColumns = options.maxColumns || Infinity;
    this.itemPadding = options.itemPadding != null ? options.itemPadding : 56;

    // TODO: determine if we need the below (from v2)
    this.itemWidth = 0;
    this.numColumns = 0;

    this.lastCollection = null;
    this.collator = options.collator;
  }

  get cardType() {
    // TODO: perhaps rename all the cardType to layoutType instead?
    return 'waterfall';
  }
}
