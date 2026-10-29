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

import {cleanup} from '../runtime.mjs';
import {createRoot, Root} from 'react-dom/client';
import {defineTarget} from '../explorer.mjs';
import {FocusScope, focusScopeTree} from '../../packages/react-aria/src/focus/FocusScope';
import React, {act} from 'react';
import {setInteractionModality} from '../../packages/react-aria/src/interactions/useFocusVisible';
import {tick} from '../helpers';
import {vi} from 'vitest';

interface Context {
  root: Root;
  host: HTMLElement;
  modes: number[];
  restore: number[];
  outside: boolean;
  history: string[];
  detached: boolean;
  restoreFocus: () => void;
}
const focused = () => Number(document.activeElement?.getAttribute('data-focus') ?? -1);
function Example({ctx}: {ctx: Context}) {
  let scope = (i: number, child?: React.ReactNode) => (
    <FocusScope
      contain={ctx.modes[i] === 3}
      restoreFocus={ctx.modes[i] >= 2}
      autoFocus={ctx.modes[i] >= 2}>
      <div data-scope={i}>
        <button data-focus={i + 1}>Scope {i}</button>
        {child}
      </div>
    </FocusScope>
  );
  return (
    <>
      {ctx.outside && <button data-focus="0">Outside</button>}
      {ctx.modes[0] > 0 && scope(0, ctx.modes[1] > 0 ? scope(1) : null)}
    </>
  );
}
async function render(ctx: Context) {
  await act(async () => ctx.root.render(<Example ctx={ctx} />));
  await tick(32);
}
const actions: Record<string, any> = {};
for (let i of [0, 1]) {
  for (let [name, mode] of [
    ['Plain', 1],
    ['Restore', 2],
    ['Contain', 3]
  ] as const) {
    actions[`Mount${name}${i}`] = {
      enabled: (ctx: Context) => ctx.modes[i] === 0 && (i === 0 || ctx.modes[0] > 0),
      async run(ctx: Context) {
        ctx.restore[i] = focused();
        ctx.modes[i] = mode;
        ctx.history.push(`Mount${name}${i}`);
        await render(ctx);
      }
    };
  }
  actions[`Unmount${i}`] = {
    enabled: (ctx: Context) => ctx.modes[i] > 0,
    async run(ctx: Context) {
      ctx.modes[i] = 0;
      if (i === 0) ctx.modes[1] = 0;
      ctx.history.push(`Unmount${i}`);
      await render(ctx);
    }
  };
}
for (let i of [0, 1, 2])
  actions[`Focus${i}`] = {
    enabled: (ctx: Context) => (i === 0 ? ctx.outside : ctx.modes[i - 1] > 0),
    async run(ctx: Context) {
      await act(async () => ctx.host.querySelector<HTMLElement>(`[data-focus="${i}"]`)!.focus());
      await tick(32);
      ctx.history.push(`Focus${i}`);
    }
  };
export default defineTarget<Context>({
  name: 'focus-scope',
  description: 'Nested FocusScope model with real DOM conformance, including Chromium.',
  sources: ['packages/react-aria/src/focus/FocusScope.tsx'],
  bounds: {depth: 4},
  model: {
    spec: 'FocusScope.tla',
    project: ({modes, focus, outside, nodes, detached}) => ({
      modes,
      focus,
      outside,
      nodes,
      detached
    })
  },
  async setup() {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame']
    });
    let host = document.createElement('div');
    document.body.append(host);
    let original = HTMLElement.prototype.focus;
    let ctx: Context = {
      root: createRoot(host),
      host,
      modes: [0, 0],
      restore: [-1, -1],
      outside: true,
      history: [],
      detached: false,
      restoreFocus: () => {
        HTMLElement.prototype.focus = original;
      }
    };
    HTMLElement.prototype.focus = function (options) {
      ctx.detached ||= !this.isConnected;
      original.call(this, options);
    };
    setInteractionModality('keyboard');
    await render(ctx);
    await act(async () => host.querySelector<HTMLElement>('button')!.focus());
    await tick(32);
    return ctx;
  },
  async teardown(ctx) {
    await cleanup(
      () => act(async () => ctx.root.unmount()),
      () => tick(32),
      () => ctx.restoreFocus(),
      () => ctx.host.remove(),
      () => vi.clearAllTimers(),
      () => vi.useRealTimers()
    );
  },
  actions: {
    ...actions,
    RemoveOutside: {
      enabled: ctx => ctx.outside,
      async run(ctx) {
        ctx.outside = false;
        ctx.history.push('RemoveOutside');
        await render(ctx);
      }
    }
  },
  observe(ctx) {
    return {
      modes: ctx.modes,
      restore: ctx.restore,
      focus: focused(),
      outside: ctx.outside,
      nodes: focusScopeTree.size - 1,
      detached: ctx.detached,
      history: ctx.history
    };
  },
  invariants: {
    FocusConnected: () => !!document.activeElement?.isConnected,
    RestoreConnected: ctx => !ctx.detached,
    NoDanglingNodes: ctx =>
      focusScopeTree.size - 1 === ctx.modes.filter(Boolean).length &&
      [...focusScopeTree.traverse()].every(node =>
        node.scopeRef?.current?.every(element => element.isConnected)
      ),
    Containment(ctx) {
      let f = focused();
      return (ctx.modes[1] !== 3 || f === 2) && (ctx.modes[0] !== 3 || f === 1 || f === 2);
    }
  }
});
