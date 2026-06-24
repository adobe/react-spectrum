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

import {ChildView, ReusableView, RootView} from './ReusableView';
import {Collection, Key} from '@react-types/shared';
import {
  InvalidationContext,
  Mutable,
  ScrollAnchor,
  VirtualizerDelegate,
  VirtualizerRenderOptions
} from './types';
import {isSetEqual} from './utils';
import {Layout} from './Layout';
import {LayoutInfo} from './LayoutInfo';
import {OverscanManager} from './OverscanManager';
import {Point} from './Point';
import {Rect} from './Rect';
import {Size} from './Size';

interface VirtualizerOptions<T extends object, V> {
  delegate: VirtualizerDelegate<T, V>;
  collection: Collection<T>;
  layout: Layout<T>;
}

/**
 * The Virtualizer class renders a scrollable collection of data using customizable layouts.
 * It supports very large collections by only rendering visible views to the DOM, reusing
 * them as you scroll. Virtualizer can present any type of view, including non-item views
 * such as section headers and footers.
 *
 * Virtualizer uses `Layout` objects to compute what views should be visible, and how
 * to position and style them. This means that virtualizer can have its items arranged in
 * a stack, a grid, a circle, or any other layout you can think of. The layout can be changed
 * dynamically at runtime as well.
 *
 * Layouts produce information on what views should appear in the virtualizer, but do not create the
 * views themselves directly. It is the responsibility of the `VirtualizerDelegate` object to render
 * elements for each layout info. The virtualizer manages a set of `ReusableView` objects, which are
 * reused as the user scrolls by swapping their content with cached elements returned by the
 * delegate.
 */
export class Virtualizer<T extends object, V> {
  /**
   * The virtualizer delegate. The delegate is used by the virtualizer
   * to create and configure views.
   */
  delegate: VirtualizerDelegate<T, V>;

  /** The current content of the virtualizer. */
  readonly collection: Collection<T>;
  /** The layout object that determines the visible views. */
  readonly layout: Layout<T>;
  /** The size of the scrollable content. */
  readonly contentSize: Size;
  /** The currently visible rectangle. */
  readonly visibleRect: Rect;
  /** The size of the virtualizer scroll view. */
  readonly size: Size;
  /** The set of persisted keys that are always present in the DOM, even if not currently in view. */
  readonly persistedKeys: Set<Key>;

  private _visibleViews: Map<Key, ChildView<T, V>>;
  private _renderedContent: WeakMap<T, V>;
  private _rootView: RootView<T, V>;
  private _isScrolling: boolean;
  private _invalidationContext: InvalidationContext;
  private _overscanManager: OverscanManager;
  private _hasInitializedReverseAnchor: boolean;
  private _anchorScrollPosition: boolean;
  private _scrollEndThreshold: number;

  constructor(options: VirtualizerOptions<T, V>) {
    this.delegate = options.delegate;
    this.collection = options.collection;
    this.layout = options.layout;
    this.contentSize = new Size();
    this.visibleRect = new Rect();
    this.size = new Size();
    this.persistedKeys = new Set();
    this._visibleViews = new Map();
    this._renderedContent = new WeakMap();
    this._rootView = new RootView(this);
    this._isScrolling = false;
    this._invalidationContext = {};
    this._overscanManager = new OverscanManager();
    this._hasInitializedReverseAnchor = false;
    this._anchorScrollPosition = false;
    this._scrollEndThreshold = 0;
  }

  /** Returns whether the given key, or an ancestor, is persisted. */
  isPersistedKey(key: Key): boolean {
    // Quick check if the key is directly in the set of persisted keys.
    if (this.persistedKeys.has(key)) {
      return true;
    }

    // If not, check if the key is an ancestor of any of the persisted keys.
    for (let k of this.persistedKeys) {
      while (k != null) {
        let layoutInfo = this.layout.getLayoutInfo(k);
        if (!layoutInfo || layoutInfo.parentKey == null) {
          break;
        }

        k = layoutInfo.parentKey;

        if (k === key) {
          return true;
        }
      }
    }

    return false;
  }

  private getParentView(layoutInfo: LayoutInfo): ReusableView<T, V> | undefined {
    return layoutInfo.parentKey != null
      ? this._visibleViews.get(layoutInfo.parentKey)
      : this._rootView;
  }

