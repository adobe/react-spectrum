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

import {act} from 'react';
import {Button} from '../../packages/react-aria-components/src/Button';
import {createRoot, Root} from 'react-dom/client';
import {defineTarget} from '../explorer.mjs';
import type {Environment} from '../explorer.mjs';
import React from 'react';
import {setInteractionModality} from 'react-aria/useFocusVisible';
import {Text} from '../../packages/react-aria-components/src/Text';
import {
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastRegion as ToastRegion
} from '../../packages/react-aria-components/src/Toast';
import {ToastQueue} from 'react-stately/useToastState';
import {vi} from 'vitest';

const TIMEOUT = 5000;
const TICK = 2500;
const MAX_VISIBLE = 1;
const MAX_OPEN = 2;
const MAX_ADDED = 3;

// Reference model: a toast auto-closes once it has been visible and unpaused
// for its full timeout. Becoming visible again starts a fresh timeout, matching
// useToast's reset on mount.
type ReferenceToast = {id: number; key: string; elapsed: number};
type Problem = {invariant: string; message: string};

interface Context {
  env: Environment;
  queue: ToastQueue<{id: number}>;
  root: Root;
  host: HTMLElement;
  away: HTMLElement;
  pointerOverRegion: boolean;
  apiPaused: boolean;
  focusEntered: boolean;
  added: number;
  open: ReferenceToast[];
  visible: Set<number>;
  closing: number | null;
  problems: Problem[];
  now: number;
}

let region = () => document.querySelector<HTMLElement>('.react-aria-ToastRegion');
let focusInRegion = () => !!region()?.contains(document.activeElement);
let pauseReason = (ctx: Context) =>
  ctx.pointerOverRegion
    ? 'the pointer was over the region'
    : focusInRegion()
      ? 'focus was in the region'
      : ctx.apiPaused
        ? 'pauseAll() was in effect'
        : null;

function advance(ctx: Context, time: number) {
  if (!pauseReason(ctx)) {
    for (let toast of ctx.open) {
      if (ctx.visible.has(toast.id)) {
        toast.elapsed += time - ctx.now;
      }
    }
  }
  ctx.now = time;
}

function refreshVisible(ctx: Context) {
  let visible = new Set(ctx.open.slice(0, MAX_VISIBLE).map(toast => toast.id));
  for (let toast of ctx.open) {
    if (visible.has(toast.id) && !ctx.visible.has(toast.id)) {
      toast.elapsed = 0;
    }
  }
  ctx.visible = visible;
}

function onClose(ctx: Context, id: number) {
  if (ctx.closing === id) {
    return;
  }

  // Timer-driven close: compare against the reference before updating it.
  advance(ctx, Date.now());
  let toast = ctx.open.find(toast => toast.id === id)!;
  let reason = pauseReason(ctx);
  let at = `at ${Date.now()} ms`;
  if (reason) {
    ctx.problems.push({
      invariant: ctx.apiPaused ? 'PauseAllHoldsTimers' : 'RegionPauseHoldsTimers',
      message: `toast #${id} auto-closed ${at} while ${reason}`
    });
  } else if (!ctx.visible.has(id) || toast.elapsed !== TIMEOUT) {
    ctx.problems.push({
      invariant: 'AutoCloseAfterTimeout',
      message: ctx.visible.has(id)
        ? `toast #${id} auto-closed ${at} after ${toast.elapsed} of ${TIMEOUT} ms`
        : `toast #${id} auto-closed ${at} while hidden`
    });
  }
  ctx.open = ctx.open.filter(item => item !== toast);
  refreshVisible(ctx);
}

// A region with no toasts unmounts; move the pointer off so it is not over the
// next region that mounts in the same place.
async function leaveEmptyRegion(ctx: Context) {
  if (ctx.pointerOverRegion && !region()) {
    await act(() => ctx.env.input.hover(ctx.away));
    ctx.pointerOverRegion = false;
  }
}

// jsdom's Selection schedules a 0 ms timer on every focus(). Run zero-delay timers
// after setup and each action, as a browser would, so pendingTimers counts only
// toast timeouts.
async function settle() {
  await act(async () => {
    vi.advanceTimersByTime(0);
  });
}

// Settles each action, and records focus entering the region during any action
// other than focus: only the user should move focus into the region. focusEntered
// stands in for useToastRegion's private focus refs, which observe cannot read;
// without it, states that differ only in those refs are merged.
function instrument(
  actions: Record<
    string,
    {enabled: (ctx: Context) => boolean; run: (ctx: Context) => Promise<void>}
  >
) {
  return Object.fromEntries(
    Object.entries(actions).map(([name, action]) => [
      name,
      {
        ...action,
        async run(ctx: Context) {
          let before = focusInRegion();
          await action.run(ctx);
          await settle();
          ctx.focusEntered ||= focusInRegion();
          if (name !== 'focus' && !before && focusInRegion()) {
            ctx.problems.push({
              invariant: 'FocusNotStolen',
              message: `focus moved into the region during ${name}`
            });
          }
        }
      }
    ])
  );
}

