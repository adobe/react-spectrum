# CloseWatcher support for overlays

**Date:** 2026-07-20
**Status:** Approved design, pending implementation plan

## Problem

Overlays (dialogs, modals, popovers, menus) currently dismiss on the Escape
key via a React keyboard handler bound to the overlay element
([`useOverlay.ts:128-139`](../../../packages/react-aria/src/overlays/useOverlay.ts)).
This handler only fires when focus is inside the overlay, and it does not
participate in the platform's native "close request" mechanism (Escape on
desktop, the Android back gesture, etc.).

We want overlays to integrate with the native
[`CloseWatcher`](https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers)
API so that dismissal is driven by platform close requests rather than a
focus-bound key handler.

## Goals

- Route overlay dismissal through native `CloseWatcher` instances when the API
  is available.
- Preserve the existing "only the top-most overlay closes" semantics, keyed off
  the existing `visibleOverlays` stack.
- Handle the controlled-open case where the consumer ignores
  `onOpenChange(false)` and the overlay stays open even though its
  `CloseWatcher` was consumed.
- Fall back to the existing focus-bound Escape handler on browsers without
  `CloseWatcher`.
- Add browser tests that trigger real native close requests via Escape.

## Non-goals

- Changing component-specific Escape handling that lives outside `useOverlay`
  (combobox, menu, searchfield, calendar, etc.). Those keep their own handlers.
- Implementing a `cancel`/confirmation flow (see "Known limitations").

## Scope

**All `useOverlay` consumers** use the `CloseWatcher` when the API is available
— not just modals. This avoids introducing a new prop and reduces the number of
distinct dismissal code paths to test.