  private getReusableView(layoutInfo: LayoutInfo): ChildView<T, V> {
    let parentView = this.getParentView(layoutInfo)!;
    let view = parentView.getReusableView(layoutInfo.type);
    view.layoutInfo = layoutInfo;
    this._renderView(view);
    return view;
  }

  private _renderView(reusableView: ReusableView<T, V>) {
    if (reusableView.layoutInfo) {
      let {type, key, content} = reusableView.layoutInfo;
      reusableView.content = content || this.collection.getItem(key);
      reusableView.rendered = this._renderContent(type, reusableView.content);
    }
  }

  private _renderContent(type: string, content: T | null) {
    let cached = content != null ? this._renderedContent.get(content) : null;
    if (cached != null) {
      return cached;
    }

    let rendered = this.delegate.renderView(type, content);
    if (content) {
      this._renderedContent.set(content, rendered);
    }
    return rendered;
  }

  /**
   * Returns the key for the item view currently at the given point.
   */
  keyAtPoint(point: Point): Key | null {
    let rect = new Rect(point.x, point.y, 1, 1);
    let layoutInfos = rect.area === 0 ? [] : this.layout.getVisibleLayoutInfos(rect);

    // Layout may return multiple layout infos in the case of
    // persisted keys, so find the first one that actually intersects.
    for (let layoutInfo of layoutInfos) {
      if (layoutInfo.rect.intersects(rect)) {
        return layoutInfo.key;
      }
    }

    return null;
  }

  private relayout(
    context: InvalidationContext = {},
    scrollOpts?: {
      anchorScrollPosition?: boolean;
      scrollEndThreshold?: number;
    }
  ) {
    let anchorScrollPosition = scrollOpts?.anchorScrollPosition ?? false;
    let scrollEndThreshold = scrollOpts?.scrollEndThreshold ?? 0;

    // Capture scroll anchor from current (pre-layout) view positions.
    // Returns non-null only when anchorScrollPosition is true AND a visible item was found.
    // On first render _visibleViews is empty so _getScrollAnchor returns null.
    let anchor = this._getScrollAnchor();
    let previousRawContentHeight = this.contentSize.height;
    let previousVisibleRect = this.visibleRect;

    // Update the layout
    this.layout.update(context);

    let rawContentSize = this.layout.getContentSize();
    let rawContentHeight = rawContentSize.height;
    (this as Mutable<this>).contentSize = new Size(rawContentSize.width, rawContentHeight);

    if (anchorScrollPosition && previousVisibleRect.area > 0) {
      let maxVisibleY = Math.max(0, this.contentSize.height - previousVisibleRect.height);
      let contentHeightDelta = rawContentHeight - previousRawContentHeight;
      let distanceFromEnd = previousRawContentHeight - previousVisibleRect.maxY;
      let wasNearBottom = distanceFromEnd <= scrollEndThreshold;

      if (!this._hasInitializedReverseAnchor) {
        // Always snap to bottom on first layout with this config — a chat list should
        // always show the latest content on open. _visibleViews is empty here so there
        // is no anchor to restore anyway.
        this._hasInitializedReverseAnchor = true;
        let target = new Rect(
          previousVisibleRect.x,
          maxVisibleY,
          previousVisibleRect.width,
          previousVisibleRect.height
        );
        if (!target.equals(this.visibleRect)) {
          this.delegate.setVisibleRect(target);
          return;
        }
      } else if (contentHeightDelta !== 0 || context.itemSizeChanged) {
        // Only modify scroll when content actually changed — prevents the setVisibleRect
        // re-render after the initial snap from triggering a spurious anchor-restore.
        if (anchor) {
          // In a reversed bottom-anchored layout, when history loads at the top existing items
          // shift DOWN (y increases) to make room. When a new message arrives at the bottom,
          // existing items keep the same absolute y. Direction is the discriminator.
          let preLayoutCornerY = anchor.offset + previousVisibleRect.y;
          let freshInfo = this.layout.getLayoutInfo(anchor.key);
          let anchorShiftedDown =
            freshInfo != null && freshInfo.rect[anchor.corner].y > preLayoutCornerY;

          // Queues a new render cycle.
          // Return early to skip updateSubviews — running it now would position views against the old visibleRect,
          // // causing a flash before the incoming relayout corrects them.
          if (
            this._applyReverseAnchorScroll(
              anchor,
              wasNearBottom,
              anchorShiftedDown,
              maxVisibleY,
              previousVisibleRect,
              context.itemSizeChanged
            )
          ) {
            return;
          }
        } else if (wasNearBottom && !this._isScrolling) {
          // No anchor captured (views not yet populated): fall back to near-bottom snap.
          let target = new Rect(
            previousVisibleRect.x,
            maxVisibleY,
            previousVisibleRect.width,
            previousVisibleRect.height
          );
          if (!target.equals(this.visibleRect)) {
            this.delegate.setVisibleRect(target);
            return;
          }
        }
      }
    }

    // Constrain scroll position.
    // If the content changed, scroll to the top.
    let visibleRect = this.visibleRect;
    let contentOffsetX = context.contentChanged ? 0 : visibleRect.x;
    let contentOffsetY = context.contentChanged ? 0 : visibleRect.y;
    contentOffsetX = Math.max(
      0,
      Math.min(this.contentSize.width - visibleRect.width, contentOffsetX)
    );
    contentOffsetY = Math.max(
      0,
      Math.min(this.contentSize.height - visibleRect.height, contentOffsetY)
    );

    if (contentOffsetX !== visibleRect.x || contentOffsetY !== visibleRect.y) {
      // If the offset changed, trigger a new re-render.
      let rect = new Rect(contentOffsetX, contentOffsetY, visibleRect.width, visibleRect.height);
      this.delegate.setVisibleRect(rect);
    } else {
      this.updateSubviews();
    }
  }

