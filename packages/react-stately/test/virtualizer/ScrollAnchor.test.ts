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

import {
  captureScrollAnchor,
  computeScrollAnchorTarget,
  getEdgeSnapTarget,
  isNearEdge,
  resolveScrollAdjustment,
  ScrollAnchorTracker
} from '../../src/virtualizer/ScrollAnchor';
import {LayoutInfo} from '../../src/virtualizer/LayoutInfo';
import {Rect} from '../../src/virtualizer/Rect';
import {ScrollAnchor, ScrollAnchorInfo} from '../../src/virtualizer/ScrollAnchor';
import {Size} from '../../src/virtualizer/Size';

describe('captureScrollAnchor', () => {
  it('does not anchor to an item that only slivers into the viewport by a pixel or two', () => {
    let visibleRect = new Rect(0, 1023, 400, 468);

    // Substantially visible: fully inside the viewport, 9px from the top.
    let substantiallyVisible = new LayoutInfo(
      'item',
      'substantially-visible',
      new Rect(0, 1032, 400, 40)
    );
    // Nearly scrolled out: only its bottom 1px overlaps the viewport.
    let sliver = new LayoutInfo('item', 'sliver', new Rect(0, 976, 400, 48));

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [
      ['substantially-visible', substantiallyVisible],
      ['sliver', sliver]
    ]);

    expect(anchor?.key).toBe('substantially-visible');
  });

  it('returns null when the only candidate is a sub-threshold sliver, rather than anchoring to it', () => {
    let visibleRect = new Rect(0, 1023, 400, 468);
    let onlyCandidate = new LayoutInfo('item', 'only-candidate', new Rect(0, 976, 400, 48));

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [['only-candidate', onlyCandidate]]);

    expect(anchor).toBeNull();
  });

  it('picks the item with the smallest offset among multiple substantially-visible candidates', () => {
    let visibleRect = new Rect(0, 1023, 400, 468);
    let closer = new LayoutInfo('item', 'closer', new Rect(0, 1032, 400, 40));
    let farther = new LayoutInfo('item', 'farther', new Rect(0, 1080, 400, 48));

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [
      ['farther', farther],
      ['closer', closer]
    ]);

    expect(anchor?.key).toBe('closer');
  });

  it('does not anchor to a substantially-visible item clipped at the leading edge', () => {
    let visibleRect = new Rect(0, 1000, 400, 468); // viewport 1000-1468
    let clipped = new LayoutInfo('item', 'clipped', new Rect(0, 962, 400, 76)); // top clipped, 38px visible
    let fullyVisible = new LayoutInfo('item', 'fully-visible', new Rect(0, 1040, 400, 60));

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [
      ['clipped', clipped],
      ['fully-visible', fullyVisible]
    ]);

    expect(anchor?.key).toBe('fully-visible');
    expect(anchor?.corner).toBe('topLeft');
    expect(anchor?.offset).toBe(40);
  });

  it('anchors along the x axis by the left edge when anchoring to end', () => {
    // Branch coverage for the horizontal corner branch (topLeft on the x axis).
    let visibleRect = new Rect(1000, 0, 468, 400); // viewport x 1000-1468
    let leftClipped = new LayoutInfo('item', 'left-clipped', new Rect(962, 0, 76, 400)); // left clipped
    let fullyVisible = new LayoutInfo('item', 'fully-visible', new Rect(1040, 0, 60, 400));

    let anchor = captureScrollAnchor('end', 'x', visibleRect, [
      ['left-clipped', leftClipped],
      ['fully-visible', fullyVisible]
    ]);

    expect(anchor?.key).toBe('fully-visible');
    expect(anchor?.corner).toBe('topLeft');
    expect(anchor?.offset).toBe(40);
  });

  it('falls back to a clipped item when it is the only substantial candidate', () => {
    let visibleRect = new Rect(0, 1000, 400, 468); // viewport 1000-1468
    let taller = new LayoutInfo('item', 'taller', new Rect(0, 900, 400, 800)); // spans 900-1700

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [['taller', taller]]);

    expect(anchor?.key).toBe('taller');
  });

  it('returns a substantial clipped item over a fully-visible sub-overlap sliver', () => {
    let visibleRect = new Rect(0, 1000, 400, 468); // viewport 1000-1468
    // Fully visible (top at 1002) but only 2px tall -> overlap 2 < MIN_ANCHOR_OVERLAP.
    let sliver = new LayoutInfo('item', 'sliver', new Rect(0, 1002, 400, 2));
    // Top-clipped but 38px visible -> substantial overlap, reaches the fallback.
    let clipped = new LayoutInfo('item', 'clipped', new Rect(0, 962, 400, 76));

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [
      ['sliver', sliver],
      ['clipped', clipped]
    ]);

    expect(anchor?.key).toBe('clipped');
  });

  it('excludes an item that is both clipped and sub-overlap at the overlap gate', () => {
    let visibleRect = new Rect(0, 1000, 400, 468);
    let clippedSliver = new LayoutInfo('item', 'clipped-sliver', new Rect(0, 960, 400, 42)); // 2px visible at top

    let anchor = captureScrollAnchor('end', 'y', visibleRect, [['clipped-sliver', clippedSliver]]);

    expect(anchor).toBeNull();
  });
});

