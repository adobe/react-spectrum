---
description: Use when working on virtualization/scrolling in react-spectrum — reading, debugging, or modifying the Virtualizer, ScrollView, Layout (ListLayout/GridLayout/TableLayout/WaterfallLayout), LayoutInfo, Rect, ReusableView, VirtualizerState, overscan, view recycling, estimated/measured sizes, sticky headers, or how RAC/S2 collections (ListBox, GridList, Table, Tree, CardView, Picker, ComboBox) opt into virtualization.
---

# Virtualizer & ScrollView

How react-spectrum renders huge collections by only mounting the views inside (or near) the visible rectangle, recycling DOM as you scroll.

## Two layers

- **Framework-agnostic core** — `@react-stately/virtualizer`. Source lives in `packages/react-stately/src/virtualizer/` and `packages/react-stately/src/layout/`. Pure TS: layout math + which-views-are-visible. No React, no DOM (except `performance.now`/`clientWidth` guards). Re-exported through `react-stately/useVirtualizerState`.
- **React binding** — `@react-aria/virtualizer`. Source in `packages/react-aria/src/virtualizer/`. Owns the scroll container, scroll/resize listeners, and turning `ReusableView`s into DOM. Re-exported through `react-aria/private/virtualizer/*`.
- **RAC integration** — `packages/react-aria-components/src/Virtualizer.tsx` wires a `Layout` into RAC's collection renderer so ListBox/GridList/Table/Tree virtualize. S2 (`@react-spectrum/s2`) consumes that RAC `<Virtualizer>`.

Note: the `src/` dirs under `packages/@react-stately/virtualizer` and `packages/@react-aria/virtualizer` only contain `index.ts` re-exports; the real code is in the mono-package `packages/react-stately` / `packages/react-aria`.

## Data flow (one frame)

```
ScrollView (DOM scroll/resize)
  → onVisibleRectChange(rect) / onSizeChange(size)
  → useVirtualizerState setState
  → Virtualizer.render({visibleRect, size, collection, layout, ...})
      → relayout(): layout.update() → layout.getContentSize()
      → updateSubviews(): getVisibleLayoutInfos() → diff → recycle ReusableViews
  → returns visibleViews (root's children)
  → React renders each as <VirtualizerItem> (absolute-positioned from LayoutInfo.rect)
```

---

## ScrollView — `packages/react-aria/src/virtualizer/ScrollView.tsx`

The scroll container. `useScrollView` (`ScrollView.tsx:70`) returns `scrollViewProps` (outer, `overflow: auto`) and `contentProps` (inner "sizer" div).

- **Sizer element**: inner div gets `width`/`height` = `contentSize` and `position: relative` (`ScrollView.tsx:382`). This is what gives the scrollbar its length; items are absolutely positioned inside it. Non-finite content sizes are dropped so an axis can be unbounded.
- **Scroll handling**: a single **document-level capturing** `scroll` listener (`ScrollView.tsx:222`), not a React `onScroll`. The handler (`ScrollView.tsx:139`) checks whether the event target is the scroll view itself vs. an ancestor/window:
  - target IS the scroll view → read `scrollTop` + `getScrollLeft(target, direction)`, clamp to `[0, contentSize - size]` to stop rubber-band jitter (`ScrollView.tsx:163`).
  - target is an ancestor/window → recompute `viewportOffset` from `getBoundingClientRect` (window-scrolling case).
- **Visible rect** (`updateVisibleRect`, `ScrollView.tsx:104`): with `allowsWindowScrolling`, intersects the window viewport with the scroll view so an unbounded-height list still virtualizes as the *page* scrolls; otherwise it's just `scrollPosition + size`. Emitted via `flushSync` so layout is synchronous with the scroll (avoids blank flashes).
- **isScrolling**: set true on first scroll, reset by a **300ms** idle timeout (`ScrollView.tsx:196`). While scrolling, inner div gets `pointerEvents: none` and DOM reordering is deferred (see recycling). Also toggles a typekit MutationObserver pause via `tk.disconnect-observer`/`tk.connect-observer` events.
- **Resize**: `useResizeObserver` on **border-box** (`ScrollView.tsx:360`) + a `window` resize listener. `updateSize` (`ScrollView.tsx:241`) guards reentrancy (`isUpdatingSize`) and does **at most two** layout passes to settle scrollbar appear/disappear, matching browser CSS-grid behavior (`ScrollView.tsx:285`).
- **Overflow rules** (`ScrollView.tsx:368`): forces `overflow-x: hidden` when `contentSize.width === size.width` to stop a resize-observer/frame-rate feedback loop that flickers the horizontal scrollbar.
- **RTL**: `getScrollLeft`/`setScrollLeft` in `packages/react-aria/src/virtualizer/utils.ts` normalize `scrollLeft` across the three browser RTL conventions (`negative`, `positive-descending`, `positive-ascending`) detected once by `getRTLOffsetType` (`utils.ts:29`).

