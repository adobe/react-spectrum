---
description: Use when answering questions about or modifying the Collections system used by react-aria-components (RAC) and Spectrum 2 (S2) — the two-pass render, the fake DOM / Document, CollectionBuilder, BaseCollection, CollectionNode, useListState/useTreeState, createLeafComponent/createBranchComponent, Section/Item nodes, SSR of collections, or the difference between the new and old (RSP v3) collection builders.
---

# Collections (new RAC/S2 system)

Guidance for the collection architecture behind RAC components (`ListBox`, `Menu`, `Table`, `Tree`,
`GridList`, `TagGroup`, `Tabs`, `Breadcrumbs`) and S2 (which re-exports/wraps RAC).

Source of truth lives in **`packages/react-aria/src/collections/`** (re-exported publicly as
`@react-aria/collections` / the `react-aria/private/collections/*` aliases). Do not confuse it with
the *old* builder in `packages/react-stately/src/collections/`.

## The core idea: two-pass render

Collection children use natural JSX (`<ListBox><ListBoxItem/><ListBoxSection/></ListBox>`), but that
JSX is **not** what ends up in the browser DOM. Rendering happens in two passes:

1. **Pass 1 — build the Collection.** The collection JSX is rendered by React into a *fake DOM* (a
   lightweight in-memory document model, not `document`). This produces an immutable `BaseCollection`
   — a `Map<Key, CollectionNode>` with sibling/parent/child links. Because React does this rendering,
   we keep JSX syntax *and* composition/context, and we learn each item's index, level, parent,
   sibling keys, and the total item count before rendering anything real.
2. **Pass 2 — render the real DOM.** The `BaseCollection` is fed into state (`useListState` /
   `useTreeState`), and a renderer walks the collection and calls each node's stored `render` function
   to emit the actual DOM (supporting virtualization / rendering a subset).

Rationale is documented inline at `packages/react-aria/src/collections/Document.ts:18-30`.

```
<ListBox items={...}>{item => <ListBoxItem/>}</ListBox>
        │
        ▼  CollectionBuilder renders content into <Hidden> portal
   ┌─────────────────────────── PASS 1 (fake DOM) ───────────────────────────┐
   │ Collection → CollectionRoot → createPortal(children, Document)           │
   │ each Item/Section is a createLeafComponent/createBranchComponent →       │
   │ renders <ElementNode> host elements → React reconciler mutates fake DOM  │
   │ Document.getCollection() finalizes an immutable BaseCollection           │
   └──────────────────────────────────────────────────────────────────────────┘
        │  collection (BaseCollection)
        ▼
   ┌─────────────────────────── PASS 2 (real DOM) ───────────────────────────┐
   │ useListState(collection) → SelectionManager, keyboard delegates          │
   │ CollectionRoot walks collection, calls node.render(node) → real <div>s   │
   └──────────────────────────────────────────────────────────────────────────┘
```

## The fake DOM / document model

React can render into any host environment given a host-config; here the host is a hand-written mock
DOM in `packages/react-aria/src/collections/Document.ts`. **No custom reconciler** is written — instead
`react-dom`'s `createPortal` targets a fake `Document` object that duck-types the DOM API React calls
(`createElement`, `appendChild`, `insertBefore`, `removeChild`, `style`, `setAttribute`, …).

Key classes (all in `Document.ts`):

