<!-- Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2026-07-07
- RFC PR:
- Authors: Vincent

# Synchronizing Virtualizer Visible Rect After Programmatic Collection Scrolling

## Summary

This RFC proposes an internal mechanism for virtualized collection components to refresh the virtualizer's visible rect after programmatic scrolling caused by keyboard focus movement. This fixes cases where async virtualized collections update focus to newly loaded items, but the virtualizer continues using a stale visible rect and does not keep the focused item inside the viewport.

## Motivation

Async collection navigation relies on a sequence of state updates:

1. Keyboard navigation computes a target key.
2. SelectionManager updates the focused key.
3. The focused element is scrolled into view.
4. The virtualizer observes the new scroll position and renders the correct visible views.

Today, step 4 is not reliable for all programmatic scrolling paths. In the bug reported in [#10129](https://github.com/adobe/react-spectrum/issues/10129), a ListBox with async loading behaves correctly without Virtualizer: pressing End moves focus to the last loaded item, scrolls it into view, and triggers loading more items. When the same ListBox is wrapped in Virtualizer, focus can move to a newly loaded item while that item remains outside the visible listbox viewport.

This happens because there are two related issues:

1. The layout may fail to compute layout info for a newly added persisted key.
2. After focus-driven programmatic scrolling, the virtualizer's visible rect can remain stale until a later scroll or resize update.

Fixing only the layout computation is not sufficient. In local regression testing, removing the virtualizer refresh path while keeping the `ListLayout` fix still caused the browser test to fail: focus moved to the newly loaded item, but the item stayed outside the listbox viewport.

The expected outcome is that virtualized async ListBox keyboard navigation matches non-virtualized ListBox behavior. Pressing End or PageDown should move focus, scroll the focused item into view, update the virtualizer visible rect, and continue to trigger loading more items when the end of the loaded collection is reached.

## Detailed Design

### Persisted key layout computation

`ListLayout.ensureLayoutInfo` currently needs to handle keys that are outside the layout area computed so far. This happens during random access navigation such as Home or End, and also when async loading appends new items after a previously expanded requested rect.

The existing area-based guard can be fooled by cross-axis overscan. For example, a vertical list can have an overscanned requested rect whose area appears larger than the content area even though the requested rect has not actually covered the newly appended item. In that case, a newly focused persisted key exists in the collection but does not have layout info.

The proposed condition is to compute the full layout when the key is missing from `layoutNodes` but exists in the current collection:

```ts
if (!this.layoutNodes.has(key) && this.lastCollection?.getItem(key)) {
  this.requestedRect = new Rect(0, 0, Infinity, Infinity);
  this.rootNodes = this.buildCollection();
  this.requestedRect = new Rect(0, 0, this.contentSize.width, this.contentSize.height);
  return true;
}
```

This keeps the full layout pass scoped to keys that are known to exist. It avoids repeatedly laying out for keys that are no longer in the collection, while ensuring newly appended persisted keys can be rendered.

### Visible rect refresh after programmatic scroll

`useSelectableCollection` already scrolls the focused element into view when the focused key changes. For virtualized collections, this can programmatically update the scroll position without the virtualizer immediately observing the new visible rect. If the virtualizer keeps using the old visible rect, the DOM focus target and the virtualizer's visible views can diverge.

The proposed design adds an internal optional callback to `CollectionRenderer`:

```ts
interface CollectionRenderer {
  isVirtualized?: boolean;
  layoutDelegate?: LayoutDelegate;
  dropTargetDelegate?: DropTargetDelegate;
  refreshVisibleRect?: () => void;
  CollectionRoot: React.ComponentType<CollectionRootProps>;
  CollectionBranch: React.ComponentType<CollectionBranchProps>;
}
```

This callback is intentionally internal. It is not exposed as a public component prop and should not be documented for public use.

The data flow is:

```text
Keyboard End/PageDown
  -> useSelectableCollection updates focusedKey
  -> React renders the persisted focused item
  -> effect scrolls the focused item into view
  -> UNSTABLE_virtualizerRefresh()
  -> useScrollView re-reads scrollTop/scrollLeft
  -> Virtualizer receives an updated visibleRect
  -> visibleViews match the actual viewport
```

### Virtualizer ownership of the refresh callback

`Virtualizer` owns a ref to the latest `useScrollView().refreshVisibleRect` callback. The top-level `CollectionRenderer` value exposes a stable callback that calls the latest ref value:

```ts
let refreshVisibleRectRef = useRef<(() => void) | null>(null);
let renderer: CollectionRenderer = useMemo(
  () => ({
    isVirtualized: true,
    layoutDelegate: layout,
    dropTargetDelegate: layout.getDropTargetFromPoint
      ? (layout as DropTargetDelegate)
      : undefined,
    refreshVisibleRect: () => refreshVisibleRectRef.current?.(),
    CollectionRoot,
    CollectionBranch
  }),
  [layout]
);
```

`CollectionRoot` receives the actual `refreshVisibleRect` function from `useScrollView` and updates the ref in a layout effect:

```ts
let {contentProps, refreshVisibleRect} = useScrollView(...);
let refreshVisibleRectRef = useContext(RefreshVisibleRectContext);
useLayoutEffect(() => {
  if (refreshVisibleRectRef) {
    refreshVisibleRectRef.current = refreshVisibleRect;
    return () => {
      refreshVisibleRectRef.current = null;
    };
  }
}, [refreshVisibleRectRef, refreshVisibleRect]);
```

The ref must not be written during render. A layout effect keeps the callback updated after commit and before subsequent browser input.

### Collection hook integration

React Aria Components collection components read `refreshVisibleRect` from `CollectionRendererContext` and pass it to their underlying React Aria hooks:

- `ListBox` passes it to `useListBox`.
- `GridList` passes it to `useGridList`.
- `Table` passes it to `useTable` through `useGrid`.

The React Aria hooks pass this through to `useSelectableCollection` as a private option:

```ts
UNSTABLE_virtualizerRefresh?: () => void;
```

`useSelectableCollection` invokes this callback only after it scrolls a focused item into view and only for virtualized collections:

```ts
if (isVirtualized) {
  UNSTABLE_virtualizerRefresh?.();
}
```

This keeps non-virtualized collection behavior unchanged.

## Documentation

No public documentation is needed because this is an internal behavior fix. Existing documented keyboard navigation behavior remains the same: virtualized collections should keep focused items visible during keyboard navigation.

A changelog entry may mention that async virtualized collections now keep keyboard-focused items visible while loading additional pages.

## Drawbacks

The main drawback is that this introduces private plumbing across several collection layers:

```text
Virtualizer
  -> CollectionRenderer
  -> ListBox / GridList / Table
  -> useListBox / useGridList / useGrid
  -> useSelectableCollection
```

This increases internal coupling between Virtualizer state and collection focus behavior.

The callback is also timing-sensitive. The latest `useScrollView` refresh callback must be available after commit, and it must not be written during render. This requires an additional context/ref bridge and a layout effect in `CollectionRoot`.

There is also some risk that a private refresh callback could be overused in the future. The intended use is narrow: refresh the visible rect after focus-driven programmatic scrolling in virtualized collections. It should not become a general mechanism for forcing virtualizer updates from arbitrary code paths.

## Backwards Compatibility Analysis

This change is backwards compatible. It does not add or remove public props. Existing non-virtualized collections are unaffected. Existing virtualized collections should only observe improved behavior: keyboard navigation keeps the focused item visible after async data is appended.

The new `refreshVisibleRect` callback on `CollectionRenderer` and the `UNSTABLE_virtualizerRefresh` hook option are private/internal. They should not be documented as public APIs.

## Alternatives

### Only fix `ListLayout.ensureLayoutInfo`

The smallest possible fix is to only update `ListLayout.ensureLayoutInfo` so that a missing key triggers a full layout pass when the key exists in the current collection.

This is necessary but not sufficient. Local testing with the virtualizer refresh path removed still failed the browser regression: focus moved to the newly loaded item, but the item remained outside the listbox viewport. This shows that persisted-key layout computation and visible rect synchronization are separate requirements.

### Rely on native scroll events

Another option is to rely on browser scroll events after `scrollIntoView` or `scrollIntoViewport`. In practice, this is not reliable enough for the virtualizer's state update timing. The collection can update focus and layout before the virtualizer observes the new scroll position, leaving the visible rect stale during the next interaction.

### Change `OverscanManager`

The issue discussion considered changing overscan behavior to avoid cross-axis bleed. This could reduce the likelihood that `requestedRect.area` incorrectly appears large enough. However, overscan is lower-level than the focus/async loading problem, and changing it risks affecting other virtualized layouts, especially Table and other two-dimensional cases.

### Add scroll direction metadata to layouts

Layouts could expose their supported scroll direction so the virtualizer can clamp overscan per axis. This may be useful long term, but it is broader than the current bug fix and does not directly address stale visible rect state after programmatic scrolling.

### Limit the refresh path to ListBox

Because the reported bug is in ListBox, another option is to pass the refresh callback only through ListBox. This reduces scope, but GridList and Table share the same virtualized collection renderer and selectable collection focus path. Passing the callback consistently avoids fixing one collection while leaving equivalent virtualized keyboard navigation paths stale.

## Open Questions

1. Is an internal `refreshVisibleRect` callback acceptable as the bridge between collection keyboard navigation and Virtualizer state?
2. Should this callback live on `CollectionRenderer`, or should there be a narrower context/provider only for virtualized collection roots?
3. Should the private `UNSTABLE_virtualizerRefresh` option be added to ListBox, GridList, and Table for consistency, or should the first implementation be limited to ListBox?
4. Should the `ListLayout.ensureLayoutInfo` condition use `lastCollection.getItem(key)` as proposed, or should it use a more conservative dimension-based check?

## Help Needed

Feedback is needed on the preferred internal boundary for refreshing visible rect state. I can implement the final approach and add focused regression coverage for ListBox, plus additional GridList/Table coverage if reviewers think the shared hook path should be covered.

## Frequently Asked Questions

### Why not only fix `ListLayout`?

Because browser regression testing shows that layout computation and visible rect synchronization are separate. Without the refresh path, the item can be laid out and focused but still remain outside the visible viewport.

### Is this public API?

No. The new callback is internal and optional. It is only passed through private collection renderer/hook plumbing.

### Why include GridList and Table?

They share the same selectable collection behavior and virtualized collection renderer path. Passing the callback consistently avoids fixing ListBox while leaving equivalent virtualized keyboard navigation paths stale.

### Why use `useLayoutEffect`?

The callback ref must not be written during render. A layout effect keeps it updated after commit and before browser paint/subsequent input.

## Related Discussions

- Issue: https://github.com/adobe/react-spectrum/issues/10129
- Implementation PR: https://github.com/adobe/react-spectrum/pull/10165
- RFC template: https://github.com/adobe/react-spectrum/blob/main/rfcs/template.md