---

## Virtualizer core — `packages/react-stately/src/virtualizer/Virtualizer.ts`

Central class. Holds `collection`, `layout`, `contentSize`, `visibleRect`, `size`, `persistedKeys`, a `Map<Key, ChildView>` of visible views, a `RootView`, and an `OverscanManager`.

- **`render(opts)`** (`Virtualizer.ts:280`) — the entry point called every React render. Diffs incoming `collection`/`layout`/`persistedKeys`/`visibleRect`/`size`/`invalidationContext`/`isScrolling` against current state, sets `needsLayout` vs `needsUpdate`, then calls `relayout()` or `updateSubviews()`. Returns `Array.from(this._rootView.children)`.
  - A visibleRect/size change only forces layout if `layout.shouldInvalidate(newRect, oldRect)` returns true (`Virtualizer.ts:326`) — otherwise it's a cheap `updateSubviews`. Note `size` here is a **layout size** (scroll-view dimensions), distinct from `visibleRect` whose w/h can change during window scrolling.
- **`relayout(context)`** (`Virtualizer.ts:169`) — `layout.update(context)`, then `contentSize = layout.getContentSize()`, then clamps scroll offset into content (scrolls to top if `contentChanged`). If offset changed it asks the delegate to re-scroll; else `updateSubviews()`.
- **`getVisibleLayoutInfos()`** (`Virtualizer.ts:197`) — asks the `OverscanManager` for the overscanned rect, calls `layout.getVisibleLayoutInfos(rect)`, returns a `Map<Key, LayoutInfo>`. In **test env** (unless `VIRT_ON`) and when `clientWidth/Height` aren't mocked, it uses the **full content rect** so tests render everything.
- **`updateSubviews()`** (`Virtualizer.ts:223`) — the reconciliation:
  1. Delete views whose key is gone or whose parent changed; hand them back to the parent's reuse queue (`reuseChild`).
  2. For each visible LayoutInfo: reuse an existing view (re-render only if the backing collection item identity changed) or pull a recycled view via `getReusableView`.
  3. Views never reused get removed from DOM and the parent's reuse queue is cleared (FIFO churn hurts later reuse).
  4. **DOM reordering is deferred until scrolling stops** (`Virtualizer.ts:269`): absolute positioning means visual order is independent of DOM order, but DOM order matters for screen readers, so it's fixed to topological (parents-before-children) order only when `!isScrolling`.
- **`updateItemSize(key, size)`** (`Virtualizer.ts:389`) — forwards to `layout.updateItemSize`; if it reports a change, invalidates with `itemSizeChanged: true`.
- **Persisted keys** (`isPersistedKey`, `Virtualizer.ts:91`) — a key is persisted if it's in the set OR is an *ancestor* of a persisted key. Persisted views stay mounted even when scrolled out of view (used to keep the focused/active item in the DOM so focus isn't lost).

### OverscanManager — `packages/react-stately/src/virtualizer/OverscanManager.ts`

Expands the visible rect so views just outside the viewport are pre-rendered. Overscan = **1/3 of the visible height/width** on the leading edge (`OverscanManager.ts:37`). Direction is chosen from scroll **velocity** (tracked over a 500ms window, `OverscanManager.ts:21`): only extends in the direction of travel — scrolling up extends `y` upward, down just extends height.

---

## Layout base contract — `packages/react-stately/src/virtualizer/Layout.ts`

Abstract class; subclass and implement the three abstract methods.

