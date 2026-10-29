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
import {cleanup} from '../runtime.mjs';
import {createRoot, Root} from 'react-dom/client';
import {defineTarget} from '../explorer.mjs';
import type {Environment} from '../explorer.mjs';
import React from 'react';
import {usePress} from '../../packages/react-aria/src/interactions/usePress';
import {vi} from 'vitest';

// Reference model of pointer 1's single press attempt. `live` means the press has
// started and should still be held; it resolves to `activated` (native click, or the
// 80 ms fallback after pointerup without one) or `canceled` (its own pointercancel,
// disable, or unmount). Nothing pointer 2 does should change it.
type Outcome = 'none' | 'live' | 'activated' | 'canceled';
type Listener = {type: string; listener: unknown; capture: boolean};

const TRACKED = ['pointerup', 'pointercancel', 'click'];

interface Context {
  env: Environment;
  root: Root;
  host: HTMLElement;
  other: HTMLElement;
  events: string[];
  listeners: Listener[];
  restoreListeners: () => void;
  baselineTimers: number;
  mounted: boolean;
  disabled: boolean;
  pointer: 'idle' | 'down' | 'up' | 'canceled';
  outcome: Outcome;
  nativeClicked: boolean;
  otherClicked: boolean;
  otherDown: boolean;
}

function Example({events, isDisabled}: {events: string[]; isDisabled: boolean}) {
  let record = (event: {type: string}) => events.push(event.type);
  let {pressProps, isPressed} = usePress({
    isDisabled,
    onPressStart: record,
    onPressEnd: record,
    onPress: record
  });
  return (
    <div {...pressProps} role="button" tabIndex={0} data-pressed={isPressed}>
      Press
    </div>
  );
}

let target = (ctx: Context) => ctx.host.querySelector<HTMLElement>('[role=button]');
let pressed = (ctx: Context) => target(ctx)?.getAttribute('data-pressed') === 'true';
let count = (ctx: Context, type: string) => ctx.events.filter(event => event === type).length;
let timers = (ctx: Context) => vi.getTimerCount() - ctx.baselineTimers;

// Pointer 1: a non-virtual touch on the target, dispatched directly.
async function pointer(ctx: Context, type: string) {
  await act(async () => {
    (target(ctx) ?? document.body).dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: 'touch',
        button: 0,
        buttons: type === 'pointerdown' ? 1 : 0,
        width: 10,
        height: 10,
        isPrimary: true
      })
    );
  });
}

async function click(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, detail: 1}));
  });
}

// Pointer 2 is a touch on a surface outside the hook, so it survives unmount.
async function otherTouch(ctx: Context, type: 'start' | 'cancel') {
  let id = 0;
  await act(async () => {
    id = await ctx.env.input.touch(ctx.other, type);
  });
  if (id === 1) {
    throw new Error('Input diverged: the other touch reused pointer 1.');
  }
}

async function render(ctx: Context, isDisabled: boolean) {
  await act(async () => ctx.root.render(<Example events={ctx.events} isDisabled={isDisabled} />));
}

function cancelAttempt(ctx: Context) {
  if (ctx.outcome === 'live') {
    ctx.outcome = 'canceled';
  }
}

// Record the hook's document listeners, so cleanup can be checked.
function trackListeners(listeners: Listener[]) {
  let add = document.addEventListener;
  let remove = document.removeEventListener;
  let capture = (options?: boolean | EventListenerOptions) =>
    typeof options === 'boolean' ? options : !!options?.capture;
  let same = (item: Listener, type: string, listener: unknown, options) =>
    item.type === type && item.listener === listener && item.capture === capture(options);
  document.addEventListener = function (type, listener, options) {
    if (TRACKED.includes(type) && !listeners.some(item => same(item, type, listener, options))) {
      listeners.push({type, listener, capture: capture(options)});
    }
    return add.call(this, type, listener, options);
  };
  document.removeEventListener = function (type, listener, options) {
    let index = listeners.findIndex(item => same(item, type, listener, options));
    if (index >= 0) {
      listeners.splice(index, 1);
    }
    return remove.call(this, type, listener, options);
  };
  return () => {
    document.addEventListener = add;
    document.removeEventListener = remove;
  };
}

