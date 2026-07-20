# CloseWatcher Support for Overlays — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route overlay dismissal (Escape / native close requests) through the platform `CloseWatcher` API via a singleton pool manager, while keeping the existing focus-bound Escape handler as a fallback.

**Architecture:** A module-level singleton (`closeWatchers.ts`) owns a pool of native `CloseWatcher` instances, decoupled from any specific overlay. `useOverlay` subscribes on open and unsubscribes on close. When a watcher fires, the manager snapshots the `visibleOverlays` z-order stack and tells the top-most overlay to close. The pool keeps its size equal to the subscriber count, which also recreates a watcher when a controlled consumer ignores `onOpenChange(false)`.

**Tech Stack:** TypeScript, React, `@react-aria/overlays` (source in `packages/react-aria/src/overlays/`), Jest (unit tests), Vitest + Playwright browser provider (browser tests).

## Global Constraints

- **No commits without explicit user confirmation** (project rule). The commit steps below are prepared but must be confirmed by the user before running.
- Source of truth for `@react-aria/overlays` lives in `packages/react-aria/src/overlays/` (the `packages/@react-aria/overlays/src/index.ts` is only a re-export shim).
- `CloseWatcher` is not present in the repo's TypeScript DOM lib (TS 5.8.2); the manager must declare its own minimal types.
- Apache license header (copyright 2026) required at the top of every new source and test file — copy the exact header block from `packages/react-aria-components/test/Dialog.browser.test.tsx`.
- Behavior parity: `isKeyboardDismissDisabled` gates dismissal; `isDismissable` does **not** gate Escape/close-request dismissal.
- When `CloseWatcher` is available, `useOverlay` must NOT `preventDefault` on the Escape keydown (that would suppress the native close request).

---

### Task 1: `closeWatchers` manager module

**Files:**
- Create: `packages/react-aria/src/overlays/closeWatchers.ts`
- Test: `packages/react-aria/test/overlays/closeWatchers.test.js`

**Interfaces:**
- Consumes: `visibleOverlays` (exported from `useOverlay.ts` in Task 2). For Task 1's tests, a local test-owned array stands in — see note below.
- Produces:
  - `export interface CloseWatcherSubscriber { ref: RefObject<Element | null>; onClose: () => void; }`
  - `export function subscribeCloseWatcher(subscriber: CloseWatcherSubscriber): () => void` — registers the subscriber, reconciles the pool, returns an unsubscribe function.

> **Import-cycle note:** `closeWatchers.ts` imports `visibleOverlays` from `useOverlay.ts`, and `useOverlay.ts` imports `subscribeCloseWatcher` from `closeWatchers.ts`. This cycle is safe because `closeWatchers.ts` only *reads* `visibleOverlays` at call time (inside `notify`), never at module-init time, and `subscribeCloseWatcher` is a hoisted function declaration. Since `useOverlay.ts` does not export `visibleOverlays` until Task 2, Task 1 temporarily declares `visibleOverlays` inside `closeWatchers.ts` and Task 2 moves the export and switches the import. (Both steps are shown.)

- [ ] **Step 1: Write the failing test**

Create `packages/react-aria/test/overlays/closeWatchers.test.js`:

```js
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

import {subscribeCloseWatcher, visibleOverlays} from '../../src/overlays/closeWatchers';

// Minimal fake of the native CloseWatcher. Mirrors the auto-destroy-on-fire
// behavior: firing removes the instance from the live pool.
class FakeCloseWatcher {
  static instances = [];
  constructor() {
    this.onclose = null;
    FakeCloseWatcher.instances.push(this);
  }
  destroy() {
    let i = FakeCloseWatcher.instances.indexOf(this);
    if (i >= 0) {
      FakeCloseWatcher.instances.splice(i, 1);
    }
  }
  // Simulate a native close request delivered to this watcher.
  fire() {
    this.destroy();
    this.onclose?.();
  }
}

function makeRef(el = document.createElement('div')) {
  return {current: el};
}

describe('closeWatchers manager', () => {
  beforeEach(() => {
    FakeCloseWatcher.instances = [];
    window.CloseWatcher = FakeCloseWatcher;
    visibleOverlays.length = 0;
  });

  afterEach(() => {
    delete window.CloseWatcher;
    visibleOverlays.length = 0;
  });

  it('creates one watcher per subscriber and destroys on unsubscribe', () => {
    let a = makeRef();
    visibleOverlays.push(a);
    let unsub = subscribeCloseWatcher({ref: a, onClose: () => {}});
    expect(FakeCloseWatcher.instances).toHaveLength(1);
    unsub();
    expect(FakeCloseWatcher.instances).toHaveLength(0);
  });

  it('closes only the top-most overlay when a watcher fires', () => {
    let a = makeRef();
    let b = makeRef();
    visibleOverlays.push(a, b); // b is top-most
    let onCloseA = jest.fn();
    let onCloseB = jest.fn();
    subscribeCloseWatcher({ref: a, onClose: onCloseA});
    subscribeCloseWatcher({ref: b, onClose: onCloseB});

    FakeCloseWatcher.instances[FakeCloseWatcher.instances.length - 1].fire();

    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).not.toHaveBeenCalled();
  });

  it('closes n distinct overlays for n grouped synchronous fires', () => {
    let a = makeRef();
    let b = makeRef();
    visibleOverlays.push(a, b);
    let onCloseA = jest.fn();
    let onCloseB = jest.fn();
    subscribeCloseWatcher({ref: a, onClose: onCloseA});
    subscribeCloseWatcher({ref: b, onClose: onCloseB});

    // Grouped fire: two watchers fire synchronously before any microtask runs.
    // visibleOverlays is NOT mutated between fires (React removal is async).
    let live = [...FakeCloseWatcher.instances];
    live[1].fire();
    live[0].fire();

    expect(onCloseB).toHaveBeenCalledTimes(1);
    expect(onCloseA).toHaveBeenCalledTimes(1);
  });

  it('recreates a watcher when a subscriber stays open after firing (controlled-ignore)', () => {
    let a = makeRef();
    visibleOverlays.push(a);
    subscribeCloseWatcher({ref: a, onClose: () => {}}); // onClose ignores -> a stays in visibleOverlays

    expect(FakeCloseWatcher.instances).toHaveLength(1);
    FakeCloseWatcher.instances[0].fire();
    // Subscriber never unsubscribed, so the pool is topped back up to 1.
    expect(FakeCloseWatcher.instances).toHaveLength(1);
  });

  it('is a no-op when CloseWatcher is unavailable', () => {
    delete window.CloseWatcher;
    let a = makeRef();
    visibleOverlays.push(a);
    let unsub = subscribeCloseWatcher({ref: a, onClose: () => {}});
    expect(FakeCloseWatcher.instances).toHaveLength(0);
    expect(() => unsub()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/react-aria/test/overlays/closeWatchers.test.js`
Expected: FAIL — cannot find module `../../src/overlays/closeWatchers`.

- [ ] **Step 3: Write the manager**

Create `packages/react-aria/src/overlays/closeWatchers.ts`:

```ts
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

import {RefObject} from '@react-types/shared';

// CloseWatcher is not yet in the TypeScript DOM lib (TS 5.8.2), so declare
// the minimal surface we rely on.
interface CloseWatcher {
  destroy(): void;
  onclose: (() => void) | null;
}
interface CloseWatcherConstructor {
  new (): CloseWatcher;
}
declare global {
  // eslint-disable-next-line no-var
  interface Window {
    CloseWatcher?: CloseWatcherConstructor;
  }
}

export interface CloseWatcherSubscriber {
  /** The overlay container ref, used to determine z-order via visibleOverlays. */
  ref: RefObject<Element | null>;
  /** Called when this overlay should close because it is the top-most. */
  onClose: () => void;
}

// TEMPORARY for Task 1 only. Task 2 removes this and imports the shared
// array from useOverlay.ts instead.
export const visibleOverlays: RefObject<Element | null>[] = [];

const subscribers = new Set<CloseWatcherSubscriber>();
const watchers: CloseWatcher[] = [];

// Refs asked to close during the current (synchronous) close request. Excluded
// from the top-most calculation so grouped synchronous fires close distinct
// overlays. Cleared on the next microtask.
const pendingClose = new Set<RefObject<Element | null>>();
let pendingClear = false;

function hasCloseWatcher(): boolean {
  return typeof window !== 'undefined' && typeof window.CloseWatcher === 'function';
}

function createWatcher(): void {
  let watcher = new window.CloseWatcher!();
  watcher.onclose = () => {
    let i = watchers.indexOf(watcher);
    if (i >= 0) {
      watchers.splice(i, 1);
    }
    notify();
    reconcile();
  };
  watchers.push(watcher);
}

// Invariant: watchers.length === subscribers.size.
function reconcile(): void {
  if (!hasCloseWatcher()) {
    return;
  }
  while (watchers.length < subscribers.size) {
    createWatcher();
  }
  while (watchers.length > subscribers.size) {
    watchers.pop()!.destroy();
  }
}

function notify(): void {
  // Snapshot at the start so mutations (closing removes from visibleOverlays)
  // and synchronous unsubscribes do not shift the top-most check mid-pass.
  let overlays = visibleOverlays.filter(o => !pendingClose.has(o));
  let topMost = overlays[overlays.length - 1];
  if (!topMost) {
    return;
  }

  pendingClose.add(topMost);
  if (!pendingClear) {
    pendingClear = true;
    queueMicrotask(() => {
      pendingClose.clear();
      pendingClear = false;
    });
  }

  // Tell all subscribers; only the top-most one closes.
  for (let subscriber of [...subscribers]) {
    if (subscriber.ref === topMost) {
      subscriber.onClose();
    }
  }
}

export function subscribeCloseWatcher(subscriber: CloseWatcherSubscriber): () => void {
  if (!hasCloseWatcher()) {
    return () => {};
  }
  subscribers.add(subscriber);
  reconcile();
  return () => {
    subscribers.delete(subscriber);
    reconcile();
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn jest packages/react-aria/test/overlays/closeWatchers.test.js`
Expected: PASS (all 5 tests).

- [ ] **Step 5: Commit** (only after user confirmation)

```bash
git add packages/react-aria/src/overlays/closeWatchers.ts packages/react-aria/test/overlays/closeWatchers.test.js
git commit -m "feat: add CloseWatcher pool manager for overlays"
```

---

### Task 2: `useOverlay` integration + shared `visibleOverlays`

**Files:**
- Modify: `packages/react-aria/src/overlays/useOverlay.ts` (line 61 export; lines 128-139 keyboard fallback; add subscription effect)
- Modify: `packages/react-aria/src/overlays/closeWatchers.ts` (remove temporary `visibleOverlays`, import from `useOverlay`)
- Test: `packages/react-aria/test/overlays/useOverlay.test.js` (add CloseWatcher-path tests)

