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

import {captureScrollAnchor, isNearEdge, resolveScrollAdjustment} from './ScrollAnchor';
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
  private _hasSnappedToAnchorEdge: boolean;
  /**
   * Whether any currently-visible item was still using an estimated size as of the end of the
   * previous relayout pass. Used to keep forcing edge-follow through the entire initial
   * estimate-to-measured settling cascade, since a single pass's jump from an estimated to a
   * measured size can otherwise exceed the distance-based `isNearEdge` check. Paired with
   * `_wasNearAnchorEdge` so this only forces edge-follow near the anchored edge.
   */
  private _hadEstimatedVisibleItems: boolean;
  /**
   * Whether the viewport was near the anchored edge (per the real, unforced `isNearEdge` check),
   * latched at the *start* of the current estimate-to-measured settling cascade and held fixed
   * for its duration. Only re-derived once the cascade ends and a new one begins. Must not be
   * recomputed every pass while settling: a single oversized jump mid-cascade routinely exceeds
   * `isNearEdge`'s distance threshold on its own, which would wrongly conclude the user scrolled
   * away even though nothing touched the scrollbar — this is exactly the failure
   * `_hadEstimatedVisibleItems` exists to paper over, so re-deriving this flag every pass would
   * silently defeat it.
   */
  private _wasNearAnchorEdge: boolean;

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
    this._hasSnappedToAnchorEdge = false;
    this._hadEstimatedVisibleItems = false;
    this._wasNearAnchorEdge = false;
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

  private relayout(context: InvalidationContext = {}) {
    let anchorInfo = this.layout.getScrollAnchorInfo?.(context.layoutOptions) ?? null;
    let wasSettlingLastPass = this._hadEstimatedVisibleItems;
    let wasNearAnchorEdgeLastPass = this._wasNearAnchorEdge;

    // Capture scroll anchor from current (pre-layout) view positions.
    // On first render _visibleViews is empty so no anchor will be found.
    let anchor: ScrollAnchor | null = null;
    if (anchorInfo) {
      let visibleLayoutInfos: [Key, LayoutInfo][] = [];
      for (let [key, view] of this._visibleViews) {
        let layoutInfo = this.layout.getLayoutInfo(key) ?? view.layoutInfo;
        if (layoutInfo) {
          visibleLayoutInfos.push([key, layoutInfo]);
        }
      }
      anchor = captureScrollAnchor(
        anchorInfo.edge,
        anchorInfo.axis,
        this.visibleRect,
        visibleLayoutInfos,
        anchorInfo.isAnchorable
      );
    }
    let previousContentSize = this.contentSize;
    let previousVisibleRect = this.visibleRect;

    // Update the layout
    this.layout.update(context);

    let rawContentSize = this.layout.getContentSize();
    (this as Mutable<this>).contentSize = new Size(rawContentSize.width, rawContentSize.height);

    if (anchorInfo) {
      let hasEstimated = false;
      for (let layoutInfo of this.getVisibleLayoutInfos().values()) {
        if (layoutInfo.estimatedSize) {
          hasEstimated = true;
          break;
        }
      }
      this._hadEstimatedVisibleItems = hasEstimated;
      // Don't recheck "near edge?" mid-resize because it could look like a scroll that never happened.
      // Reuse the answer from before the resizing started.
      if (!wasSettlingLastPass) {
        this._wasNearAnchorEdge = isNearEdge(
          previousVisibleRect,
          previousContentSize,
          anchorInfo.edge,
          anchorInfo.axis,
          anchorInfo.threshold
        );
      }
    }
    if (anchorInfo && previousVisibleRect.area > 0) {
      let dimension = anchorInfo.axis === 'x' ? 'width' : 'height';
      let contentSizeDelta = this.contentSize[dimension] - previousContentSize[dimension];
      let isFirstAnchoredLayout = !this._hasSnappedToAnchorEdge;
      this._hasSnappedToAnchorEdge = true;

      // Only modify scroll when content actually changed (or this is the first layout, which always snaps)
      if (isFirstAnchoredLayout || contentSizeDelta !== 0 || context.itemSizeChanged) {
        let wasNearAnchorEdge =
          isFirstAnchoredLayout ||
          (wasSettlingLastPass && wasNearAnchorEdgeLastPass) ||
          isNearEdge(
            previousVisibleRect,
            previousContentSize,
            anchorInfo.edge,
            anchorInfo.axis,
            anchorInfo.threshold
          );
        // A first-ever layout always snaps to the edge, even if the raw distance check says
        // otherwise. Save that real decision here so later passes in this cascade reuse it.
        if (!wasSettlingLastPass) {
          this._wasNearAnchorEdge = wasNearAnchorEdge;
        }
        let getLayoutInfo = (key: Key) => this.layout.getLayoutInfo(key);
        // Skip restoring to the captured anchor while still resizing because items above it are also still growing,
        // and following it would fall short of the edge.
        let effectiveAnchor =
          isFirstAnchoredLayout || (wasSettlingLastPass && wasNearAnchorEdgeLastPass)
            ? null
            : anchor;
        let target = resolveScrollAdjustment(
          anchorInfo.edge,
          anchorInfo.axis,
          effectiveAnchor,
          wasNearAnchorEdge,
          this._isScrolling,
          context.itemSizeChanged ?? false,
          contentSizeDelta,
          getLayoutInfo,
          previousVisibleRect,
          this.contentSize
        );

        if (target) {
          // Queues a new render cycle. Return early to skip updateSubviews — running it now
          // would position views against the old visibleRect, causing a flash before the
          // incoming relayout corrects them.
          this.delegate.setVisibleRect(target);
          return;
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
      this._hasSnappedToAnchorEdge = false;
      this._hadEstimatedVisibleItems = false;
      this._wasNearAnchorEdge = false;
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
      this.relayout({
        offsetChanged,
        sizeChanged,
        itemSizeChanged,
        layoutOptionsChanged,
        layoutOptions: this._invalidationContext.layoutOptions
      });
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
