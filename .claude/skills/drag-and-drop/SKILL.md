---
description: Use when investigating, explaining, or modifying drag and drop (DnD) in react-spectrum — including keyboard/screen-reader accessible dragging, drop indicators, drop targets/operations, or adding DnD to a collection. Covers useDrag, useDrop, useDraggableCollection, useDroppableCollection, useDragAndDrop, DragManager, DropTarget, DataTransfer, and AT live-region announcements.
---

# Drag and Drop (DnD)

The single hardest part of this system is that **keyboard and screen-reader (AT) dragging is implemented from scratch** — the browser's native HTML5 DnD only serves pointer users. There are effectively **two parallel code paths** that resolve to the *same* drop-target model. Understand both before changing anything.

Design rationale lives in `rfcs/2020-v3-dnd.md`. The code has since diverged from the RFC — trust the code. Notable divergences: `renderPreview` is now `preview`/`renderDragPreview`; `getDropOperationForPoint` (RFC on `useDrop`) is real, but collections resolve targets via a `DropTargetDelegate.getDropTargetFromPoint(x, y, isValid)` (3-arg) instead; keyboard "activation" (spring-loading) uses **Alt+Enter**, an RFC open question now answered in code.

## Source layout

Implementations live under `packages/react-aria/src/dnd/` and `packages/react-stately/src/dnd/`, re-exported by the thin `@react-aria/dnd` / `@react-stately/dnd` index files (`packages/@react-aria/dnd/src/index.ts`). Types live in `@react-types/shared`.

## Layers

| Layer | Files | Responsibility |
|---|---|---|
| Low-level primitives | `useDrag.ts`, `useDrop.ts`, `useClipboard.ts` | Make one element draggable / a single drop zone. Native HTML5 DnD + AT entry points. |
| AT coordinator | `DragManager.ts` | Global keyboard/screen-reader "drag session" — the from-scratch a11y engine. Module-level singletons. |
| Collection hooks | `useDraggableCollection.ts`, `useDroppableCollection.ts`, `useDraggableItem.ts`, `useDroppableItem.ts`, `useDropIndicator.ts` | Drag/drop across a collection of items with insertion positions. |
| Collection state | `react-stately/.../useDraggableCollectionState.ts`, `useDroppableCollectionState.ts` | Track dragging keys, current drop target, compute drop operation. |
| RAC sugar | `react-aria-components/src/useDragAndDrop.tsx`, `DragAndDrop.tsx` | `useDragAndDrop({...})` → `dragAndDropHooks` object consumed by ListBox/GridList/Table/Tree. |
| S2 | `@react-spectrum/s2/src/useDragAndDrop.ts` | Thin wrapper re-exporting RAC's `useDragAndDrop` (omits `renderDropIndicator`). |

## The native pointer path

`useDrag.ts:108` returns `{dragProps, dragButtonProps, isDragging}`. `dragProps` sets `draggable: 'true'` + `onDragStart/onDrag/onDragEnd`.

- **onDragStart** (`useDrag.ts:127`): calls `getItems()`, serializes to the native `DataTransfer` via `writeToDataTransfer` (`utils.ts:97`). Items with multiple representations, or multiple items of one type, are JSON-serialized under the custom type `application/vnd.react-aria.items+json` (`constants.ts:90`); single native types (`text/plain`, `text/uri-list`, `text/html`, `constants.ts:89`) are also written directly for cross-app interop.
- **Drop operations** are a bitmask enum `DROP_OPERATION {none/cancel=0, move=1, copy=2, link=4, all=7}` (`constants.ts:24`). `getAllowedDropOperations()` → `effectAllowed`. Native `dropEffect` maps back via `DROP_EFFECT_TO_DROP_OPERATION` (`constants.ts:67`) in `onDragEnd`.
- **Custom preview**: `useDrag.ts:171` calls the `preview` ref (a `DragPreview` component, `DragPreview.tsx`) synchronously inside onDragStart, `flushSync`-renders it offscreen, and hands the node to `dataTransfer.setDragImage`.
- **Enforcement**: `useDrag.ts:214` installs a one-time window `drop` listener that `preventDefault`s and warns — drags started by `useDrag` may only be dropped on a `useDrop` target, guaranteeing an accessible alternative exists.

`useDrop.ts:104` is the pointer drop zone: `onDragEnter/Over` call `getDropOperationForPoint`, a hover longer than `DROP_ACTIVATE_TIMEOUT = 800ms` (`useDrop.ts:98`) fires `onDropActivate` (spring-loading), and `onDrop` parses the DataTransfer back into `DropItem[]` via `readFromDataTransfer` (`utils.ts:216`). Drop items have `kind: 'text' | 'file' | 'directory'` (`utils.ts:232/318/328`); directories use `webkitGetAsEntry` (`utils.ts:257`) and the `DIRECTORY_DRAG_TYPE` symbol. Type guards: `isTextDropItem/isFileDropItem/isDirectoryDropItem`.

