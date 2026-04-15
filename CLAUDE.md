I want to modify react-spectrum's collection system to replace its fake DOM
implementation with real detached DOM elements.

## Repo
/Users/slava.knyazev/misc/react-spectrum

First, reset any modifications by running:
git checkout -- packages/react-aria/src/collections/Document.ts packages/react-aria/src/collections/CollectionBuilder.tsx

## What the current implementation does
The collection system has a two-phase render: React components render into a
hidden tree to build a Collection data structure, then the real UI renders from
that Collection. The hidden tree currently uses a fake DOM (custom Document,
ElementNode, TextNode classes in packages/react-aria/src/collections/Document.ts)
that mimics a subset of the real DOM API. CollectionBuilder.tsx creates a portal
into this fake DOM.

Key files:
- packages/react-aria/src/collections/Document.ts — fake DOM implementation
- packages/react-aria/src/collections/CollectionBuilder.tsx — React components that use it
- packages/react-aria/src/collections/BaseCollection.ts — Collection/CollectionNode data structures built from the DOM

## What I want instead
Replace the fake DOM with a real detached DOM element as the portal target.
Use the browser's native DOM capabilities instead of reimplementing them.

## Architecture (important — follow this, don't deviate)

1. **Portal target**: CollectionBuilder creates a real detached `<div>` as the
   portal root. React's `createPortal` renders collection items into it as real
   `<div>` elements (not custom element tags — avoids React warnings).

2. **Props association**: Collection components (created via createLeafComponent/
   createBranchComponent) use a simple ref callback that stores props, ref,
   CollectionNodeClass, rendered content, and render function in a
   WeakMap<HTMLElement, PropsData> on the Document. The ref callback should be
   trivial — just a map set on mount, map delete on unmount. No dirty tracking,
   no queue logic in the ref callback.

   The WeakMap entry shape:
   - `props` — component props (contains id, value, textValue, etc.)
   - `ref` — forwarded ref
   - `nodeType` — the CollectionNodeClass (has static `type`: 'item', 'section', etc.)
   - `rendered` — children content for leaf nodes
   - `render` — function that takes a Node and returns a ReactElement for the real UI

3. **Change detection via MutationObserver**: A single MutationObserver on the
   portal root detects ALL changes:
   - `childList: true, subtree: true` for additions and removals
   - `attributes: true, attributeFilter: ['style'], subtree: true` for
     style.display changes (React sets `style.display = 'none'` via CSSOM
     during Suspense to hide stale content — this updates the style attribute,
     which MutationObserver can observe)

4. **Deferred collection build via microtask**: When MutationObserver fires,
   queue a microtask (if not already queued) to run updateCollection.
   Do NOT build the collection synchronously during observer callbacks or ref
   callbacks. By microtask time, all DOM mutations from React's commit phase
   have settled, so you can read the DOM state directly (walk the tree,
   check element.style.display, look up props from the WeakMap).

5. **Reading DOM state imperatively**: Instead of tracking isHidden reactively,
   just check `domNode.style.display === 'none'` when building collection nodes
   during updateCollection. The DOM is the source of truth.

6. **useSyncExternalStore integration**: The Document exposes subscribe() and
   getCollection(). updateCollection builds an immutable BaseCollection snapshot
   and notifies subscribers. Same pattern as current code.

7. **SSR path**: During SSR, portals don't work. The existing SSR path
   (SSRContext, creating elements during render) should be preserved. SSR
   creates elements synchronously during render since it only runs once.

## Key React behaviors to handle
- **Suspense**: React hides stale content with `style.display = 'none'` during
  mutation phase. MutationObserver + microtask handles this naturally.
- **React.Activity**: When transitioning hidden->visible, React replays layout
  effects but does NOT replay all passive effects (specifically,
  useSyncExternalStore's updateStoreInstance passive effect doesn't fire).
  The subscribe() method should use queueMicrotask to retry if there are
  pending updates, so Activity transitions pick up changes.
- **Reordering**: React may reorder DOM nodes. MutationObserver with childList
  detects this.

## What NOT to do
- Do NOT use a Proxy on style properties
- Do NOT do complex dirty tracking or queue logic in ref callbacks
- Do NOT run updateCollection synchronously from ref callbacks or observers
- Do NOT use custom HTML element tags (use <div> with data attributes)

## Testing
Run tests incrementally:
1. packages/react-aria/test/collections/CollectionBuilder.test.js
2. packages/react-aria-components/test/Table.test.js (has Suspense tests)
3. packages/react-aria-components/test/ListBox.test.tsx
4. Then broaden: GridList, Menu, Select, ComboBox, TagGroup, Tree, Tabs, Breadcrumbs, Disclosure

Use: node --experimental-vm-modules node_modules/.bin/jest <path> --no-coverage

Some tests may fail due to timing differences since MutationObserver is
async (unlike the old fake DOM's synchronous updates). These can be fixed
by adding `await act(() => Promise.resolve())` to flush the microtask
queue after actions that trigger collection updates. This is an acceptable
test change — deferring updates via microtask is a deliberate architectural
choice, not a bug.