export default defineTarget<Context>({
  name: 'use-press',
  description:
    'usePress pointer lifecycle driven through the real hook: one press by pointer 1, an unrelated touch, clicks, the fallback timer, disable, and unmount.',
  sources: [
    'packages/react-aria/src/interactions/usePress.ts',
    'packages/react-aria/src/utils/useGlobalListeners.ts',
    'packages/react-aria/src/utils/isVirtualEvent.ts',
    'packages/react-aria/src/utils/useEffectEvent.ts'
  ],
  bounds: {depth: 8},
  model: {
    spec: 'UsePress.tla',
    // UsePress.tla's View tracks whether a timer or document listener exists.
    project: ({timers, listeners, ...rest}) => ({
      ...rest,
      timer: timers > 0,
      listeners: listeners.length > 0
    })
  },
  async setup(env) {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    let host = document.createElement('div');
    let other = document.createElement('div');
    other.textContent = 'Other surface';
    other.style.cssText = 'height: 50px; margin-top: 20px';
    document.body.append(host, other);
    let listeners: Listener[] = [];
    let ctx: Context = {
      env,
      root: createRoot(host),
      host,
      other,
      events: [],
      listeners,
      restoreListeners: trackListeners(listeners),
      baselineTimers: vi.getTimerCount(),
      mounted: true,
      disabled: false,
      pointer: 'idle',
      outcome: 'none',
      nativeClicked: false,
      otherClicked: false,
      otherDown: false
    };
    await render(ctx, false);
    return ctx;
  },
  async teardown(ctx) {
    await cleanup(
      async () => {
        if (ctx.mounted) await act(async () => ctx.root.unmount());
      },
      async () => {
        if (ctx.otherDown) await otherTouch(ctx, 'cancel');
      },
      () => ctx.restoreListeners(),
      () => ctx.host.remove(),
      () => ctx.other.remove(),
      () => vi.clearAllTimers(),
      () => vi.useRealTimers()
    );
  },
  actions: {
    PointerDown: {
      enabled: ctx => ctx.mounted && !ctx.disabled && ctx.pointer === 'idle',
      async run(ctx) {
        await pointer(ctx, 'pointerdown');
        ctx.pointer = 'down';
        ctx.outcome = 'live';
      }
    },
    PointerUp: {
      enabled: ctx => ctx.pointer === 'down',
      async run(ctx) {
        await pointer(ctx, 'pointerup');
        ctx.pointer = 'up';
      }
    },
    PointerCancel: {
      enabled: ctx => ctx.pointer === 'down',
      async run(ctx) {
        await pointer(ctx, 'pointercancel');
        ctx.pointer = 'canceled';
        cancelAttempt(ctx);
      }
    },
    // The browser's click after pointerup on the target. At most one per press.
    NativeClick: {
      enabled: ctx => ctx.mounted && ctx.pointer === 'up' && !ctx.nativeClicked,
      async run(ctx) {
        await click(target(ctx)!);
        ctx.nativeClicked = true;
        if (ctx.outcome === 'live') {
          ctx.outcome = 'activated';
        }
      }
    },
    // A click somewhere else in the document, e.g. a second finger's tap.
    OtherClick: {
      enabled: ctx => ['down', 'up'].includes(ctx.pointer) && !ctx.otherClicked,
      async run(ctx) {
        await click(ctx.other);
        ctx.otherClicked = true;
      }
    },
    // 100 ms passes. After pointerup without a native click (iOS/Android long press),
    // the fallback should activate the press.
    Tick: {
      enabled: ctx => ctx.pointer !== 'idle',
      async run(ctx) {
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
        if (ctx.outcome === 'live' && ctx.pointer === 'up' && !ctx.nativeClicked) {
          ctx.outcome = 'activated';
        }
      }
    },
    OtherPointerDown: {
      enabled: ctx => !ctx.otherDown,
      async run(ctx) {
        await otherTouch(ctx, 'start');
        ctx.otherDown = true;
      }
    },
    OtherPointerCancel: {
      enabled: ctx => ctx.otherDown,
      async run(ctx) {
        await otherTouch(ctx, 'cancel');
        ctx.otherDown = false;
      }
    },
    Disable: {
      enabled: ctx => ctx.mounted && !ctx.disabled,
      async run(ctx) {
        await render(ctx, true);
        ctx.disabled = true;
        cancelAttempt(ctx);
      }
    },
    Enable: {
      enabled: ctx => ctx.mounted && ctx.disabled,
      async run(ctx) {
        await render(ctx, false);
        ctx.disabled = false;
      }
    },
    Unmount: {
      enabled: ctx => ctx.mounted,
      async run(ctx) {
        await act(async () => ctx.root.unmount());
        ctx.mounted = false;
        cancelAttempt(ctx);
      }
    }
  },
  observe(ctx) {
    return {
      mounted: ctx.mounted,
      disabled: ctx.disabled,
      pointer: ctx.pointer,
      outcome: ctx.outcome,
      nativeClicked: ctx.nativeClicked,
      otherClicked: ctx.otherClicked,
      otherDown: ctx.otherDown,
      pressed: pressed(ctx),
      starts: count(ctx, 'pressstart'),
      ends: count(ctx, 'pressend'),
      presses: count(ctx, 'press'),
      timers: timers(ctx),
      listeners: ctx.listeners.map(item => `${item.type}${item.capture ? ':capture' : ''}`).sort()
    };
  },
  invariants: {
    PointerOwnership(ctx) {
      return ctx.outcome !== 'live' || !ctx.mounted || pressed(ctx)
        ? true
        : 'the press ended while pointer 1 was still pressing';
    },
    ActivationUnique(ctx) {
      let presses = count(ctx, 'press');
      return presses <= 1 || `onPress fired ${presses} times for one press`;
    },
    CancellationSafe(ctx) {
      return (
        ctx.outcome !== 'canceled' ||
        count(ctx, 'press') === 0 ||
        'onPress fired for a canceled press'
      );
    },
    NoLostActivation(ctx) {
      return (
        ctx.outcome !== 'activated' ||
        count(ctx, 'press') === 1 ||
        `the press should have activated, but onPress fired ${count(ctx, 'press')} times`
      );
    },
    LifecycleBalanced(ctx) {
      let starts = count(ctx, 'pressstart');
      let ends = count(ctx, 'pressend');
      if (ends > starts) {
        return `${ends} pressend for ${starts} pressstart`;
      }
      return !ctx.mounted || starts - ends === Number(pressed(ctx))
        ? true
        : `${starts} pressstart and ${ends} pressend while pressed is ${pressed(ctx)}`;
    },
    CleanupComplete(ctx) {
      if (ctx.mounted && !['canceled', 'activated'].includes(ctx.outcome)) {
        return true;
      }
      return timers(ctx) === 0 && ctx.listeners.length === 0
        ? true
        : `${timers(ctx)} pending timers and ${ctx.listeners.length} document listeners remain`;
    }
  }
});