describe('computeScrollAnchorTarget', () => {
  it('returns null when the anchored item can no longer be found', () => {
    let anchor: ScrollAnchor = {key: 'gone', corner: 'topLeft', offset: 10};
    let visibleRect = new Rect(0, 100, 400, 468);
    let contentSize = new Size(400, 2000);

    let target = computeScrollAnchorTarget(anchor, 'y', () => null, visibleRect, contentSize);

    expect(target).toBeNull();
  });

  it('returns null when the anchored item has not moved relative to the viewport', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let visibleRect = new Rect(0, 100, 400, 468);
    let contentSize = new Size(400, 2000);
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 110, 400, 40));

    let target = computeScrollAnchorTarget(anchor, 'y', () => layoutInfo, visibleRect, contentSize);

    expect(target).toBeNull();
  });

  it('returns the new viewport coordinate needed to preserve the anchor offset', () => {
    // Anchor was captured 10px from the top of the viewport. Content was prepended above it,
    // pushing it down another 200px, so the viewport must scroll down 200px to compensate.
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let visibleRect = new Rect(0, 100, 400, 468);
    let contentSize = new Size(400, 2000);
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 310, 400, 40));

    let target = computeScrollAnchorTarget(anchor, 'y', () => layoutInfo, visibleRect, contentSize);

    expect(target).toBe(300);
  });

  it('clamps the target to 0 when the naive computation would be negative', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 100};
    let visibleRect = new Rect(0, 100, 400, 468);
    let contentSize = new Size(400, 2000);
    // Item moved up, so the naive target would be negative.
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 0, 400, 40));

    let target = computeScrollAnchorTarget(anchor, 'y', () => layoutInfo, visibleRect, contentSize);

    expect(target).toBe(0);
  });

  it('clamps the target to the max scroll offset when it would exceed the content size', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let visibleRect = new Rect(0, 100, 400, 468);
    let contentSize = new Size(400, 600);
    // Item moved far down, well past what the content size can accommodate.
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 5000, 400, 40));

    let target = computeScrollAnchorTarget(anchor, 'y', () => layoutInfo, visibleRect, contentSize);

    expect(target).toBe(600 - 468);
  });

  it('supports the x axis', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let visibleRect = new Rect(100, 0, 468, 400);
    let contentSize = new Size(2000, 400);
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(310, 0, 40, 400));

    let target = computeScrollAnchorTarget(anchor, 'x', () => layoutInfo, visibleRect, contentSize);

    expect(target).toBe(300);
  });
});

