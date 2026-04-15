# Replacing react-spectrum's Fake DOM with Real DOM

## What was done

React-spectrum's collection system uses a two-phase render: React components first render into a hidden tree to build a Collection data structure, then the real UI renders from that Collection. The hidden tree was backed by a fake DOM — custom `Document`, `ElementNode`, and `TextNode` classes in `packages/react-aria/src/collections/Document.ts` that mimicked a subset of the browser DOM API.

The goal was to replace this fake DOM with a real detached DOM element, using `createPortal` to render into it, and relying on the browser's native capabilities instead of reimplementing them.

## Why

The fake DOM duplicated browser functionality: tree management, child ordering, sibling traversal, node insertion/removal. A real detached `<div>` gets all of this for free. The fake DOM also required its own visibility tracking (an `isHidden` property with a custom style setter), its own node registration lifecycle, and its own mutation detection — all things the browser already does.

## Limitations and how they were overcome

### First attempt: Proxy-based interception (abandoned)

The initial implementation replaced the fake DOM with real elements but kept the same synchronous architecture. This required:

- **Proxy on `style`** to intercept `style.display = 'none'`. React hides stale Suspense content by setting this during the commit mutation phase. The fake DOM caught this via its custom style setter. With real elements, a Proxy was installed on each element's `style` property to detect the change and mark the element as hidden.
- **Ref callbacks with complex dirty tracking** that registered DOM nodes, associated props, tracked siblings, marked dirty flags, and synchronously triggered collection rebuilds.
- **`queueMicrotask` in `subscribe()`** to handle React.Activity transitions, where `useSyncExternalStore`'s `updateStoreInstance` passive effect doesn't replay.

This passed all tests (602 across Table, ListBox, GridList, Menu, Select, ComboBox, TagGroup, Tree, Tabs, Breadcrumbs, Disclosure). But it essentially recreated the fake DOM's behavior with more complexity on top of real DOM nodes — monkey-patching native objects and running dense logic in ref callbacks. It defeated the purpose of using real DOM.

### Key realization

If `updateCollection` is deferred to a microtask, by the time it runs, all of React's synchronous commit mutations have already settled. You don't need to intercept anything — just read the DOM state directly. `element.style.display === 'none'`? Check it when building the collection. Node added or removed? The DOM tree already reflects it.

### Second attempt: MutationObserver + microtask (final approach)

The clean architecture:

1. **MutationObserver** on the portal root with `childList`, `subtree`, and `attributeFilter: ['style']` detects all changes — additions, removals, reorders, and Suspense hiding — through one native mechanism.
2. **Microtask-deferred `updateCollection`** — when the observer fires, queue a microtask. By that point, walk the real DOM tree, read its state directly, and build the collection.
3. **`WeakMap<HTMLElement, Props>`** for associating React props with DOM nodes. Ref callbacks do one thing: `map.set(el, props)` on mount, `map.delete(el)` on unmount.
4. **No Proxy, no dirty tracking, no synchronous collection builds in callbacks.**

### Specific React behaviors that required attention

- **Suspense**: React sets `style.display = 'none'` via CSSOM during the mutation phase. CSSOM changes update the `style` attribute, so MutationObserver sees them. The microtask runs after all mutations settle, reads the correct display state.
- **React.Activity**: `useSyncExternalStore`'s `updateStoreInstance` passive effect doesn't fire on hidden-to-visible transitions. `subscribe()` uses `queueMicrotask` to retry pending updates when a new subscriber registers, catching the case where React's own effect didn't fire.
- **Async timing**: The fake DOM was synchronous; MutationObserver is async. Some tests needed `await act(() => Promise.resolve())` to flush the microtask queue. This is an acceptable test change reflecting the deliberate architectural choice.

## Files changed

- `packages/react-aria/src/collections/Document.ts` — replaced fake DOM with real DOM wrapper, MutationObserver, microtask-deferred collection build
- `packages/react-aria/src/collections/CollectionBuilder.tsx` — portal into real detached div, simplified ref callbacks