| Class | Role |
|---|---|
| `BaseNode<T>` (`Document.ts:36`) | Base mutable fake-DOM node: `firstChild`/`lastChild`/`nextSibling`/`parentNode` getters+setters that call `ownerDocument.markDirty`. Implements `appendChild`/`insertBefore`/`removeChild` (`Document.ts:126-220`). |
| `ElementNode<T>` (`Document.ts:262`) | A mutable fake element. `nodeType = 8` (COMMENT_NODE — deliberately not ELEMENT_NODE so React DevTools doesn't try to measure it, `Document.ts:263`). Owns one immutable `CollectionNode`. Has `setProps` (`:337`), `updateNode` (`:309`), a fake `style` getter for Suspense `display:none` handling (`:379`), and no-op `setAttribute`/`hasAttribute`. |
| `Document<T,C>` (`Document.ts:428`) | The portal target. `nodeType = 11` (DOCUMENT_FRAGMENT_NODE). Owns the current immutable `collection`, a `nextCollection` (copy-on-write), a `dirtyNodes` set, and the `useSyncExternalStore` subscription plumbing. |

How nodes get created & the collection is built:

- React calls `document.createElement(type)` → `new ElementNode(type, this)` (`Document.ts:452`).
- React sets children via `appendChild`/`insertBefore`; each setter calls `markDirty` and, when
  connected, `queueUpdate()` (`Document.ts:148-151`, `:180-182`).
- The `ref` callback on the host element calls `element.setProps(...)`, which lazily constructs (or
  copy-on-write clones) the immutable `CollectionNode`, copying `props`, `rendered`, `render`, `value`,
  `textValue`, `id` (`Document.ts:337-377`). **`id` is immutable** — changing it throws (`:366-368`).
- `Document.updateCollection()` (`:509`) is the finalize step: removes disconnected/hidden nodes,
  recomputes indices, calls `ElementNode.updateNode()` to recompute `index`/`level`/`parentKey`/
  `prevKey`/`nextKey`/`firstChildKey`/`lastChildKey`/`colIndex` (`:309-335`), adds surviving nodes to
  `nextCollection`, then `collection.commit(...)` **freezes** it (`:538-548`).
- `getCollection()` (`:495`) runs the finalize and returns the frozen collection to React via
  `useSyncExternalStore`. `queueUpdate()` clones the collection so React notices a new snapshot and
  schedules the second render (`:551-576`).

**Mutable fake node vs immutable collection node.** Each `ElementNode` (mutable, stable identity that
React holds onto) owns one `CollectionNode` (immutable, copy-on-write). `getMutableNode()` clones the
`CollectionNode` on first write per update cycle (`Document.ts:295-307`); unchanged nodes are shared,
so updates are cheap.

`<Hidden>` (`packages/react-aria/src/collections/Hidden.tsx:66`): during SSR there are no portals, so
the hidden collection tree is rendered into a `<template>` element (never displayed, not in the a11y
tree). `HTMLTemplateElement.prototype.firstChild`/`appendChild`/etc. are monkey-patched (`Hidden.tsx:30-62`)
to proxy into `.content` so React hydration doesn't choke (React issue #19932).

## The collection node shape

Immutable class `CollectionNode<T> implements Node<T>` at
`packages/react-aria/src/collections/BaseCollection.ts:23`. The public `Node<T>` interface is
`packages/@react-types/shared/src/collections.d.ts:198`.

| Field | Meaning |
|---|---|
| `type` | Node type string — `'item'`, `'section'`, `'header'`, `'loader'`, `'separator'`, `'column'`, `'cell'`, `'content'`, … Set from the `static type` of the node subclass. |
| `key` | Unique `Key`. From `id` prop, else data `key`/`id`, else auto `react-aria-${++nodeId}` (`Document.ts:347`). |
| `value` | Original data object the node was created from (dynamic collections). |
| `level` | Depth in hierarchy; computed from parent chain (`Document.ts:283-289`). |
| `index` | Position within parent. |
| `hasChildNodes` | Whether it has children. |
| `rendered` | The rendered JSX contents (e.g. the label). |
| `textValue` | Plain-text value for typeahead; derived from `textValue`/string children/`aria-label`. |
| `parentKey` / `prevKey` / `nextKey` | Links used for navigation and iteration. |
| `firstChildKey` / `lastChildKey` | Child range for branch nodes. |
| `props` | Raw props (includes `ref`). |
| `render` | `(node) => ReactElement` — called in pass 2 to produce the real DOM. |
| `colSpan` / `colIndex` | Table column spanning. |
| `childNodes` | Throws on base; use `collection.getChildren(key)` instead (`BaseCollection.ts:49-51`, and `Node.childNodes` is `@deprecated`). |

`CollectionNode` subclasses (`BaseCollection.ts`): `FilterableNode` (`:86`), `HeaderNode` (`:105`,
type `header`), `LoaderNode` (`:109`, type `loader`), `ItemNode` (`:113`, type `item`), `SectionNode`
(`:131`, type `section`). Each may override `filter()` to control filtering behavior.

## BaseCollection

`class BaseCollection<T> implements ICollection<Node<T>>` at `BaseCollection.ts:158`. Internally a
`keyMap: Map<Key, CollectionNode>` plus `firstKey`/`lastKey`/`itemCount`/`frozen`. Implements the
shared `Collection` interface (`collections.d.ts:163`): `getItem`, `getKeys`, `getChildren`,
`getKeyBefore`/`getKeyAfter`, `getFirstKey`/`getLastKey`, `[Symbol.iterator]` (flattened traversal),
`size`, and `filter`. `size` counts only `type === 'item'` nodes (`:279-281`). `commit()` sets
first/last keys and freezes (`:308-316`); a frozen collection throws on `addNode`/`removeNode`/`commit`.
`clone()` shallow-copies the keyMap for copy-on-write updates (`:261-272`). `filter()` builds a brand
new collection by walking children and calling each node's `filter()` (`:318-323`, helper
`filterChildren` `:326`).