describe('getEdgeSnapTarget', () => {
  it('returns 0 for the start edge regardless of sizes', () => {
    let contentSize = new Size(400, 2000);
    let visibleRect = new Rect(0, 500, 400, 468);

    expect(getEdgeSnapTarget('start', 'y', contentSize, visibleRect)).toBe(0);
  });

  it('returns the max scroll offset for the end edge', () => {
    let contentSize = new Size(400, 2000);
    let visibleRect = new Rect(0, 500, 400, 468);

    expect(getEdgeSnapTarget('end', 'y', contentSize, visibleRect)).toBe(2000 - 468);
  });

  it('clamps the end edge target to 0 when content is smaller than the viewport', () => {
    let contentSize = new Size(400, 200);
    let visibleRect = new Rect(0, 0, 400, 468);

    expect(getEdgeSnapTarget('end', 'y', contentSize, visibleRect)).toBe(0);
  });
});

describe('isNearEdge', () => {
  it('is true for the start edge when within the threshold', () => {
    let contentSize = new Size(400, 2000);
    let visibleRect = new Rect(0, 10, 400, 468);

    expect(isNearEdge(visibleRect, contentSize, 'start', 'y', 10)).toBe(true);
  });

  it('is false for the start edge when beyond the threshold', () => {
    let contentSize = new Size(400, 2000);
    let visibleRect = new Rect(0, 11, 400, 468);

    expect(isNearEdge(visibleRect, contentSize, 'start', 'y', 10)).toBe(false);
  });

  it('is true for the end edge when within the threshold', () => {
    let contentSize = new Size(400, 2000);
    // distance from end = 2000 - (1532 + 468) = 0
    let visibleRect = new Rect(0, 1532, 400, 468);

    expect(isNearEdge(visibleRect, contentSize, 'end', 'y', 10)).toBe(true);
  });

  it('is false for the end edge when beyond the threshold', () => {
    let contentSize = new Size(400, 2000);
    let visibleRect = new Rect(0, 1500, 400, 468);

    expect(isNearEdge(visibleRect, contentSize, 'end', 'y', 10)).toBe(false);
  });
});

describe('resolveScrollAdjustment', () => {
  let visibleRect = new Rect(0, 500, 400, 468);
  let contentSize = new Size(400, 2000);

  it('returns the anchor-based target when the anchor resolves', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 610, 400, 40));

    let result = resolveScrollAdjustment(
      'end',
      'y',
      anchor,
      false,
      false,
      false,
      0,
      () => layoutInfo,
      visibleRect,
      contentSize
    );

    expect(result?.y).toBe(600);
  });

  it('keeps the anchor when the user has scrolled away from the edge, even as items resize', () => {
    // The user is NOT near the edge (they scrolled up to read), and an item resizes and grows
    // content. Their reading position must be preserved via the anchor, not yanked to the edge.
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 610, 400, 40));

    let result = resolveScrollAdjustment(
      'end',
      'y',
      anchor,
      false, // wasNearAnchorEdge -- scrolled away
      false, // isScrolling
      true, // itemSizeChanged
      50, // contentSizeDelta > 0
      () => layoutInfo,
      visibleRect,
      contentSize
    );

    // Anchor target (600), never the edge-snap target (2000 - 468 = 1532).
    expect(result?.y).toBe(600);
  });

  it('follows the edge over the anchor while items settle near the edge', () => {
    // The user is following the edge (near it, not scrolling) and items are measuring bigger.
    // Even though the anchor resolves to a different target, we must snap to the edge -- the
    // anchor only compensates for growth on its side of the viewport, so restoring it would
    // strand the edge off-screen (the initial-render "partly scrolled up" bug).
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 610, 400, 40));

    let result = resolveScrollAdjustment(
      'end',
      'y',
      anchor,
      true, // wasNearAnchorEdge -- following the edge
      false, // isScrolling
      true, // itemSizeChanged -- measurement settle
      50, // contentSizeDelta > 0
      () => layoutInfo,
      visibleRect,
      contentSize
    );

    // Edge-snap target (2000 - 468 = 1532), not the anchor target (600).
    expect(result?.y).toBe(2000 - 468);
  });

  it('follows the edge over the anchor while items settle smaller near the edge', () => {
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let layoutInfo = new LayoutInfo('item', 'item', new Rect(0, 610, 400, 40));

    let result = resolveScrollAdjustment(
      'end',
      'y',
      anchor,
      true, // wasNearAnchorEdge -- following the edge
      false, // isScrolling
      true, // itemSizeChanged -- measurement settle
      -50, // contentSizeDelta < 0 (content shrank)
      () => layoutInfo,
      visibleRect,
      contentSize
    );

    // Edge-snap target (2000 - 468 = 1532), not the anchor target (600).
    expect(result?.y).toBe(2000 - 468);
  });

  it('falls back to snapping to the edge when there is no anchor and near the edge', () => {
    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      true,
      false,
      false,
      0,
      () => null,
      visibleRect,
      contentSize
    );

    expect(result?.y).toBe(2000 - 468);
  });

  it('falls back to snapping to the edge when item sizes changed but content grew', () => {
    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      true,
      false,
      true,
      50,
      () => null,
      visibleRect,
      contentSize
    );

    expect(result?.y).toBe(2000 - 468);
  });

  it('returns null when the edge-snap target is already the current position', () => {
    // visibleRect is already at the bottom edge.
    let atEdge = new Rect(0, 2000 - 468, 400, 468);

    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      true,
      false,
      false,
      0,
      () => null,
      atEdge,
      contentSize
    );

    expect(result).toBeNull();
  });

  it('returns null when not near the edge and there is no anchor', () => {
    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      false,
      false,
      false,
      0,
      () => null,
      visibleRect,
      contentSize
    );

    expect(result).toBeNull();
  });

  it('returns null when the user is actively scrolling, even if near the edge', () => {
    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      true,
      true,
      false,
      0,
      () => null,
      visibleRect,
      contentSize
    );

    expect(result).toBeNull();
  });

  it('returns null when items are still resizing and content did not grow', () => {
    let result = resolveScrollAdjustment(
      'end',
      'y',
      null,
      true,
      false,
      true,
      0,
      () => null,
      visibleRect,
      contentSize
    );

    expect(result).toBeNull();
  });
});