## The accessibility path (keyboard + screen reader) — THE KEY PART

No pointer is involved. `DragManager.ts` is a **module-level singleton** holding `dropTargets`, `dropItems`, and one live `dragSession` (`DragManager.ts:34-37`). Anything droppable registers itself globally via `registerDropTarget` (`DragManager.ts:52`, collection-level) and `registerDropItem` (`:68`, per item), regardless of where it is in the tree.

### Starting a session
`useDrag.ts` enters AT mode on **Enter keyup** (`useDrag.ts:396`, keyboard) or a **virtual click** (`:403`, screen readers — NVDA/JAWS browse mode, VoiceOver/TalkBack detected in `onPointerDown` at `:366`). Both call `startDragging` → `DragManager.beginDragging(target, stringFormatter)` (`useDrag.ts:330`, `DragManager.ts:82`). If there is a conflicting item action (selection), `useDraggableItem.ts:138` requires **Alt+Enter** and swaps the intl message to the `...Alt` variant.

`beginDragging` constructs a `DragSession` and, on the next frame, calls `setup()` then (for keyboard modality) `next()` to focus the first target (`DragManager.ts:88`).

### Session mechanics (`DragSession`, `DragManager.ts:168`)
`setup()` (`:194`):
- Installs **capture-phase listeners** for `keydown/keyup/focus/blur/click/pointerdown` and a long list of `CANCELED_EVENTS` (`:138`) that are `preventDefault`+`stopImmediatePropagation`'d (`cancelEvent`, `:373`). This is how *all* normal interaction is suppressed during a drag — only drop targets are reachable.
- Calls `updateValidDropTargets()`.
- **Announces** drag start into a live region via `announce()` (from `LiveAnnouncer`) using `MESSAGES[modality]` → intl keys `dragStartedKeyboard` / `dragStartedTouch` / `dragStartedVirtual` (`:162`, `:209`).

`updateValidDropTargets()` (`:392`) is the heart of AT focus management:
1. `findValidDropTargets` (`:707`) filters registered targets: skips anything inside `[aria-hidden="true"]`/`[inert]`, and calls each target's `getDropOperation(types, allowed)`, dropping those that return `'cancel'`.
2. Reorders targets so the one nearest the drag origin comes first (`findNearestDropTarget`, `:527`; prefers an ancestor if the drag target is inside one).
3. **`ariaHideOutside(...)`** (`:433`) hides *everything except* the drag source, valid drop items, and valid drop targets from AT (`shouldUseInert: true`). This is why an AT user only encounters valid drop locations.
4. A `MutationObserver` on `aria-hidden`/`inert` re-runs this when the DOM changes (`:450`) — so newly registered targets stay consistent.

### Navigation and commit
- **Tab / Shift+Tab** → `next()` / `previous()` (`:236`, `:457`, `:492`) cycle through `validDropTargets`; at either end they cycle back to the original drag source so users without an Escape key (e.g. iPad) can cancel.
- **Escape** → `cancel()` (`:231`, `:634`): ends the session, restores focus to the drag source, announces `dropCanceled`.
- **Enter (keyup)** → `onKeyUp` (`:249`): if `altKey` or focus is on an "activate button", calls `activate()` (spring-load, `:691`); otherwise `drop()` (`:647`).
- **Arrow keys inside a collection**: `onKeyDown` (`:228`) forwards the event to `currentDropTarget.onKeyDown` — the collection's registered handler (`useDroppableCollection.ts:590`) moves between insertion/on positions (see below).
- Focus moving onto/off a target is intercepted in `onFocus`/`onBlur` (`:269`, `:310`) and translated into `setCurrentDropTarget` (`:552`), which fires `onDropEnter`/`onDropExit` and focuses the element.
- `drop()` (`:647`) computes the operation from the item/target `getDropOperation` (falling back to the first allowed op), fires `onDrop` with synthesized `DropItem[]`, then `end()` and announces `dropComplete`.

### Key/gesture bindings (during a session)

| Input | Handler | Effect |
|---|---|---|
| `Enter` (start) | `useDrag.ts:396` onKeyUpCapture | Begin AT drag from the handle |
| `Alt+Enter` (start) | `useDraggableItem.ts:148` | Begin drag when item has a conflicting action |
| `Tab` / `Shift+Tab` | `DragManager.ts:236` → `next()`/`previous()` | Move between valid drop *targets* (collection = 1 stop) |
| `ArrowUp/Down/Left/Right` | forwarded to `useDroppableCollection.ts:590` | Move between drop *positions* within a collection (`before`/`on`/`after`) |
| `Home` / `End` / `PageUp` / `PageDown` | `useDroppableCollection.ts:642-788` | Jump within collection |
| `Enter` (commit) | `DragManager.ts:249` `onKeyUp` → `drop()` | Drop on current target |
| `Alt+Enter` (over target) | `DragManager.ts:253` → `activate()` | Spring-load / navigate into target |
| `Escape` | `DragManager.ts:231` → `cancel()` | Cancel, restore focus to source |
| Screen-reader double-tap / click | `DragManager.ts:335` `onClick` (virtual) | Drop, activate, or cancel (on source) |