| Method | Required? | Purpose | Source |
|---|---|---|---|
| `getVisibleLayoutInfos(rect)` | abstract | Return `LayoutInfo[]` intersecting `rect` (+ sticky/persisted). Hot path — called every frame. | `Layout.ts:41` |
| `getLayoutInfo(key)` | abstract | `LayoutInfo` for one key (random access, e.g. Home/End, drop targets). | `Layout.ts:49` |
| `getContentSize()` | abstract | Total scrollable size → drives the sizer/scrollbar. | `Layout.ts:54` |
| `update(invalidationContext)` | optional | Pre-compute before the getters. Where most layouts build their cache. | `Layout.ts:82` |
| `shouldInvalidate(newRect, oldRect)` | optional | Default: re-layout only when **size** changes. Return `true` always for sticky-header layouts that must recompute while scrolling. | `Layout.ts:62` |
| `shouldInvalidateLayoutOptions(new, old)` | optional | Default: identity compare. Override to skip re-layout on irrelevant option changes. | `Layout.ts:72` |
| `updateItemSize(key, size)` | optional | Record a measured size; return `true` if it changed the layout. | `Layout.ts:87` |
| `getDropTargetLayoutInfo(target)` | optional | Position the drop indicator. | `Layout.ts:92` |

`virtualizer` back-reference is set by `Virtualizer.render` (`Virtualizer.ts:294`); inside a layout, read `this.virtualizer.collection`, `.size`, `.visibleRect`, `.persistedKeys`, `.contentSize`.

### Concrete layouts

- **`ListLayout`** — `packages/react-stately/src/layout/ListLayout.ts`. Vertical (or horizontal) stack, fixed or variable row sizes, sections/headers/loaders. The base for most others.
- **`GridLayout`** — `packages/react-stately/src/layout/GridLayout.ts`. Fixed-size cells in rows/columns (CardView grid, ListBox `layout="grid"`).
- **`TableLayout` extends `ListLayout`** — `packages/react-stately/src/layout/TableLayout.ts`. Adds column widths (`TableColumnLayout`), **sticky** columns/headers (`isSticky = true`, `zIndex`, `TableLayout.ts:359`), and persisted column indices per row (`persistedIndices`, `TableLayout.ts:566`).
- **`WaterfallLayout`** — `packages/react-stately/src/layout/WaterfallLayout.ts`. Masonry columns.

RAC subclasses in `packages/react-aria-components/src/GridLayout.ts` / `TableLayout.ts` just add `useLayoutOptions()` to inject locale `direction` (see integration below).

---

## LayoutInfo & Rect — the lightweight position records

`LayoutInfo` (`packages/react-stately/src/virtualizer/LayoutInfo.ts`) — one per rendered element; layouts create them, the Virtualizer turns them into DOM.

| Field | Meaning |
|---|---|
| `type` | matches collection node `type` (`item`, `header`, `section`, `loader`, `dropIndicator`…); picks the reuse pool. |
| `key` | matches collection node key. |
| `parentKey` | parent LayoutInfo key (hierarchy: sections, table rows→cells). `null` = child of root. |
| `rect` | `Rect` position+size (see below). |
| `estimatedSize` | `true` → measured on first mount, then `updateItemSize` corrects it. |
| `isSticky` | positioned `sticky` instead of `absolute`; stays visible while scrolling. |
| `opacity` / `transform` / `zIndex` / `allowOverflow` | passed straight to element style. |

`Rect` (`packages/react-stately/src/virtualizer/Rect.ts`) — `{x, y, width, height}` with getters `maxX/maxY/area/topLeft…` and helpers `intersects`, `containsRect`, `containsPoint`, `union`, `intersection`, `equals`. `intersects` short-circuits to `true` in test env unless `VIRT_ON` (`Rect.ts:96`). `Size` and `Point` are the trivial companions in the same dir.

---

## View recycling — `packages/react-stately/src/virtualizer/ReusableView.ts`

`ReusableView` = a slot that can be re-pointed at different content as you scroll, avoiding mount/unmount churn.

- Tree of views: one `RootView`; `ChildView`s each have a `parent`, a `children` Set, and per-type `reusableViews` queues.
- **Keyed by `type`** (`getReusableView(reuseType)`, `ReusableView.ts:61`): a scrolled-off row view is reused only for another row, a cell for another cell.
- Reuse queues are **FIFO** (`shift`/`push`) so sibling DOM order (e.g. cells in a row) stays stable across reuse (`ReusableView.ts:62`).
- `reuseChild` calls `prepareForReuse()` (clears `content`/`rendered`/`layoutInfo`) then queues it (`ReusableView.ts:75`).
- The Virtualizer caches rendered React elements per collection item in a `WeakMap` (`_renderedContent`, `Virtualizer.ts:138`) so re-rendering a still-present item is free.

---

## React binding