describe('ScrollAnchorTracker', () => {
  let anchorInfo: ScrollAnchorInfo = {edge: 'end', axis: 'y', threshold: 50};

  it('captureBeforeLayout returns null when there is no anchor info', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 500, 400, 468);

    let anchor = tracker.captureBeforeLayout(null, [], visibleRect);

    expect(anchor).toBeNull();
  });

  it('captureBeforeLayout delegates to captureScrollAnchor using the anchor info', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 1023, 400, 468);
    let item = new LayoutInfo('item', 'item', new Rect(0, 1032, 400, 40));

    let anchor = tracker.captureBeforeLayout(anchorInfo, [['item', item]], visibleRect);

    expect(anchor?.key).toBe('item');
  });

  it('resolveAfterLayout returns null when there is no anchor info', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 500, 400, 468);
    let contentSize = new Size(400, 2000);

    let result = tracker.resolveAfterLayout({
      anchorInfo: null,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result).toBeNull();
  });

  it('resolveAfterLayout returns null when the previous visible rect has no area', () => {
    let tracker = new ScrollAnchorTracker();
    let contentSize = new Size(400, 2000);

    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: new Rect(0, 0, 0, 0),
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result).toBeNull();
  });

  it('always snaps to the edge on the first anchored layout, even if far from it', () => {
    let tracker = new ScrollAnchorTracker();
    // Far from the bottom edge, well beyond the threshold.
    let visibleRect = new Rect(0, 0, 400, 468);
    let contentSize = new Size(400, 2000);

    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result?.y).toBe(2000 - 468);
  });

  it('skips recomputing on later passes when nothing relevant changed', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 2000 - 468, 400, 468);
    let contentSize = new Size(400, 2000);

    // First pass establishes hasSnappedToEdge.
    tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result).toBeNull();
  });

  it('recomputes on later passes when the content size changed', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 2000 - 468, 400, 468);
    let contentSize = new Size(400, 2000);

    tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    let grownContentSize = new Size(400, 2200);
    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize: grownContentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result?.y).toBe(2200 - 468);
  });

  it('holds the viewport with the anchor when content grows without an item resize (prepend near the edge)', () => {
    // Older content is prepended above the viewport while the user sits near the edge: content
    // grows (contentSizeDelta > 0) but no item resized (itemSizeChanged is false). This is not a
    // measurement settle, so the anchor wins and the viewport stays put instead of snapping to
    // the new edge -- the prepended content shouldn't yank the user's view down.
    let tracker = new ScrollAnchorTracker();

    // Pass 1 establishes hasSnappedToEdge so the next pass is a normal relayout, not the first.
    let firstContentSize = new Size(400, 2000);
    tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: new Rect(0, 2000 - 468, 400, 468),
      previousContentSize: firstContentSize,
      contentSize: firstContentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    // Pass 2: viewport near the old edge (snap-eligible) and content grew 2000 -> 2200, but an
    // anchor resolves, so the anchor wins over the snap.
    let nearOldEdge = new Rect(0, 1520, 400, 468); // 12px from the old bottom edge
    let grownContentSize = new Size(400, 2200);
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let anchorLayoutInfo = new LayoutInfo('item', 'item', new Rect(0, 1510, 400, 40));

    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor,
      previousVisibleRect: nearOldEdge,
      previousContentSize: firstContentSize,
      contentSize: grownContentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => anchorLayoutInfo
    });

    // Anchor target (1510 - 10 = 1500), never the edge snap (2200 - 468 = 1732).
    expect(result?.y).toBe(1500);
  });

  it('follows the edge to the real bottom as estimated items measure on initial render', () => {
    // Reproduces the initial-render settle: pass 1 snaps to the estimated bottom, then items
    // measure bigger and content grows. An anchor is captured and it "moves" (items above it
    // grew too), so a terminal anchor restore would land the viewport short of the new bottom
    // -- the "partly scrolled up on first render" bug. Because the user is following the edge and
    // items are settling, we must snap to the real bottom instead.
    let tracker = new ScrollAnchorTracker();

    // Pass 1: first anchored layout snaps to the estimated bottom (1296 - 468 = 828).
    let estimatedContentSize = new Size(400, 1296);
    tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: new Rect(0, 0, 400, 468),
      previousContentSize: estimatedContentSize,
      contentSize: estimatedContentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    // Pass 2: items measured, content grew 1296 -> 1692. The anchor resolves to 960 (it moved
    // down 132px as items above it grew), but restoring it would strand the bottom 264px off.
    let atEstimatedBottom = new Rect(0, 828, 400, 468);
    let measuredContentSize = new Size(400, 1692);
    let anchor: ScrollAnchor = {key: 'item', corner: 'topLeft', offset: 10};
    let movedAnchorInfo = new LayoutInfo('item', 'item', new Rect(0, 970, 400, 40));

    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor,
      previousVisibleRect: atEstimatedBottom,
      previousContentSize: estimatedContentSize,
      contentSize: measuredContentSize,
      itemSizeChanged: true,
      isScrolling: false,
      getLayoutInfo: () => movedAnchorInfo
    });

    // The real bottom (1692 - 468 = 1224), not the anchor target (960).
    expect(result?.y).toBe(1692 - 468);
  });

  it('reset() clears tracked state so the next call behaves like a first pass again', () => {
    let tracker = new ScrollAnchorTracker();
    let visibleRect = new Rect(0, 2000 - 468, 400, 468);
    let contentSize = new Size(400, 2000);

    tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: visibleRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    tracker.reset();

    // Far from the edge; would return null on a non-first pass, but reset() means this counts
    // as the first pass again, so it should snap unconditionally.
    let farRect = new Rect(0, 0, 400, 468);
    let result = tracker.resolveAfterLayout({
      anchorInfo,
      anchor: null,
      previousVisibleRect: farRect,
      previousContentSize: contentSize,
      contentSize,
      itemSizeChanged: false,
      isScrolling: false,
      getLayoutInfo: () => null
    });

    expect(result?.y).toBe(2000 - 468);
  });
});