**Interfaces:**
- Consumes: `subscribeCloseWatcher`, `CloseWatcherSubscriber` from Task 1.
- Produces: `export const visibleOverlays` from `useOverlay.ts` (moved out of Task 1's temporary declaration).

- [ ] **Step 1: Write the failing test**

Add to `packages/react-aria/test/overlays/useOverlay.test.js` (after the existing Escape tests, before the final closing `});` of the file — the two blocks below are top-level `it`s inside the `describe('useOverlay', ...)`):

```js
  describe('with CloseWatcher', () => {
    class FakeCloseWatcher {
      static instances = [];
      constructor() {
        this.onclose = null;
        FakeCloseWatcher.instances.push(this);
      }
      destroy() {
        let i = FakeCloseWatcher.instances.indexOf(this);
        if (i >= 0) {
          FakeCloseWatcher.instances.splice(i, 1);
        }
      }
      fire() {
        this.destroy();
        this.onclose?.();
      }
    }

    beforeEach(() => {
      FakeCloseWatcher.instances = [];
      window.CloseWatcher = FakeCloseWatcher;
    });
    afterEach(() => {
      delete window.CloseWatcher;
    });

    it('closes via a fired close watcher instead of the keydown handler', function () {
      let onClose = jest.fn();
      let res = render(<Example isOpen onClose={onClose} />);
      let el = res.getByTestId('test');

      // The keydown handler must NOT be registered when CloseWatcher exists,
      // so Escape keydown alone does nothing.
      fireEvent.keyDown(el, {key: 'Escape'});
      expect(onClose).not.toHaveBeenCalled();

      // Firing the watcher (as the platform would) closes the overlay.
      FakeCloseWatcher.instances[FakeCloseWatcher.instances.length - 1].fire();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not subscribe when isKeyboardDismissDisabled', function () {
      let onClose = jest.fn();
      render(<Example isOpen onClose={onClose} isKeyboardDismissDisabled />);
      expect(FakeCloseWatcher.instances).toHaveLength(0);
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn jest packages/react-aria/test/overlays/useOverlay.test.js -t "with CloseWatcher"`
Expected: FAIL — `onClose` is called by the still-present keydown handler (first test), and/or a watcher is created path missing.

- [ ] **Step 3: Export `visibleOverlays` and wire the subscription in `useOverlay.ts`**

In `packages/react-aria/src/overlays/useOverlay.ts`:

Change the import line to also pull in the manager and the `useEffectEvent`
utility (keep imports sorted by their first binding name):

```ts
import {subscribeCloseWatcher} from './closeWatchers';
import {useEffect, useRef} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
```

Export `visibleOverlays` (line 61):

```ts
export const visibleOverlays: RefObject<Element | null>[] = [];
```

Add, immediately after `onHide` is defined (after line 98), the CloseWatcher
availability flag, a stable close-request callback, and the subscription
effect. **Do not read or write a ref during render** — use `useEffectEvent`
to keep `onClose` fresh (it returns a stable callback that always invokes the
latest `onClose`, updating its ref inside an insertion effect), and build the
subscriber object *inside* the effect:

```ts
  let hasCloseWatcher = typeof window !== 'undefined' && typeof window.CloseWatcher === 'function';

  // A stable callback that always calls the latest onClose, so the close watcher
  // subscription does not need to re-run (and churn the pool) on every re-render.
  let onCloseRequest = useEffectEvent(() => onClose?.());

  useEffect(() => {
    if (!isOpen || isKeyboardDismissDisabled || !hasCloseWatcher) {
      return;
    }
    return subscribeCloseWatcher({ref, onClose: onCloseRequest});
    // onCloseRequest is a stable useEffectEvent and must be omitted from deps.
  }, [isOpen, isKeyboardDismissDisabled, hasCloseWatcher, ref]);
```

Replace the keyboard handler (lines 128-139) so the Escape shortcut is only registered as a fallback when `CloseWatcher` is unavailable (registering it when available would `preventDefault` and suppress the native close request):

```ts
  // Fallback Escape handling for browsers without CloseWatcher support.
  // When CloseWatcher is available, Escape is handled via the subscription
  // above and we must NOT preventDefault here or the native close request
  // would be suppressed.
  let {keyboardProps} = useKeyboard(hasCloseWatcher ? {} : {
    shortcuts: {
      Escape: () => {
        if (!isKeyboardDismissDisabled) {
          onHide();
          return;
        }
        return false;
      }
    }
  });
```

- [ ] **Step 4: Remove the temporary `visibleOverlays` from `closeWatchers.ts`**

In `packages/react-aria/src/overlays/closeWatchers.ts`, delete the temporary block:

```ts
// TEMPORARY for Task 1 only. Task 2 removes this and imports the shared
// array from useOverlay.ts instead.
export const visibleOverlays: RefObject<Element | null>[] = [];
```

and replace it with an import near the top (after the existing `import {RefObject} ...`):

```ts
import {visibleOverlays} from './useOverlay';
```

- [ ] **Step 5: Update Task 1's manager test import**

In `packages/react-aria/test/overlays/closeWatchers.test.js`, change the import so `visibleOverlays` comes from `useOverlay` (its new home):

```js
import {subscribeCloseWatcher} from '../../src/overlays/closeWatchers';
import {visibleOverlays} from '../../src/overlays/useOverlay';
```

- [ ] **Step 6: Run all affected unit tests**

Run: `yarn jest packages/react-aria/test/overlays/useOverlay.test.js packages/react-aria/test/overlays/closeWatchers.test.js`
Expected: PASS. The pre-existing jsdom Escape tests still pass because jsdom has no `window.CloseWatcher`, so the fallback keydown handler stays active for them.

- [ ] **Step 7: Run the broader overlay suite for regressions**

Run: `yarn jest packages/react-aria/test/overlays/`
Expected: PASS (no regressions in `useModalOverlay`, `usePopover`, etc.).

- [ ] **Step 8: Commit** (only after user confirmation)

```bash
git add packages/react-aria/src/overlays/useOverlay.ts packages/react-aria/src/overlays/closeWatchers.ts packages/react-aria/test/overlays/
git commit -m "feat: dismiss overlays via CloseWatcher, keep keydown fallback"
```

---

### Task 3: Browser tests driving native close requests

**Files:**
- Create: `packages/react-aria-components/test/CloseWatcher.browser.test.tsx`

**Interfaces:**
- Consumes: RAC `DialogTrigger`, `Modal`, `ModalOverlay`, `Popover`, `Dialog`, `Button`, `Heading`. Real Escape via `userEvent.keyboard('{Escape}')`.

- [ ] **Step 1: Write the browser tests**

Create `packages/react-aria-components/test/CloseWatcher.browser.test.tsx`:

```tsx
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

import {Button} from '../src/Button';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {describe, expect, it} from 'vitest';
import {Heading} from '../src/Heading';
import {Modal, ModalOverlay} from '../src/Modal';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

// CloseWatcher is required for these tests. Skip on browsers that lack it
// rather than exercising the keydown fallback (covered by the jsdom suite).
let supportsCloseWatcher = typeof window !== 'undefined' && 'CloseWatcher' in window;
let describeCloseWatcher = supportsCloseWatcher ? describe : describe.skip;

async function press(key: string) {
  await userEvent.keyboard(`{${key}}`);
}

describeCloseWatcher('CloseWatcher dismissal', () => {
  it('closes a single modal on Escape', async () => {
    let {getByRole, queryByRole} = await render(
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Hello</Heading>
            <Button autoFocus>Focus</Button>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    expect(getByRole('dialog')).toBeTruthy();
    await press('Escape');
    expect(queryByRole('dialog')).toBeNull();
  });

  it('does not close when isKeyboardDismissDisabled', async () => {
    let {getByRole} = await render(
      <DialogTrigger defaultOpen>
        <Button>Open</Button>
        <ModalOverlay isKeyboardDismissDisabled>
          <Modal>
            <Dialog>
              <Heading slot="title">Locked</Heading>
              <Button autoFocus>Focus</Button>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    );
    expect(getByRole('dialog')).toBeTruthy();
    await press('Escape');
    expect(getByRole('dialog')).toBeTruthy();
  });

  it('closes the top-most overlay first for nested modals', async () => {
    // Outer opens on mount (the single "free" watcher). The inner modal is
    // opened by a click so it gets its own transient-user-activation watcher
    // and is NOT grouped with the outer (grouping would close both at once).
    let {getByRole, queryAllByRole} = await render(
      <DialogTrigger defaultOpen>
        <Button>Open outer</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Outer</Heading>
            <DialogTrigger>
              <Button autoFocus>Open inner</Button>
              <Modal>
                <Dialog>
                  <Heading slot="title">Inner</Heading>
                  <Button autoFocus>Inner focus</Button>
                </Dialog>
              </Modal>
            </DialogTrigger>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    expect(queryAllByRole('dialog')).toHaveLength(1);
    await userEvent.click(getByRole('button', {name: 'Open inner'}));
    expect(queryAllByRole('dialog')).toHaveLength(2);
    await press('Escape');
    // Inner closed, outer remains.
    expect(queryAllByRole('dialog')).toHaveLength(1);
    expect(getByRole('dialog')).toBeTruthy();
    await press('Escape');
    // Outer closes on the replacement/next watcher.
    expect(queryAllByRole('dialog')).toHaveLength(0);
  });

  it('closes an inner popover before the modal', async () => {
    // Modal opens on mount (free watcher); popover opened via click so its
    // watcher is independent (not grouped) and receives the first close request.
    let {getByRole, getByText, queryByRole, queryByText} = await render(
      <DialogTrigger defaultOpen>
        <Button>Open modal</Button>
        <Modal>
          <Dialog>
            <Heading slot="title">Modal</Heading>
            <DialogTrigger>
              <Button autoFocus>Open popover</Button>
              <Popover>
                <Dialog>
                  <Button autoFocus>Popover content</Button>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );
    await userEvent.click(getByRole('button', {name: 'Open popover'}));
    expect(getByText('Popover content')).toBeTruthy();
    await press('Escape');
    // Popover (most-recent watcher) closes; modal stays.
    expect(queryByText('Popover content')).toBeNull();
    expect(getByRole('dialog')).toBeTruthy();
    await press('Escape');
    // Modal closes on the next close request.
    expect(queryByRole('dialog')).toBeNull();
  });

  it('recreates a watcher when a controlled parent ignores onOpenChange', async () => {
    let closeCount = 0;
    function Controlled() {
      // Always open; ignore onOpenChange(false) so the modal stays open.
      return (
        <DialogTrigger
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeCount++;
            }
          }}>
          <Button>Open</Button>
          <Modal>
            <Dialog>
              <Heading slot="title">Sticky</Heading>
              <Button autoFocus>Focus</Button>
            </Dialog>
          </Modal>
        </DialogTrigger>
      );
    }
    let {getByRole} = await render(<Controlled />);
    expect(getByRole('dialog')).toBeTruthy();

    await press('Escape');
    expect(closeCount).toBe(1);
    expect(getByRole('dialog')).toBeTruthy();

    // Second Escape only fires if a replacement watcher was created.
    await press('Escape');
    expect(closeCount).toBe(2);
    expect(getByRole('dialog')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the browser tests**

Run: `yarn test:browser packages/react-aria-components/test/CloseWatcher.browser.test.tsx`
Expected: PASS across chromium/firefox/webkit (all support CloseWatcher). If a runner instance lacks CloseWatcher, the whole suite is skipped (not failed).

> **If any test fails on unmount timing** (an overlay asserted closed is still momentarily in the DOM), verify the actual DOM with the browser tools first, and treat any real failure with the systematic-debugging skill rather than loosening the assertion (e.g. do not swap a strict `queryByRole(...).toBeNull()` for a weaker check without understanding why).

- [ ] **Step 3: Commit** (only after user confirmation)

```bash
git add packages/react-aria-components/test/CloseWatcher.browser.test.tsx
git commit -m "test: add browser tests for CloseWatcher overlay dismissal"
```

---

## Notes on spec edge cases (for the implementer)

These are validated or documented, not separate tasks:

- **Free watcher + grouping** — covered by Task 1's "n grouped fires" unit test and Task 3's nested-modal test.
- **Only the most-recent watcher receives events** — covered by Task 3's nested + popover tests (top-most closes first).
- **`preventDefault` on Escape suppresses the close request** — this is why component-specific Escape handlers (combobox, menu, etc.) still compose. Not changed by this work; note it in code comments only.
- **`cancel` only fires with transient activation / once per activation** — the reason an ignored `onOpenChange(false)` can't be prevented early; handled by watcher recreation (Task 1 unit test + Task 3 controlled test). No `cancel`/confirmation flow is implemented (out of scope).
