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
import {defineTarget} from '../explorer.mjs';
import {probe, tick, trackTimers} from '../helpers';
import {renderHook} from '@testing-library/react';
import {useTooltipTriggerState} from '../../packages/react-stately/src/tooltip/useTooltipTriggerState';
import {vi} from 'vitest';

const internals = () => probe('/tooltip/useTooltipTriggerState.ts');
type Hook = ReturnType<typeof renderHook<ReturnType<typeof useTooltipTriggerState>, unknown>>;
interface Context {
  hooks: Hook[];
  mounted: boolean[];
  intent: string[];
  history: string[];
  timers: ReturnType<typeof trackTimers>;
  instant: boolean;
}

const actions = Object.fromEntries(
  [0, 1].flatMap(i => [
    ...['Hover', 'Focus', 'Leave'].map(kind => [
      `${kind}${i}`,
      {
        enabled: (ctx: Context) => ctx.mounted[i] && ctx.intent[i] !== kind,
        async run(ctx: Context) {
          let warm = internals().read().warmed;
          await act(async () =>
            kind === 'Leave'
              ? ctx.hooks[i].result.current.close()
              : ctx.hooks[i].result.current.open(kind === 'Focus')
          );
          if (kind !== 'Leave' && warm) ctx.instant &&= ctx.hooks[i].result.current.isOpen;
          ctx.intent[i] = kind;
          ctx.history.push(`${kind}${i}`);
          await tick();
        }
      }
    ]),
    [
      `Unmount${i}`,
      {
        enabled: (ctx: Context) => ctx.mounted[i],
        async run(ctx: Context) {
          ctx.hooks[i].unmount();
          ctx.mounted[i] = false;
          ctx.history.push(`Unmount${i}`);
          await tick();
        }
      }
    ]
  ])
);

export default defineTarget<Context>({
  name: 'tooltip',
  description: 'Two real tooltip hooks sharing warmup, cooldown, and registry state.',
  sources: ['packages/react-stately/src/tooltip/useTooltipTriggerState.ts'],
  bounds: {depth: 5, maxRuns: 50000},
  async setup() {
    vi.useFakeTimers({now: 0, toFake: ['setTimeout', 'clearTimeout', 'Date']});
    internals().reset();
    let timers = trackTimers();
    let hooks = [0, 1].map(() => renderHook(() => useTooltipTriggerState()));
    return {hooks, timers, mounted: [true, true], intent: ['', ''], history: [], instant: true};
  },
  async teardown(ctx) {
    await cleanup(
      ...ctx.hooks.map((hook, i) => () => {
        if (ctx.mounted[i]) hook.unmount();
      }),
      () => internals().reset(),
      () => ctx.timers.restore(),
      () => vi.clearAllTimers(),
      () => vi.useRealTimers()
    );
  },
  actions: {
    ...actions,
    Tick: {
      enabled: () => vi.getTimerCount() > 0,
      async run(ctx) {
        await tick(500);
        ctx.history.push('Tick');
      }
    }
  },
  observe(ctx) {
    return {
      mounted: ctx.mounted,
      intent: ctx.intent,
      open: ctx.hooks.map((h, i) => ctx.mounted[i] && h.result.current.isOpen),
      ...internals().read(),
      timers: ctx.timers.pending(),
      instant: ctx.instant,
      // Includes per-hook close timers and callback ownership that the global probe
      // cannot see. Keep prefixes distinct rather than merge unequal private refs.
      history: ctx.history
    };
  },
  invariants: {
    AtMostOneOpen: ctx =>
      ctx.hooks.filter((h, i) => ctx.mounted[i] && h.result.current.isOpen).length <= 1,
    WarmOpensInstantly: ctx => ctx.instant,
    UnmountedRegistryClean: ctx =>
      internals()
        .read()
        .entries.every(id => ctx.mounted[Number(id) - 1]),
    UnmountedTimersClean: ctx => ctx.mounted.some(Boolean) || vi.getTimerCount() === 0
  }
});
