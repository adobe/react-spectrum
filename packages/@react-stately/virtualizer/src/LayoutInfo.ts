/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key} from 'react';
import {Rect} from './Rect';

/**
 * Instances of this lightweight class are created by {@link Layout} subclasses
 * to represent each view in the {@link CollectionView}. LayoutInfo objects describe
 * various properties of a view, such as its position and size, and style information.
 * The collection view uses this information when creating actual views to display.
 */
export class LayoutInfo {
  /**
   * A string representing the view type. Should be `'item'` for item views.
   * Other types are used by supplementary views.
   */
  type: string;

  /**
   * A unique key for this view. For item views, it should match the content key.
   */
  key: Key;

  /**
   * The key for a parent layout info, if any.
   */
  parentKey: Key | null;

  /**
   * The rectangle describing the size and position of this view.
   */
  rect: Rect;

  /**
   * Whether the size is estimated. `false` by default.
   */
  estimatedSize: boolean;

  /**
   * Whether the layout info sticks to the viewport when scrolling.
   */
  isSticky: boolean;

  /**
   * The view's opacity. 1 by default.
   */
  opacity: number;

  /**
   * A CSS transform string to apply to the view. `null` by default.
   */
  transform: string | null;

  /**
   * The z-index of the view. 0 by default.
   */
  zIndex: number;

  /**
   * Whether the layout info allows its contents to overflow its container.
   * @default false
   */
  allowOverflow: boolean;

  /**
   * @param type A string representing the view type. Should be `'item'` for item views.
                            Other types are used by supplementary views.
   * @param key The unique key for this view.
   * @param rect The rectangle describing the size and position of this view.
   */
  constructor(type: string, key: Key, rect: Rect) {
    this.type = type;
    this.key = key;
    this.parentKey = null;
    this.rect = rect;
    this.estimatedSize = false;
    this.isSticky = false;
    this.opacity = 1;
    this.transform = null;
    this.zIndex = 0;
    this.allowOverflow = false;
  }

  /**
   * Returns a copy of the LayoutInfo.
   */
  copy(): LayoutInfo {
    let res = new LayoutInfo(this.type, this.key, this.rect.copy());
    res.estimatedSize = this.estimatedSize;
    res.opacity = this.opacity;
    res.transform = this.transform;
    res.parentKey = this.parentKey;
    res.isSticky = this.isSticky;
    res.zIndex = this.zIndex;
    res.allowOverflow = this.allowOverflow;
    return res;
  }
}