### Modality detection

`getDragModality()` (`utils.ts:93`) maps the interaction modality to `keyboard | touch | virtual`, driving which intl strings and gestures apply. `useDrag.ts:366` `onPointerDown` sniffs virtual (AT) pointer events: iOS VoiceOver (`width<1 && height<1 && isIOS && isWebKit`) and Android TalkBack (pointer at the exact element center) are forced to `'virtual'`, so `onDragStart` (`:136`) enters the DragManager path instead of native HTML5 DnD. Getting this wrong is a common source of "drag doesn't start under a screen reader" bugs.

### Announcements (intl)
All AT strings are keys in `packages/react-aria/intl/dnd/en-US.json`, formatted with `useLocalizedStringFormatter(intlMessages, '@react-aria/dnd')`.

| Key | Where | Purpose |
|---|---|---|
| `dragDescriptionKeyboard` / `...Touch` / `...Virtual` | `useDrag.ts:89`, `useDraggableItem.ts:53` | `aria-describedby` on the drag handle: how to start |
| `dragDescriptionKeyboardAlt` / `dragSelectedKeyboardAlt` | `useDraggableItem.ts:110` (`msg += 'Alt'`) | when item has a conflicting action → Alt+Enter |
| `dragSelectedItems`, `dragItem` | `useDraggableItem.ts:126-129` | drag button label incl. selected count |
| `dragStartedKeyboard/Touch/Virtual` | `DragManager.ts:162` | live announcement on session start |
| `endDragKeyboard/Touch/Virtual` | `useDrag.ts:89` | description while dragging (press Enter to cancel) |
| `dropOnRoot`, `dropOnItem`, `insertBefore`, `insertAfter`, `insertBetween` | `useDropIndicator.ts:67-107` | `aria-label` on each drop target/indicator |
| `dropIndicator` | `useDropIndicator.ts:115` | `aria-roledescription` on indicators |
| `dropComplete`, `dropCanceled` | `DragManager.ts:644/688` | live announcement on end |

If announcements go wrong, suspect: (a) missing `aria-label`/textValue on items feeding `getText` in `useDropIndicator.ts`; (b) the assertive drag-start announcement swallowing the first target announcement — handled deliberately at `DragManager.ts:596` (first target announced `'polite'`); (c) `ariaHideOutside` hiding something it shouldn't, or not hiding enough.

## Drop targets & indicators

`DropTarget = RootDropTarget | ItemDropTarget` (`@react-types/shared`):

| Type | Shape | Meaning |
|---|---|---|
| root | `{type: 'root'}` | Drop on the whole collection |
| item / on | `{type: 'item', key, dropPosition: 'on'}` | Drop onto an item (e.g. a folder) |
| item / before | `{type: 'item', key, dropPosition: 'before'}` | Insert before item |
| item / after | `{type: 'item', key, dropPosition: 'after'}` | Insert after item |

Both paths converge on this model:
- **Pointer** → `DropTargetDelegate.getDropTargetFromPoint(x, y, isValidDropTarget)` (`ListDropTargetDelegate.ts:88`). Binary-searches item rects; picks `on` if valid, else `before`/`after` based on which half of the item the point is in (with a 5px edge bias, `:167`). RTL and stack/grid handled via primary/secondary/flow axes.
- **Keyboard** → `DropTargetKeyboardNavigation.ts` `navigate(...)` walks the collection using the `KeyboardDelegate`, producing the next `before`/`on`/`after` target (handles nesting/levels for Tree). `useDroppableCollection.ts:443` `nextValidTarget` skips targets whose `getDropOperation` returns `'cancel'`.

Two `before`/`after` targets pointing at the same gap are treated as equal in `useDroppableCollectionState.ts:207` (`isDropTarget` + `getOppositeTarget`), so the indicator doesn't flicker.