function problem(invariant: string) {
  return (ctx: Context) =>
    ctx.problems.find(problem => problem.invariant === invariant)?.message ?? true;
}

function Example({queue}: {queue: ToastQueue<{id: number}>}) {
  return (
    <>
      <button data-away>Away</button>
      <ToastRegion queue={queue}>
        {({toast}) => (
          <Toast toast={toast} data-toast-id={toast.content.id}>
            <ToastContent>
              <Text slot="title">Toast {toast.content.id}</Text>
            </ToastContent>
            <Button slot="close">Close</Button>
          </Toast>
        )}
      </ToastRegion>
    </>
  );
}

export default defineTarget<Context>({
  name: 'toast-queue',
  description:
    'ToastQueue timers driven through a real ToastRegion: add, close, hover, focus, pauseAll/resumeAll, and time.',
  sources: [
    'packages/react-stately/src/toast/useToastState.ts',
    'packages/react-aria/src/toast/useToast.ts',
    'packages/react-aria/src/toast/useToastRegion.ts',
    'packages/react-aria-components/src/Toast.tsx'
  ],
  bounds: {depth: 7},
  model: {
    spec: 'ToastQueue.tla',
    // ToastQueue.tla counts time in ticks and tracks the region's focus refs, so it
    // needs neither regionHovered (covered by check) nor focusEntered.
    project: ({regionHovered, focusEntered, toasts, ...rest}) => ({
      ...rest,
      toasts: toasts.map(({elapsed, remaining, sinceStart, ...toast}) => ({
        ...toast,
        elapsed: elapsed / TICK,
        remaining: remaining / TICK,
        sinceStart: sinceStart === null ? -1 : sinceStart / TICK
      }))
    })
  },
  async setup(env) {
    vi.useFakeTimers({now: 0, toFake: ['setTimeout', 'clearTimeout', 'Date']});
    let host = document.createElement('div');
    document.body.append(host);
    let queue = new ToastQueue<{id: number}>({maxVisibleToasts: MAX_VISIBLE});
    let root = createRoot(host);
    await act(async () => root.render(<Example queue={queue} />));
    let away = host.querySelector<HTMLElement>('[data-away]')!;
    // Pointer position, focus, and modality are global; start every run from the same
    // state so hover, the region's restore-focus target, and its focus-move branch do
    // not depend on earlier runs.
    await act(() => env.input.hover(away));
    await act(async () => away.focus());
    setInteractionModality('pointer');
    await settle();
    return {
      env,
      queue,
      root,
      host,
      away,
      pointerOverRegion: false,
      apiPaused: false,
      focusEntered: false,
      added: 0,
      open: [],
      visible: new Set(),
      closing: null,
      problems: [],
      now: 0
    };
  },
  async teardown(ctx) {
    await act(() => ctx.env.input.hover(ctx.away));
    await act(async () => ctx.root.unmount());
    ctx.host.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
  },
  // Real input can miss (e.g. a Playwright move during layout), and Chromium hovers
  // elements that appear under a stationary pointer. Either makes a run unreliable.
  check(ctx) {
    let hovered = !!region()?.hasAttribute('data-hovered');
    if (hovered !== ctx.pointerOverRegion) {
      throw new Error(
        `Input diverged: the region is ${hovered ? '' : 'not '}hovered, but the pointer is ${ctx.pointerOverRegion ? 'over it' : 'away'}.`
      );
    }
  },
  actions: instrument({
    add: {
      enabled: ctx => !ctx.apiPaused && ctx.open.length < MAX_OPEN && ctx.added < MAX_ADDED,
      async run(ctx) {
        let id = ++ctx.added;
        let key = '';
        advance(ctx, Date.now());
        await act(async () => {
          key = ctx.queue.add({id}, {timeout: TIMEOUT, onClose: () => onClose(ctx, id)});
        });
        ctx.open.unshift({id, key, elapsed: 0});
        refreshVisible(ctx);
      }
    },
    // Programmatic close of the newest visible toast (e.g. app code or the close button).
    close: {
      enabled: ctx => !ctx.apiPaused && ctx.visible.size > 0,
      async run(ctx) {
        let toast = ctx.open.find(toast => ctx.visible.has(toast.id))!;
        advance(ctx, Date.now());
        ctx.closing = toast.id;
        await act(async () => ctx.queue.close(toast.key));
        ctx.closing = null;
        ctx.open = ctx.open.filter(item => item !== toast);
        refreshVisible(ctx);
        await leaveEmptyRegion(ctx);
      }
    },
    hover: {
      enabled: ctx => !ctx.apiPaused && !ctx.pointerOverRegion && !!region(),
      async run(ctx) {
        advance(ctx, Date.now());
        await act(() => ctx.env.input.hover(region()!));
        ctx.pointerOverRegion = true;
      }
    },
    unhover: {
      enabled: ctx => ctx.pointerOverRegion,
      async run(ctx) {
        advance(ctx, Date.now());
        await act(() => ctx.env.input.hover(ctx.away));
        ctx.pointerOverRegion = false;
      }
    },
    focus: {
      enabled: ctx => !ctx.apiPaused && !focusInRegion() && !!region(),
      async run(ctx) {
        advance(ctx, Date.now());
        await act(async () => region()!.querySelector<HTMLElement>('[role=alertdialog]')!.focus());
      }
    },
    blur: {
      enabled: () => focusInRegion(),
      async run(ctx) {
        advance(ctx, Date.now());
        await act(async () => ctx.away.focus());
      }
    },
    tick: {
      enabled: ctx => ctx.open.length > 0,
      async run(ctx) {
        advance(ctx, Date.now());
        await act(async () => {
          vi.advanceTimersByTime(TICK);
        });
        advance(ctx, Date.now());
        await leaveEmptyRegion(ctx);
      }
    },
    // Public API. Kept apart from hover/focus, whose interplay with pauseAll is unspecified.
    pauseAll: {
      enabled: ctx => !ctx.pointerOverRegion && !focusInRegion(),
      async run(ctx) {
        advance(ctx, Date.now());
        await act(async () => ctx.queue.pauseAll());
        ctx.apiPaused = true;
      }
    },
    resumeAll: {
      enabled: ctx => !ctx.pointerOverRegion && !focusInRegion(),
      async run(ctx) {
        advance(ctx, Date.now());
        await act(async () => ctx.queue.resumeAll());
        ctx.apiPaused = false;
      }
    }
  }),
  observe(ctx) {
    return {
      pointerOverRegion: ctx.pointerOverRegion,
      // The region's own hover state, as evidence that real input registered.
      regionHovered: !!region()?.hasAttribute('data-hovered'),
      focusInRegion: focusInRegion(),
      focusEntered: ctx.focusEntered,
      apiPaused: ctx.apiPaused,
      added: ctx.added,
      toasts: ctx.open.map(toast => {
        // Timer internals (private) keep states with different pending timeouts apart.
        let queued: Array<{key: string; timer?: any}> = (ctx.queue as any).queue;
        let timer = queued.find(item => item.key === toast.key)?.timer;
        let running = timer?.timerId != null;
        return {
          id: toast.id,
          visible: ctx.visible.has(toast.id),
          elapsed: toast.elapsed,
          running,
          remaining: timer?.remaining ?? null,
          sinceStart: running ? Date.now() - timer.startTime : null
        };
      }),
      pendingTimers: vi.getTimerCount(),
      problems: ctx.problems.map(problem => problem.invariant)
    };
  },
  invariants: {
    RegionPauseHoldsTimers: problem('RegionPauseHoldsTimers'),
    PauseAllHoldsTimers: problem('PauseAllHoldsTimers'),
    AutoCloseAfterTimeout: problem('AutoCloseAfterTimeout'),
    FocusNotStolen: problem('FocusNotStolen'),
    NoOverdueToast(ctx) {
      if (pauseReason(ctx)) {
        return true;
      }
      let toast = ctx.open.find(toast => ctx.visible.has(toast.id) && toast.elapsed >= TIMEOUT);
      return toast
        ? `toast #${toast.id} is still open after ${toast.elapsed} ms visible and unpaused`
        : true;
    },
    VisibleToastsMatchReference(ctx) {
      let expected = ctx.open.filter(toast => ctx.visible.has(toast.id)).map(toast => toast.id);
      let queued = ctx.queue.visibleToasts.map(toast => toast.content.id);
      let rendered = [...document.querySelectorAll('[data-toast-id]')].map(element =>
        Number(element.getAttribute('data-toast-id'))
      );
      return JSON.stringify(queued) === JSON.stringify(expected) &&
        JSON.stringify(rendered) === JSON.stringify(expected)
        ? true
        : `expected visible ${JSON.stringify(expected)}, queue has ${JSON.stringify(queued)}, rendered ${JSON.stringify(rendered)}`;
    }
  }
});
