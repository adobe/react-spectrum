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

import {Collection, Key} from '@react-types/shared';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
import {Rect, RectCorner} from './Rect';
import {Size} from './Size';

export interface InvalidationContext<O = any> {
  contentChanged?: boolean;
  offsetChanged?: boolean;
  sizeChanged?: boolean;
  widthChanged?: boolean;
  heightChanged?: boolean;
  itemSizeChanged?: boolean;
  layoutOptionsChanged?: boolean;
  layoutOptions?: O;
}

export interface ScrollAnchor {
  key: Key;
  corner: RectCorner;
  offset: number;
}

/** Describes the edge-anchoring a layout wants. See `Layout.getScrollAnchorInfo`. */
export interface ScrollAnchorInfo {
  /** Which edge of the content the viewport should stay anchored to. */
  edge: 'start' | 'end';
  /** Which axis `edge` refers to — 'y' for vertical lists, 'x' for horizontal. */
  axis: 'x' | 'y';
  /** Distance (px) from `edge` within which the viewport is considered "following" it. */
  threshold: number;
  /**
   * Optional classifier excluding structural/ephemeral layout infos (e.g. loaders) from being
   * selected as the anchor. Defaults to allowing any layoutInfo.
   */
  isAnchorable?: (layoutInfo: LayoutInfo) => boolean;
}

export interface VirtualizerDelegate<T extends object, V> {
  setVisibleRect(rect: Rect): void;
  renderView(type: string, content: T | null): V;
  invalidate(ctx: InvalidationContext): void;
}

export interface VirtualizerRenderOptions<T extends object, O = any> {
  layout: Layout<T>;
  collection: Collection<T>;
  persistedKeys?: Set<Key> | null;
  visibleRect: Rect;
  size: Size;
  invalidationContext: InvalidationContext;
  isScrolling: boolean;
  layoutOptions?: O;
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