  private _applyReverseAnchorScroll(
    anchor: ScrollAnchor,
    wasNearBottom: boolean,
    anchorShiftedDown: boolean,
    maxVisibleY: number,
    previousVisibleRect: Rect,
    itemSizeChanged: boolean | undefined
  ): boolean {
    if (wasNearBottom && !this._isScrolling && itemSizeChanged) {
      // Streaming growth: the bottom item grew in place, shifting its top y downward in a
      // reversed layout — which looks identical to anchorShiftedDown. wasNearBottom is the
      // true discriminator: history loads above require the user to have scrolled up first,
      // so wasNearBottom is false for history and true only for streaming. This branch must
      // come before the anchorShiftedDown check.
      let target = new Rect(
        previousVisibleRect.x,
        maxVisibleY,
        previousVisibleRect.width,
        previousVisibleRect.height
      );
      if (!target.equals(this.visibleRect)) {
        this.delegate.setVisibleRect(target);
        return true;
      }
    } else if (anchorShiftedDown) {
      // History load: content inserted above shifts items DOWN. Restore position so
      // the topmost visible item stays in place.
      let targetY = this._computeScrollAnchorTarget(anchor);
      if (targetY != null) {
        let rect = new Rect(
          previousVisibleRect.x,
          targetY,
          previousVisibleRect.width,
          previousVisibleRect.height
        );
        this.delegate.setVisibleRect(rect);
        return true;
      }
    } else if (wasNearBottom && !this._isScrolling) {
      // New message arrived below (anchor unchanged), user was near bottom:
      // pin to latest output.
      let target = new Rect(
        previousVisibleRect.x,
        maxVisibleY,
        previousVisibleRect.width,
        previousVisibleRect.height
      );
      if (!target.equals(this.visibleRect)) {
        this.delegate.setVisibleRect(target);
        return true;
      }
    } else {
      // User is scrolled up: preserve position regardless of where new content landed.
      if (this._restoreScrollAnchor(anchor)) {
        return true;
      }
    }
    return false;
  }

  private _getScrollAnchor(): ScrollAnchor | null {
    if (!this._anchorScrollPosition) {
      return null;
    }
    let visibleRect = this.visibleRect;

    let best: ScrollAnchor | null = null;
    for (let [key, view] of this._visibleViews) {
      let layoutInfo = view.layoutInfo;
      if (layoutInfo && layoutInfo.rect.area > 0 && layoutInfo.rect.intersects(visibleRect)) {
        let corner = layoutInfo.rect.getCornerInRect(visibleRect) ?? 'topLeft';
        // Force top corners: bottom corners on a clipped item can drift if the item resizes.
        if (corner === 'bottomLeft') {
          corner = 'topLeft';
        }
        if (corner === 'bottomRight') {
          corner = 'topRight';
        }
        let offset = layoutInfo.rect[corner].y - visibleRect.y;
        if (!best || offset < best.offset) {
          best = {key, corner, offset};
        }
      }
    }
    return best;
  }