- **`useVirtualizerState`** — `packages/react-stately/src/virtualizer/useVirtualizerState.ts:50`. Owns `visibleRect`/`size`/`isScrolling`/`invalidationContext` state, constructs one `Virtualizer` with a delegate (`setVisibleRect`, `renderView`, `invalidate`, `useVirtualizerState.ts:58`), calls `virtualizer.render(...)` **during render**, and fires `onVisibleRectChange` from a layout effect. `size` passed to the core is `visibleRect` unless `allowsWindowScrolling` (then the real scroll-view `size`).
- **`Virtualizer` (standalone, v3)** — `packages/react-aria/src/virtualizer/Virtualizer.tsx`. Composes `useVirtualizerState` + `<ScrollView>`, syncs `scrollLeft/scrollTop` back to the DOM on visible-rect change (`Virtualizer.tsx:71`), renders each `ReusableView` via `renderWrapper` → `<VirtualizerItem>`, and wires `useLoadMore`.
- **`VirtualizerItem` / `layoutInfoToStyle`** — `packages/react-aria/src/virtualizer/VirtualizerItem.tsx`. Turns a `LayoutInfo` into inline style: `position: sticky|absolute`, top/left offset **relative to parent** (RTL flips to `right`, `VirtualizerItem.tsx:54`), `contain: size layout style`, `overflow: hidden` unless `allowOverflow`. Cached per LayoutInfo in a `WeakMap`.
- **`useVirtualizerItem`** — `packages/react-aria/src/virtualizer/useVirtualizerItem.ts`. When `layoutInfo.estimatedSize`, measures the DOM node (`scrollWidth/scrollHeight` after clearing `height`) and calls `virtualizer.updateItemSize` (`useVirtualizerItem.ts:46`). Skips measurement when the element is `display:none` to avoid reporting size 0.

---

## RAC / S2 integration — `packages/react-aria-components/src/Virtualizer.tsx`

Opt in by wrapping a collection component:

```tsx
<Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 40}}>
  <ListBox>{/* items */}</ListBox>
</Virtualizer>
```

- `<Virtualizer>` (`Virtualizer.tsx:64`) instantiates the layout (accepts a class or instance) and publishes a `CollectionRenderer` with `isVirtualized: true`, `layoutDelegate`, `dropTargetDelegate` through `CollectionRendererContext`. The child collection reads that context and switches from plain rendering to virtualized rendering.
- `CollectionRoot` (`Virtualizer.tsx:88`) runs `useVirtualizerState({allowsWindowScrolling: true, ...})` + `useScrollView`, and renders the visible views. `CollectionBranch` (`Virtualizer.tsx:146`) renders a parent view's children (nested rows/sections).
- `useLayoutOptions()` (a `LayoutOptionsDelegate` hook on the layout) lets a layout pull hook-derived options like locale `direction` and merge them with the user's `layoutOptions` (`Virtualizer.tsx:100`).
- **Persisted keys**: `usePersistedKeys(focusedKey)` (`packages/react-aria-components/src/Collection.tsx:291`) returns `new Set([focusedKey])` so the focused item stays mounted when scrolled away — critical for keyboard nav.
- **Which layout**: `ListLayout` = vertical/horizontal lists (ListBox stack, GridList, Menu, Picker, ComboBox, Tree); `GridLayout` = fixed grid of cards/tiles (ListBox `layout="grid"`, CardView); `WaterfallLayout` = masonry (CardView); `TableLayout` = tables with sticky headers/columns. RAC ListBox also exposes a plain `layout="stack" | "grid"` prop (`packages/react-aria-components/src/ListBox.tsx:141`) that is a separate, simpler concept from the virtualizer `layout`. S2 examples: `packages/@react-spectrum/s2/src/{ListView,TableView,CardView,Picker,ComboBox,TreeView}.tsx`.

---

## Worked example — ListLayout vertical trace

Given `rowHeight: 40`, `gap: 0`, `padding: 0`, a 1000-item list, viewport 400px tall scrolled to `y=2000`:

1. **`update()`** (`ListLayout.ts:338`) — checks `shouldInvalidateEverything` (size/gap/rowSize/orientation change → clear cache, `ListLayout.ts:303`), applies option overrides, calls `buildCollection()`, prunes deleted keys, snapshots `validRect = requestedRect`.
2. **`buildCollection(offset=padding)`** (`ListLayout.ts:381`) — walks collection nodes, accumulating `offset`. Rows **entirely before `requestedRect`** are skipped (offset advanced without building a node) unless already cached (`ListLayout.ts:399`). Once `offset` passes `requestedRect.maxY` it stops building and just adds the remaining rows' heights as estimate (`ListLayout.ts:422`). Sets `contentSize = Size(virtualizer.size.width, offset)` → ~`1000*40 = 40000px` tall.
3. **`buildItem(node, x, y)`** (`ListLayout.ts:627`) — fixed `rowSize` → `rect = Rect(0, y, width, 40)`, `estimatedSize=false`. If no `rowSize`, reuses the previous height or `estimatedRowSize` and marks `estimatedSize=true` (measured later).
4. **Overscan**: Virtualizer expands the ~`[2000,2400]` visible rect by 1/3 (≈133px, leading edge by velocity).
5. **`getVisibleLayoutInfos(rect)`** (`ListLayout.ts:219`) — snaps `rect` to whole-row multiples so the count stays stable, `layoutIfNeeded(rect)` unions+rebuilds if the rect grew (`ListLayout.ts:257`), then collects nodes where `isVisible` (`ListLayout.ts:293`): rect-intersecting **OR** sticky/header/loader/persisted. Returns ~13–14 rows around index 50.
6. React mounts only those `<VirtualizerItem>`s, each `position: absolute; top: <y - parentY>`.

**Variable sizes**: an item with `estimatedRowSize` renders estimated, `useVirtualizerItem` measures it → `updateItemSize` (`ListLayout.ts:674`) writes the measured height into a **copied** LayoutInfo (so caches invalidate), shrinks `validRect` to only rows above it, bumps `requestedRect`, and invalidates parents up the tree. Next frame re-lays-out from that point down.

---

## Gotchas & common tasks

- **What triggers a re-layout** (vs. cheap subview update): collection identity change, layout identity change, `size` change where `shouldInvalidate` returns true, or an `invalidationContext` with `itemSizeChanged`/`sizeChanged`/`offsetChanged`/`layoutOptionsChanged` (`Virtualizer.ts:340`). Pure scroll within the same size is *not* a re-layout unless the layout opts in.
- **Estimated vs. measured**: set `estimatedRowSize`/`estimatedHeadingSize` (not `rowSize`) for variable content. Estimated items flash to their real height after mount+measure; the scrollbar length is approximate until measured. Fixed `rowSize` skips measurement entirely — cheapest.
- **Custom Layout**: extend `Layout`, implement the 3 abstract methods; build your cache in `update()`, keyed so `getLayoutInfo` is O(1). Return sticky items and persisted keys from `getVisibleLayoutInfos` even when outside the rect. Override `shouldInvalidate` to return `true` if positions depend on scroll offset (sticky headers).
- **Sticky headers/columns**: set `LayoutInfo.isSticky = true` (+ `zIndex`); `layoutInfoToStyle` emits `position: sticky` and keeps it in normal flow (`display: inline-block`). See `TableLayout.ts:359`.
- **Persisted (offscreen) keys**: focused/active items are kept mounted via `persistedKeys`; don't assume `getVisibleView(key)` returning a view means the key is on screen.
- **Load more**: `useLoadMore` (`packages/react-aria/src/utils/useLoadMore.ts:45`) fires `onLoadMore` when `scrollHeight - scrollTop - clientHeight < clientHeight * scrollOffset`. Loader sentinels are laid out at estimated positions even when off-screen (`ListLayout.ts:422`) so the scrollbar accounts for them.
- **Window scrolling**: `allowsWindowScrolling` (RAC default) lets an unbounded-height list virtualize against the page viewport by intersecting viewport ∩ scroll-view (`ScrollView.tsx:104`).
- **Test env quirks**: in Jest without `VIRT_ON`, `Rect.intersects` and `getVisibleLayoutInfos` short-circuit to render the **entire** collection (`Rect.ts:96`, `Virtualizer.ts:197`), and unmocked `clientWidth/Height` become `Infinity` (`ScrollView.tsx:261`). To exercise real virtualization in a test, set `process.env.VIRT_ON` and mock `clientWidth`/`clientHeight`.
- **Drag & drop**: `getDropTargetFromPoint` (`ListLayout.ts:737`) and `getDropTargetLayoutInfo` (`ListLayout.ts:799`) position the drop indicator; RAC wraps items with before/after drop indicators in `renderWrapper` (`react-aria-components/src/Virtualizer.tsx:177`).
- **Don't move DOM order to fix visual order** — items are absolutely positioned; ordering only matters for a11y and is intentionally deferred until scroll stops (`Virtualizer.ts:269`).