## End-to-end trace: RAC `<ListBox>`

File: `packages/react-aria-components/src/ListBox.tsx`.

1. `<ListBox items>{item => <ListBoxItem/>}</ListBox>`. If no `ListState` is in context (standalone
   case), it renders `<CollectionBuilder content={<Collection {...props} />}>` (`ListBox.tsx:218-222`).
2. `CollectionBuilder` (`CollectionBuilder.tsx:49`) creates a `Document` via `useCollectionDocument`
   (`:117`, `useSyncExternalStore` over `document.subscribe`/`getCollection`). It renders
   `<Hidden><CollectionDocumentContext.Provider value={document}>{content}</...></Hidden>` **plus**
   `<CollectionInner render={children} collection={collection}/>` (`:69-78`). The hidden tree is pass 1;
   `CollectionInner` is pass 2.
3. `<Collection>` (`CollectionBuilder.tsx:274`) maps items via `useCachedChildren`
   (`useCachedChildren.ts:33`), which caches rendered elements per data object (WeakMap) and derives
   React keys/ids (`:50-80`). Since a document is in context, it wraps them in `<CollectionRoot>`.
4. `CollectionRoot` (`CollectionBuilder.tsx:304`) does `createPortal(children, doc)` (client) or an
   `<SSRContext>` (SSR), pushing `ShallowRenderContext = true` so leaf/branch components render as
   collection nodes instead of real DOM (`:304-321`).
5. Each `<ListBoxItem>` is built by `createLeafComponent(ItemNode, …)` (`ListBox.tsx:538`); each
   `<ListBoxSection>` by `createBranchComponent(SectionNode, …)` (`:494`). In shallow mode these call
   `useSSRCollectionNode` (`CollectionBuilder.tsx:159`), which renders a host
   `<ElementNode>` carrying `setProps`, `rendered`, and a `render` callback (`:227-239`, `:255-257`).
   React commits these into the fake DOM → `Document` builds the `BaseCollection`.
6. Pass 2: `StandaloneListBox` (`ListBox.tsx:225`) calls `useListState({...props, collection})`.
   `useListState` (`packages/react-stately/src/list/useListState.ts:50`) → `useCollection`
   (`packages/react-stately/src/collections/useCollection.ts:30`): because a prebuilt `collection` is
   passed, it is **returned as-is** (`useCollection.ts:38-39`) — the old `builder.build`/`ListCollection`
   path is skipped. Then a `SelectionManager` is created over it.
7. `ListBoxInner` (`ListBox.tsx:239`) renders the real `<div>` and a `<CollectionRoot collection={collection}>`
   (`:427-432`). The **default** `CollectionRoot`/`CollectionBranch` (`Collection.tsx:201-208`) call
   `useCollectionRender` → `useCachedChildren` and invoke `node.render!(node)` for each node
   (`Collection.tsx:225`) — producing the real DOM. (Virtualized collections override
   `CollectionRendererContext` with a renderer that only renders visible nodes.)

The ComboBox/Select case: those render two copies. The first passes a `Document` via context (so
`CollectionBuilder` short-circuits at `CollectionBuilder.tsx:53-61`), the second passes a `ListState`
via `ListStateContext` so the ListBox reuses state without rebuilding (`ListBox.tsx:207-216`).

## Sections, SSR, id/key resolution

- **Sections** are branch nodes (`createBranchComponent(SectionNode, …)`). `<Header>` inside becomes a
  `HeaderNode`. Section children are built recursively via nested `<Collection>`/`useCachedChildren`.