  private _computeScrollAnchorTarget(anchor: ScrollAnchor): number | null {
    let finalInfo = this.layout.getLayoutInfo(anchor.key);
    if (!finalInfo) {
      return null;
    }
    let visibleRect = this.visibleRect;
    let adjustment = finalInfo.rect[anchor.corner].y - visibleRect.y - anchor.offset;
    if (adjustment === 0) {
      return null;
    }
    let targetY = visibleRect.y + adjustment;
    let maxY = Math.max(0, this.contentSize.height - visibleRect.height);
    return Math.max(0, Math.min(maxY, targetY));
  }

  private _restoreScrollAnchor(anchor: ScrollAnchor): boolean {
    let targetY = this._computeScrollAnchorTarget(anchor);
    if (targetY == null) {
      return false;
    }
    let visibleRect = this.visibleRect;
    this.delegate.setVisibleRect(
      new Rect(visibleRect.x, targetY, visibleRect.width, visibleRect.height)
    );
    return true;
  }

  getVisibleLayoutInfos(): Map<Key, LayoutInfo> {
    let isTestEnv = process.env.NODE_ENV === 'test' && !process.env.VIRT_ON;
    let isClientWidthMocked =
      isTestEnv &&
      typeof HTMLElement !== 'undefined' &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes('clientWidth');
    let isClientHeightMocked =
      isTestEnv &&
      typeof HTMLElement !== 'undefined' &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes('clientHeight');

    let rect: Rect;
    if (isTestEnv && !(isClientWidthMocked && isClientHeightMocked)) {
      rect = new Rect(0, 0, this.contentSize.width, this.contentSize.height);
    } else {
      rect = this._overscanManager.getOverscannedRect();
    }
    let layoutInfos = this.layout.getVisibleLayoutInfos(rect);
    let map = new Map();
    for (let layoutInfo of layoutInfos) {
      map.set(layoutInfo.key, layoutInfo);
    }

    return map;
  }

  private updateSubviews() {
    let visibleLayoutInfos = this.getVisibleLayoutInfos();

    let removed = new Set<ChildView<T, V>>();
    for (let [key, view] of this._visibleViews) {
      let layoutInfo = visibleLayoutInfos.get(key);
      // If a view's parent changed, treat it as a delete and re-create in the new parent.
      if (!layoutInfo || view.parent !== this.getParentView(layoutInfo)) {
        this._visibleViews.delete(key);
        view.parent.reuseChild(view);
        removed.add(view); // Defer removing in case we reuse this view.
      }
    }

    for (let [key, layoutInfo] of visibleLayoutInfos) {
      let view = this._visibleViews.get(key);
      if (!view) {
        view = this.getReusableView(layoutInfo);
        view.parent.children.add(view);
        this._visibleViews.set(key, view);
        removed.delete(view);
      } else {
        view.layoutInfo = layoutInfo;

        let item = this.collection.getItem(layoutInfo.key);
        if (view.content !== item) {
          if (view.content != null) {
            this._renderedContent.delete(view.content);
          }
          this._renderView(view);
        }
      }
    }

    // The remaining views in `removed` were not reused to render new items.
    // They should be removed from the DOM. We also clear the reusable view queue
    // here since there's no point holding onto views that have been removed.
    // Doing so hurts performance in the future when reusing elements due to FIFO order.
    for (let view of removed) {
      view.parent.children.delete(view);
      view.parent.reusableViews.clear();
    }

    // Reordering DOM nodes is costly, so we defer this until scrolling stops.
    // DOM order does not affect visual order (due to absolute positioning),
    // but does matter for assistive technology users.
    if (!this._isScrolling) {
      // Layout infos must be in topological order (parents before children).
      for (let key of visibleLayoutInfos.keys()) {
        let view = this._visibleViews.get(key)!;
        view.parent.children.delete(view);
        view.parent.children.add(view);
      }
    }
  }

