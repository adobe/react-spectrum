/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Key} from '@react-types/shared';
import {LayoutInfo} from './LayoutInfo';
import {Rect} from './Rect';
import {ScrollAnchor} from './types';
import {Size} from './Size';

export type ScrollAnchorAxis = 'x' | 'y';
export type ScrollAnchorEdge = 'start' | 'end';

/**
 * Minimum overlap an item must have with the viewport, along the scroll axis,
 * to be eligible as a scroll anchor. Without this, an item that only overlaps the viewport
 * by a sliver (e.g. 1px, essentially scrolled out of view) can still "win" the anchor
 * tie-break over a substantially visible item.
 */
const MIN_ANCHOR_OVERLAP = 4;

function dimensionForAxis(axis: ScrollAnchorAxis): 'width' | 'height' {
  return axis === 'x' ? 'width' : 'height';
}

/**
 * Given a previously-captured anchor, computes the new viewport coordinate (along `axis`) needed
 * to keep it at the same offset from the viewport's start.
 */
export function computeScrollAnchorTarget(
  anchor: ScrollAnchor,
  axis: ScrollAnchorAxis,
  getLayoutInfo: (key: Key) => LayoutInfo | null,
  visibleRect: Rect,
  contentSize: Size
): number | null {
  let finalInfo = getLayoutInfo(anchor.key);
  if (!finalInfo) {
    return null;
  }
  let adjustment = finalInfo.rect[anchor.corner][axis] - visibleRect[axis] - anchor.offset;
  if (adjustment === 0) {
    return null;
  }
  let target = visibleRect[axis] + adjustment;
  let dimension = dimensionForAxis(axis);
  let max = Math.max(0, contentSize[dimension] - visibleRect[dimension]);
  let clamped = Math.max(0, Math.min(max, target));
  return clamped !== visibleRect[axis] ? clamped : null;
}

/**
 * Picks the item to anchor scroll to: the one nearest the top of the viewport when
 * anchoring to 'end', or nearest the bottom when anchoring to 'start'. Callers can
 * exclude certain items (like loaders) with `isAnchorable`.
 */
export function captureScrollAnchor(
  edge: ScrollAnchorEdge,
  axis: ScrollAnchorAxis,
  visibleRect: Rect,
  visibleLayoutInfos: Iterable<[Key, LayoutInfo]>,
  isAnchorable: (layoutInfo: LayoutInfo) => boolean = () => true
): ScrollAnchor | null {
  let dimension = dimensionForAxis(axis);
  let best: ScrollAnchor | null = null;
  for (let [key, layoutInfo] of visibleLayoutInfos) {
    if (!layoutInfo || !isAnchorable(layoutInfo)) {
      continue;
    }
    let overlap = layoutInfo.rect.intersection(visibleRect)[dimension];
    if (layoutInfo.rect.area > 0 && overlap >= MIN_ANCHOR_OVERLAP) {
      let corner = layoutInfo.rect.getCornerInRect(visibleRect) ?? 'topLeft';
      let offset = layoutInfo.rect[corner][axis] - visibleRect[axis];
      let isBetter = !best || (edge === 'end' ? offset < best.offset : offset > best.offset);
      if (isBetter) {
        best = {key, corner, offset};
      }
    }
  }
  return best;
}

/** Returns the viewport coordinate (along `axis`) that pins the viewport to `edge` of the content. */
export function getEdgeSnapTarget(
  edge: ScrollAnchorEdge,
  axis: ScrollAnchorAxis,
  contentSize: Size,
  previousVisibleRect: Rect
): number {
  if (edge === 'start') {
    return 0;
  }
  let dimension = dimensionForAxis(axis);
  return Math.max(0, contentSize[dimension] - previousVisibleRect[dimension]);
}

/**
 * Whether the viewport is currently within `threshold` px of the anchored edge — used by
 * Virtualizer to compute wasNearAnchorEdge generically, without any layout-specific state.
 */
export function isNearEdge(
  visibleRect: Rect,
  contentSize: Size,
  edge: ScrollAnchorEdge,
  axis: ScrollAnchorAxis,
  threshold: number
): boolean {
  if (edge === 'start') {
    return visibleRect[axis] <= threshold;
  }
  let dimension = dimensionForAxis(axis);
  let distanceFromEnd = contentSize[dimension] - (visibleRect[axis] + visibleRect[dimension]);
  return distanceFromEnd <= threshold;
}

/**
 * Works out the new scroll position after content changes. Tries to keep the anchor
 * item where it was. If that doesn't apply, sticks the view to the edge instead, but
 * only if the user was already near the edge and didn't just scroll away on their own.
 */
export function resolveScrollAdjustment(
  edge: ScrollAnchorEdge,
  axis: ScrollAnchorAxis,
  anchor: ScrollAnchor | null,
  wasNearAnchorEdge: boolean,
  isScrolling: boolean,
  itemSizeChanged: boolean,
  contentSizeDelta: number,
  getLayoutInfo: (key: Key) => LayoutInfo | null,
  previousVisibleRect: Rect,
  contentSize: Size
): Rect | null {
  let withTarget = (target: number): Rect =>
    axis === 'x'
      ? new Rect(
          target,
          previousVisibleRect.y,
          previousVisibleRect.width,
          previousVisibleRect.height
        )
      : new Rect(
          previousVisibleRect.x,
          target,
          previousVisibleRect.width,
          previousVisibleRect.height
        );

  if (anchor) {
    let target = computeScrollAnchorTarget(
      anchor,
      axis,
      getLayoutInfo,
      previousVisibleRect,
      contentSize
    );
    if (target != null) {
      return withTarget(target);
    }
  }

  if (wasNearAnchorEdge && !isScrolling && (!itemSizeChanged || contentSizeDelta > 0)) {
    let target = withTarget(getEdgeSnapTarget(edge, axis, contentSize, previousVisibleRect));
    return target.equals(previousVisibleRect) ? null : target;
  }

  return null;
}