Accepted behavior change: non-modal popovers and menus will now close on a
close request regardless of where focus is, rather than only when focus is
inside the overlay (today's focus-bound behavior).

## Architecture

### 1. `CloseWatcher` manager (singleton pool)

A module-level singleton (`packages/react-aria/src/overlays/closeWatchers.ts`)
owns a **pool** of native `CloseWatcher` instances. Watchers are **not** tied to
any specific overlay — they are a fungible pool whose only job is to keep the
platform's close-request machinery armed. The overlays keep their own stack
(`visibleOverlays`) and independently decide which one closes; the pool order
need not match the overlay stack order.

State:

- `subscribers: Set<Subscriber>` — one entry per open, dismissable overlay.
- `watchers: CloseWatcher[]` — the pool.
- `pendingClose: Set<RefObject>` — refs asked to close during the current
  close request; cleared on the next microtask (see grouping, below).

A `Subscriber` is a stable object created once per `useOverlay` call. It reads
the latest `ref`/`onClose` from refs so the subscription never has to churn when
the consumer re-renders (consistent with the project preference to fix
re-renders via stored values rather than re-subscribing).

Public API:

- `subscribe(subscriber): () => void` — adds the subscriber, calls
  `reconcile()`, and returns an unsubscribe function that removes the subscriber
  and calls `reconcile()` again.

Internal:

- `reconcile()` — enforces the single invariant
  **`watchers.length === subscribers.size`**, creating or `destroy()`-ing
  watchers to match. Each created watcher's `onclose` handler removes itself
  from the pool, calls `notify()`, then calls `reconcile()`. This one invariant
  covers every lifecycle transition:
  - subscribe → pool grows by one.
  - unsubscribe (normal close) → pool shrinks by one.
  - watcher fires + overlay closes normally → subscriber removed *and* watcher
    consumed → still balanced.
  - watcher fires + controlled parent ignores `onOpenChange(false)` → subscriber
    remains but watcher was consumed → pool is short one → `reconcile()` creates
    a replacement so the still-open overlay stays dismissable.

- `notify()` — invoked by a fired watcher's `onclose`:
  1. Snapshot the subscriber set (`[...subscribers]`) so a synchronous
     unsubscribe during close does not corrupt iteration.
  2. Determine the top-most overlay from `visibleOverlays` **minus**
     `pendingClose` (so grouped synchronous fires target distinct overlays).
  3. Broadcast to every snapshot subscriber, passing the top-most ref; a
     subscriber closes only if its own ref is that top-most ref
     ("tell all, top-most closes").
  4. Add the closed ref to `pendingClose` and schedule a microtask to clear
     `pendingClose`.

`visibleOverlays` is shared between `useOverlay` and the manager. It stays
defined in `useOverlay.ts` (which owns pushing/splicing it on mount/unmount) and
is exported so `closeWatchers.ts` can import and snapshot it inside `notify()`.
The manager references it only at call time, so the `useOverlay` ↔
`closeWatchers` import cycle is safe (no module-init-time dependency).

### 2. `useOverlay` integration

Replace the focus-bound Escape `useKeyboard` shortcut with a subscription when
`CloseWatcher` is available:

```ts
useEffect(() => {
  if (!isOpen || isKeyboardDismissDisabled || !window.CloseWatcher) {
    return;
  }
  return closeWatchers.subscribe(subscriber); // subscriber reads latest ref/onClose
}, [isOpen, isKeyboardDismissDisabled]);
```

- **Subscription gating:** subscribe only when `isOpen` and not
  `isKeyboardDismissDisabled`. `isDismissable` does **not** gate subscription —
  matching today's behavior where a default modal (`isDismissable=false`) still
  closes on Escape.
- **Top-most check on close:** the subscriber's close callback reuses the
  existing `onHide` semantics — it calls `onClose` only when its ref is the
  top-most visible overlay.
- **Fallback:** when `window.CloseWatcher` is undefined, the subscription effect
  is a no-op and `useOverlay` keeps the existing `useKeyboard` Escape handler.
  When `CloseWatcher` *is* defined, the keyboard Escape handler is skipped to
  avoid double-handling.

### 3. Grouping — "close n" behavior

The spec allows exactly one "free" `CloseWatcher` without transient user
activation; additional watchers created without activation are **grouped** with
the most-recently-created one, so a single close request fires every watcher in
the group synchronously. This happens for programmatically-opened nested
overlays (no user gesture between opens).

Decision: **do not coalesce.** Each grouped watcher fires its own `notify()`,
and `n` grouped fires close `n` distinct overlays, top-down.

Because grouped `onclose` events fire synchronously but React removes an overlay
from `visibleOverlays` asynchronously (effect cleanup), two back-to-back
`notify()` calls would otherwise both see the same top-most overlay and
double-close it. The `pendingClose` set (above) excludes already-asked refs so
each successive `notify()` targets the next overlay down:

- Fire 1 → top-most = B → close B, mark B.
- Fire 2 → top-most = A (B excluded) → close A, mark A.
- `pendingClose` clears on the next microtask.

## Data flow

Open (with `CloseWatcher` support):

```
overlay opens → useOverlay effect → closeWatchers.subscribe(subscriber)
             → reconcile() → new CloseWatcher pushed to pool
```

Close request (Escape / back gesture):

```
platform close request → most-recent watcher.onclose
  → remove watcher from pool → notify()
      → snapshot subscribers; topmost = last(visibleOverlays \ pendingClose)
      → broadcast; subscriber whose ref === topmost calls onClose
      → mark topmost in pendingClose (clear next microtask)
  → reconcile() → if a still-open subscriber lost its watcher, create replacement
```

Close (normal):

```
overlay closes → useOverlay effect cleanup → unsubscribe()
             → reconcile() → destroy() one pooled watcher
```

## Error handling / edge cases

From the [close-requests spec](https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers):

1. **Free watcher + grouping.** Only one watcher is allowed without transient
   user activation; extras group. Handled by the "close n" mechanism +
   `pendingClose`. Covered by a nested-overlay browser test.
2. **Only the most-recently-created active watcher receives events.** Maps
   naturally to "top-most overlay closes" because overlays subscribe in open
   order.
3. **`preventDefault` on the Escape keydown suppresses the close request.**
   Components with their own Escape handlers (combobox, menu, etc.) that
   `preventDefault` will suppress the overlay close request — so they compose
   correctly. Verified empirically by a browser test.
4. **`cancel` event only fires with transient user activation, and only once
   per activation.** This is why an ignored `onOpenChange(false)` cannot be
   prevented early — the watcher is already consumed. Handled by recreating a
   replacement watcher via `reconcile()`.
5. **Watcher lifecycle.** A watcher deactivates after a `close` event,
   `destroy()`, or an aborted signal. The pool removes fired watchers and
   `destroy()`s surplus ones.

## Known limitations

- No `cancel`/confirmation flow is implemented. Because `cancel` only fires with
  transient user activation and only once per activation, a reliable
  "are you sure?" prompt is out of scope for this change.

## Testing

New `Modal.browser.test.tsx` (Vitest + Playwright browser provider,
`packages/react-aria-components/test/`, `*.browser.test.tsx`) that dispatches
**real** Escape keydowns so native `CloseWatcher` instances actually fire:

1. **Single overlay** — Escape closes it.
2. **`isKeyboardDismissDisabled`** — Escape does nothing.
3. **Nested modals** (`InertTest`-style) — first Escape closes the top overlay
   only; second Escape closes the next — top-most ordering.
4. **Modal + DateRangePicker popover** (`DateRangePickerInsideModalStory`) —
   with the picker open, Escape closes the picker and the modal stays open; a
   second Escape closes the modal.
5. **Controlled overlay ignoring `onOpenChange(false)`** — Escape fires, the
   parent ignores it, the overlay stays open, and a *second* Escape still fires
   (proving the replacement watcher was created).

Fallback (no `CloseWatcher`) continues to be covered by the existing
non-browser Escape tests.

## Files touched

- `packages/react-aria/src/overlays/closeWatchers.ts` (new) — the manager.
- `packages/react-aria/src/overlays/useOverlay.ts` — subscribe/unsubscribe;
  keep the keyboard handler as fallback; share `visibleOverlays`.
- `packages/react-aria-components/test/Modal.browser.test.tsx` (new) — browser
  tests.