  /** Performs layout and updates visible views as needed. */
  render(opts: VirtualizerRenderOptions<T>): ReusableView<T, V>[] {
    let mutableThis: Mutable<this> = this;
    let needsLayout = false;
    let offsetChanged = false;
    let sizeChanged = false;
    let itemSizeChanged = false;
    let layoutOptionsChanged = false;
    let needsUpdate = false;

    let anchorScrollPosition = opts.layout.isReversed(opts.layoutOptions);
    let scrollEndThreshold = opts.scrollEndThreshold ?? 0;

    if (opts.collection !== this.collection) {
      mutableThis.collection = opts.collection;
      needsLayout = true;
    }

    if (opts.layout !== this.layout || this.layout.virtualizer !== this) {
      if (this.layout) {
        this.layout.virtualizer = null;
      }

      opts.layout.virtualizer = this;
      mutableThis.layout = opts.layout;
      this._hasInitializedReverseAnchor = false;
      needsLayout = true;
    }

    if (
      anchorScrollPosition !== this._anchorScrollPosition ||
      scrollEndThreshold !== this._scrollEndThreshold
    ) {
      if (!this._anchorScrollPosition && anchorScrollPosition) {
        this._hasInitializedReverseAnchor = false;
      }
      this._anchorScrollPosition = anchorScrollPosition;
      this._scrollEndThreshold = scrollEndThreshold;
      needsLayout = true;
    }

    if (opts.persistedKeys && !isSetEqual(opts.persistedKeys, this.persistedKeys)) {
      mutableThis.persistedKeys = opts.persistedKeys;
      needsUpdate = true;
    }

    if (!this.visibleRect.equals(opts.visibleRect) || !this.size.equals(opts.size)) {
      this._overscanManager.setVisibleRect(opts.visibleRect);

      // Create a rectangle using the scroll position and layout size of the scroll view. This is not the same
      // as the visibleRect, whose width and height may change during window scrolling.
      let oldRect = new Rect(
        this.visibleRect.x,
        this.visibleRect.y,
        this.size.width,
        this.size.height
      );
      let newRect = new Rect(
        opts.visibleRect.x,
        opts.visibleRect.y,
        opts.size.width,
        opts.size.height
      );
      let shouldInvalidate = this.layout.shouldInvalidate(newRect, oldRect);

      if (shouldInvalidate) {
        offsetChanged = !opts.visibleRect.pointEquals(this.visibleRect);
        sizeChanged = !this.size.equals(opts.size);
        needsLayout = true;
      } else {
        needsUpdate = true;
      }

      mutableThis.visibleRect = opts.visibleRect;
      mutableThis.size = opts.size;
    }

    if (opts.invalidationContext !== this._invalidationContext) {
      if (opts.invalidationContext) {
        sizeChanged ||= opts.invalidationContext.sizeChanged || false;
        offsetChanged ||= opts.invalidationContext.offsetChanged || false;
        itemSizeChanged ||= opts.invalidationContext.itemSizeChanged || false;
        layoutOptionsChanged ||=
          opts.invalidationContext.layoutOptions != null &&
          this._invalidationContext.layoutOptions != null &&
          opts.invalidationContext.layoutOptions !== this._invalidationContext.layoutOptions &&
          this.layout.shouldInvalidateLayoutOptions(
            opts.invalidationContext.layoutOptions,
            this._invalidationContext.layoutOptions
          );
        needsLayout ||= itemSizeChanged || sizeChanged || offsetChanged || layoutOptionsChanged;
      }
      this._invalidationContext = opts.invalidationContext;
    }

    if (opts.isScrolling !== this._isScrolling) {
      this._isScrolling = opts.isScrolling;
      if (!opts.isScrolling) {
        // Update to fix the DOM order after scrolling.
        needsUpdate = true;
      }
    }

    if (needsLayout) {
      this.relayout(
        {
          offsetChanged,
          sizeChanged,
          itemSizeChanged,
          layoutOptionsChanged,
          layoutOptions: this._invalidationContext.layoutOptions,
          isScrolling: this._isScrolling
        },
        {anchorScrollPosition, scrollEndThreshold}
      );
    } else if (needsUpdate) {
      this.updateSubviews();
    }

    return Array.from(this._rootView.children);
  }

  getVisibleView(key: Key): ReusableView<T, V> | undefined {
    return this._visibleViews.get(key);
  }

  invalidate(context: InvalidationContext): void {
    this.delegate.invalidate(context);
  }

  updateItemSize(key: Key, size: Size): void {
    if (!this.layout.updateItemSize) {
      return;
    }

    let changed = this.layout.updateItemSize(key, size);
    if (changed) {
      this.invalidate({
        itemSizeChanged: true
      });
    }
  }
}