**Indicators**: `useDropIndicator.ts` builds the `aria-label`, `aria-roledescription`, and hides the element when not in a session / not the active target (`isHidden`, `:125`). In RAC, `DragAndDrop.tsx` `useRenderDropIndicator` (`:77`) renders a `<DropIndicator>` (or the app's `renderDropIndicator`) between items.

## State

- `useDraggableCollectionState.ts`: `draggingKeys` / `draggedKey`, `getKeysForDrag` (drags all selected items if the pressed item is selected, else just it — filtering out descendants of other dragged keys, `:90`), `startDrag/moveDrag/endDrag`.
- `useDroppableCollectionState.ts`: current `target`, `setTarget` (fires `onDropEnter`/`onDropExit`), `isDropTarget`, and **`getDropOperation`** (`:233`) — the policy engine. It prevents dropping an item on itself/its descendants (`:237`), then `defaultGetDropOperation` (`:102`) maps the target + which handlers exist (`onInsert`/`onReorder`/`onMove`/`onRootDrop`/`onItemDrop`) + `isInternal` + `acceptedDragTypes`/`shouldAcceptItemDrop` to an operation or `'cancel'`.

`isInternal` (drag source === drop collection) is tracked in module-level global DnD state in `utils.ts` (`globalDndState`, `setDraggingKeys`, `isInternalDropOperation`, `setDropCollectionRef`).

## How RAC consumes it — ListBox trace

1. App calls `useDragAndDrop({getItems, onReorder, onInsert, renderDropIndicator, ...})` (`react-aria-components/src/useDragAndDrop.tsx:147`). It computes `isDraggable = !!getItems` and `isDroppable = !!(onDrop||onInsert||onItemDrop||onReorder||onMove||onRootDrop)` and returns a `dragAndDropHooks` bag wiring the low-level hooks with the options pre-bound (`:166-207`).
2. `ListBox.tsx:246` reads `isListDraggable/isListDroppable` off that bag. When draggable it calls `dragAndDropHooks.useDraggableCollectionState({collection, selectionManager, preview})` then `useDraggableCollection({}, dragState, listBoxRef)` (`ListBox.tsx:322`).
3. When droppable it calls `useDroppableCollectionState({collection, selectionManager})`, constructs a `ListDropTargetDelegate(collection, listBoxRef, {orientation, layout, direction})` (unless one is provided), then `useDroppableCollection({keyboardDelegate, dropTargetDelegate}, dropState, listBoxRef)` (`ListBox.tsx:338-361`). `useDroppableCollection.ts:479` registers the collection as a `DragManager` drop target and installs the arrow-key `onKeyDown` handler.
4. Per option, `Option` calls `dragAndDropHooks.useDraggableItem` / `useDroppableItem` (`ListBox.tsx:563-576`). `useDroppableItem.ts:51` registers each item with `DragManager` and focuses it when it becomes the active target (`:84`).
5. Indicators render via `DragAndDropContext` + `useRenderDropIndicator` → `ListBoxDropIndicatorWrapper` (`ListBox.tsx:662`), which calls `dragAndDropHooks.useDropIndicator` and omits the DOM node when `isHidden`.
6. `defaultOnDrop` (`useDroppableCollection.ts:96`) routes the drop to the right high-level callback (`onRootDrop`/`onItemDrop`/`onMove`/`onInsert`/`onReorder`) based on `target` + `isInternal`, filtering items by `acceptedDragTypes`/`shouldAcceptItemDrop`.

## Gotchas & common tasks

- **Adding DnD to a new collection component**: it must supply a `KeyboardDelegate` and a `DropTargetDelegate` (reuse `ListDropTargetDelegate` for lists/grids), render items with `data-key`, and call the six item/collection hooks like ListBox does. Without a delegate, keyboard navigation between drop positions can't work.
- **Reorder within a list vs. drop into another list**: same DropTarget model; distinguished by `isInternal`. `onReorder`/`onMove` fire only when internal; `onInsert`/`onRootDrop` only when external (`useDroppableCollectionState.ts:110-155`, `useDroppableCollection.ts:136-159`).
- **External sources / files**: the RFC (`limitations`) notes AT DnD **cannot** cross application boundaries (files, iframes) — those work pointer-only. `useClipboard.ts` provides copy/paste as the accessible alternative for cross-app transfer. Files arrive as `FileDropItem`/`DirectoryDropItem` via `readFromDataTransfer`.
- **Alt+Enter requirement**: if a draggable item also has a primary action, dragging needs Alt (`useDraggableItem.ts:138`). Forgetting `hasAction` breaks either dragging or the action.
- **`isValidDropTarget` must be a pure function of the target** — `getDropTargetFromPoint` calls it repeatedly during binary search; side effects there cause subtle bugs.
- **Never move focus manually during a drag.** `DragManager` owns focus during a session; steer it through the registered target callbacks (`onDropEnter`/`onDropExit` and the `next()`/`previous()` cycle), not `element.focus()`.
- **Announcement timing**: assertive drag-start can clobber a target announcement — the polite re-announce at `DragManager.ts:596` exists for exactly this; preserve it.
- Module-level singletons in `DragManager.ts` and `utils.ts` (`globalDndState`) mean only one drag can be active at a time and state leaks across tests if not cleared (`clearGlobalDnDState`).
