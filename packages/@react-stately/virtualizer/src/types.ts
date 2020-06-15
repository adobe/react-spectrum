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

import {Collection} from '@react-types/shared';
import {Key} from 'react';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
import {Rect, RectCorner} from './Rect';
import {ReusableView} from './ReusableView';
import {Size} from './Size';
import {Transaction} from './Transaction';

export interface InvalidationContext<T extends object, V> {
  contentChanged?: boolean,
  offsetChanged?: boolean,
  sizeChanged?: boolean,
  animated?: boolean,
  beforeLayout?(): void,
  afterLayout?(): void,
  afterAnimation?(): void,
  transaction?: Transaction<T, V>
}

export interface VirtualizerDelegate<T extends object, V, W> {
  setVisibleViews(views: W[]): void,
  setContentSize(size: Size): void,
  setVisibleRect(rect: Rect): void,
  getType?(content: T): string,
  renderView(type: string, content: T): V,
  renderWrapper(
    parent: ReusableView<T, V> | null,
    reusableView: ReusableView<T, V>,
    children: ReusableView<T, V>[],
    renderChildren: (views: ReusableView<T, V>[]) => W[]
  ): W,
  beginAnimations(): void,
  endAnimations(): void,
  getScrollAnchor?(rect: Rect): Key
}

export interface ScrollAnchor {
  key: Key,
  layoutInfo: LayoutInfo,
  corner: RectCorner,
  offset: number
}

export interface ScrollToItemOptions {
  duration?: number,
  shouldScrollX?: boolean,
  shouldScrollY?: boolean,
  offsetX?: number,
  offsetY?: number
}

export interface VirtualizerOptions<T extends object, V, W> {
  collection?: Collection<T>,
  layout?: Layout<T>,
  delegate?: VirtualizerDelegate<T, V, W>,
  transitionDuration?: number,
  anchorScrollPosition?: boolean,
  anchorScrollPositionAtTop?: boolean,
  shouldOverscan?: boolean
}
