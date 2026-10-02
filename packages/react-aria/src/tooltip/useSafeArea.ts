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

import {getOwnerDocument, getOwnerWindow} from '../utils/domHelpers';
import {RefObject} from '@react-types/shared';
import {useEffect} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';

interface Point {
  x: number;
  y: number;
}

interface SafeAreaOptions {
  /** Ref for the trigger element. */
  triggerRef: RefObject<Element | null>;
  /** Ref for the overlay element. */
  overlayRef: RefObject<Element | null>;
  /** Whether the overlay is open. */
  isOpen: boolean;
  /** Whether this feature is disabled. */
  isDisabled?: boolean;
  /**
   * Called on pointer move (and when the pointer leaves the document) with whether the pointer is
   * currently within the "safe area" — the trigger, the overlay, or the region between them. This
   * lets an overlay stay open while the pointer travels from the trigger to the overlay, even
   * diagonally and regardless of placement.
   */
  onSafeAreaChange: (isInSafeArea: boolean) => void;
}

// A small amount of padding (in pixels) added around the trigger and overlay so the safe area is
// slightly forgiving of sub-pixel jitter and the gap between the elements.
const PADDING = 8;

/**
 * Tracks whether the pointer is within a "safe area" connecting a trigger and its overlay, so the
 * overlay can stay open while the pointer moves between them. The safe area is the union of the
 * trigger rect, the overlay rect, and the convex hull connecting the two (a polygon), which works
 * for any placement of the overlay relative to the trigger.
 */
export function useSafeArea(options: SafeAreaOptions): void {
  let {triggerRef, overlayRef, isOpen, isDisabled} = options;
  let onSafeAreaChange = useEffectEvent(options.onSafeAreaChange);

  useEffect(() => {
    let trigger = triggerRef.current;
    if (isDisabled || !isOpen || !trigger) {
      return;
    }

    let onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        return;
      }
      let point = {x: e.clientX, y: e.clientY};
      let triggerRect = trigger!.getBoundingClientRect();
      let overlayRect = overlayRef.current?.getBoundingClientRect();
      onSafeAreaChange(isPointInSafeArea(point, triggerRect, overlayRect));
    };

    // If the pointer leaves the document entirely, it is no longer in the safe area.
    let onPointerLeave = () => onSafeAreaChange(false);

    let win = getOwnerWindow(trigger);
    let doc = getOwnerDocument(trigger);
    win.addEventListener('pointermove', onPointerMove);
    doc.documentElement.addEventListener('pointerleave', onPointerLeave);
    return () => {
      win.removeEventListener('pointermove', onPointerMove);
      doc.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [isDisabled, isOpen, triggerRef, overlayRef]);
}

function isPointInSafeArea(point: Point, triggerRect: DOMRect, overlayRect?: DOMRect): boolean {
  if (rectContains(triggerRect, point)) {
    return true;
  }
  if (!overlayRect) {
    return false;
  }
  if (rectContains(overlayRect, point)) {
    return true;
  }
  // Otherwise, check whether the point is within the convex hull connecting the two rects.
  let hull = convexHull([...rectCorners(triggerRect), ...rectCorners(overlayRect)]);
  return hull.length >= 3 && isPointInPolygon(point, hull);
}

function rectContains(rect: DOMRect, point: Point): boolean {
  return (
    point.x >= rect.left - PADDING &&
    point.x <= rect.right + PADDING &&
    point.y >= rect.top - PADDING &&
    point.y <= rect.bottom + PADDING
  );
}

function rectCorners(rect: DOMRect): Point[] {
  let left = rect.left - PADDING;
  let right = rect.right + PADDING;
  let top = rect.top - PADDING;
  let bottom = rect.bottom + PADDING;
  return [
    {x: left, y: top},
    {x: right, y: top},
    {x: right, y: bottom},
    {x: left, y: bottom}
  ];
}

// Computes the convex hull of a set of points using the monotone chain algorithm.
function convexHull(points: Point[]): Point[] {
  let sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) {
    return sorted;
  }

  let cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  let lower: Point[] = [];
  for (let p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  let upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    let p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Ray casting point-in-polygon test.
function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let {x, y} = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x;
    let yi = polygon[i].y;
    let xj = polygon[j].x;
    let yj = polygon[j].y;
    let intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}