- **id/key resolution** (`useCachedChildren.ts:57-69`): explicit `id` prop wins, else `item.key`/
  `item.id`, else array index as React key (the collection then auto-generates an id). `idScope`
  prefixes ids (`idScope + ':' + id`) to keep nested collections unique. `addIdAndValue` also injects
  `value={item}` so the node captures its data object.
- **SSR**: portals don't exist server-side, so `Collection` renders through `<SSRContext>` and
  `useSSRCollectionNode` appends nodes to the document *during render* (`CollectionBuilder.tsx:184-197`),
  and `<Hidden>` renders a `<template>`. `Document.isSSR` keeps the collection unfrozen
  (`BaseCollection.ts:315`, `Document.ts:544-547`); after hydration `resetAfterSSR()` (`Document.ts:589`)
  clears the document so the client portal can take over.
- **Async loading**: rendered as `LoaderNode` (`type 'loader'`), e.g. `ListBoxLoadMoreItem`
  (`ListBox.tsx:742`), plus a `useLoadMoreSentinel` intersection observer.

## Old vs new — how to tell them apart

| | New (RAC/S2) | Old (RSP v3) |
|---|---|---|
| Builder | `CollectionBuilder` component (`packages/react-aria/src/collections/CollectionBuilder.tsx`) — renders JSX into a fake DOM | `CollectionBuilder` **class** (`packages/react-stately/src/collections/CollectionBuilder.ts:25`) — `build()` reflects over element `props`/`type` via `getFullNode` |
| Collection | `BaseCollection` (`react-aria`) | `ListCollection`/`TreeCollection` (`react-stately`) built from `builder.build` |
| Item/Section | `createLeafComponent`/`createBranchComponent`; `<ListBoxItem>`, `<ListBoxSection>` | `Item`/`Section` from `@react-stately/collections` (`react-stately/src/collections/Item.ts`, `Section.ts`) with a static `getCollectionNode` generator |
| Entry point | component passes prebuilt `collection` prop → `useCollection` returns it unchanged (`useCollection.ts:38`) | `useCollection` runs `builder.build({children, items})` then `factory` (`useCollection.ts:41-42`) |

Both paths funnel through the same `useListState`/`useTreeState` + shared `Collection`/`Node` types, so
state, selection, and keyboard code is reused. **New is preferred** for all RAC and S2 work; the old
reflective builder only remains for legacy RSP v3 components. Quick tell: if a component is defined with
`createLeafComponent`/`createBranchComponent` and wrapped in a `<CollectionBuilder content=…>`, it's new.

## Common tasks & gotchas

- **What triggers a rebuild (pass 1)**: any fake-DOM mutation (`appendChild`, `setProps`, `style.display`
  change) marks nodes dirty and calls `queueUpdate()`, which clones the collection so
  `useSyncExternalStore` sees a new snapshot and re-renders. `useCachedChildren` caches by item object
  identity; pass a `dependencies` array to bust the cache when a render closure captures external state
  (`useCachedChildren.ts:48`, `Collection` merges parent+child deps at `CollectionBuilder.tsx:276`).
- **Copy-on-write / freezing**: committed collections are frozen — never mutate a collection you got
  from state; call `.clone()` or go through the document. `addNode`/`removeNode`/`commit` throw on a
  frozen collection (`BaseCollection.ts:275`, `:297`, `:309`).
- **Suspense / hidden items**: React sets `display:none`; the fake `style` setter (`Document.ts:379-416`)
  flips `isHidden`, which removes the node from the collection but keeps it in the document. Use
  `useIsHidden`/`createHideableComponent` (`Hidden.tsx:84`) for components that must render nothing while
  in a hidden collection subtree.
- **Don't render collection item components outside a collection**: leaf components whose render fn
  takes a `node` arg throw "cannot be rendered outside a collection" when not shallow
  (`CollectionBuilder.tsx:220-224`).
- **`id` is immutable** once set on a node (`Document.ts:366-368`) — changing an item's `id` between
  renders throws.
- **`node.childNodes` is deprecated** — iterate with `collection.getChildren(key)`
  (`BaseCollection.ts:49`, `collections.d.ts:210-214`).
