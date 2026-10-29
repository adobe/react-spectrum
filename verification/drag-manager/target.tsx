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

import {beginDragging, registerDropTarget} from '../../packages/react-aria/src/dnd/DragManager';
import {cleanup} from '../runtime.mjs';
import {defineTarget} from '../explorer.mjs';
import {probe, tick, trackListeners} from '../helpers';
import {setInteractionModality} from '../../packages/react-aria/src/interactions/useFocusVisible';
import {vi} from 'vitest';

interface Context {
  host: HTMLElement;
  source: HTMLElement;
  targets: HTMLElement[];
  unregister: (() => void)[];
  registered: boolean[];
  mounted: boolean;
  begun: boolean;
  duplicateSafe: boolean;
  drops: number;
  ends: number;
  listeners: ReturnType<typeof trackListeners>;
}
const internals = () => probe('/dnd/DragManager.ts').read();
const session = () => internals().session;
export default defineTarget<Context>({
  name: 'drag-manager',
  description:
    'DragManager session model, checked against the real manager with two registered targets.',
  sources: ['packages/react-aria/src/dnd/DragManager.ts'],
  bounds: {depth: 6},
  model: {
    spec: 'DragManager.tla',
    project: ({
      duplicateSafe,
      mounted,
      begun,
      registered,
      active,
      current,
      drops,
      ends,
      listeners,
      hidden
    }) => ({
      duplicateSafe,
      mounted,
      begun,
      registered,
      active,
      current,
      drops,
      ends,
      listeners: listeners.length > 0,
      hidden
    })
  },
  async setup() {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame']
    });
    let host = document.createElement('div');
    host.innerHTML =
      '<button>Source</button><button>Target A</button><button>Target B</button><div data-outside>Outside</div>';
    document.body.append(host);
    let [source, ...targets] = [...host.querySelectorAll('button')];
    source.focus();
    setInteractionModality('virtual');
    await tick(32);
    let ctx: Context = {
      host,
      source,
      targets,
      unregister: [],
      registered: [true, true],
      mounted: true,
      begun: false,
      duplicateSafe: true,
      drops: 0,
      ends: 0,
      listeners: trackListeners()
    };
    ctx.unregister = targets.map(element =>
      registerDropTarget({element, getDropOperation: () => 'move', onDrop: () => ctx.drops++})
    );
    return ctx;
  },
  async teardown(ctx) {
    await cleanup(
      () => {
        session()?.cancel();
      },
      ...ctx.unregister,
      () => ctx.listeners.restore(),
      () => ctx.host.remove(),
      () => vi.clearAllTimers(),
      () => vi.useRealTimers()
    );
  },
  actions: {
    Begin: {
      enabled: ctx => ctx.mounted && !ctx.begun,
      async run(ctx) {
        beginDragging(
          {
            element: ctx.source,
            items: [{'text/plain': 'item'}],
            allowedDropOperations: ['move'],
            onDragEnd: () => ctx.ends++
          },
          {format: key => key} as any
        );
        ctx.begun = true;
        await tick(32);
      }
    },
    BeginWhileDragging: {
      enabled: () => !!session(),
      run(ctx) {
        let before = session();
        let rejected = false;
        try {
          beginDragging(
            {
              element: ctx.source,
              items: [{'text/plain': 'other'}],
              allowedDropOperations: ['move']
            },
            {format: key => key} as any
          );
        } catch (error) {
          if (
            !(error instanceof Error) ||
            error.message !== 'Cannot begin dragging while already dragging'
          )
            throw error;
          rejected = true;
        }
        ctx.duplicateSafe &&= rejected && session() === before;
      }
    },
    ...Object.fromEntries(
      [0, 1].flatMap(i => [
        [
          `Enter${i}`,
          {
            enabled: (ctx: Context) => !!session() && ctx.registered[i],
            run(ctx: Context) {
              session().setCurrentDropTarget(internals().targets.get(ctx.targets[i]));
            }
          }
        ],
        [
          `Unregister${i}`,
          {
            enabled: (ctx: Context) => ctx.registered[i],
            run(ctx: Context) {
              ctx.unregister[i]();
              ctx.registered[i] = false;
            }
          }
        ]
      ])
    ),
    Leave: {
      enabled: () => !!session()?.currentDropTarget,
      run() {
        session().setCurrentDropTarget(null);
      }
    },
    Drop: {
      enabled: () => !!session(),
      run() {
        session().drop();
      }
    },
    Cancel: {
      enabled: () => !!session(),
      run() {
        session().cancel();
      }
    },
    Unmount: {
      enabled: ctx => ctx.mounted,
      async run(ctx) {
        ctx.source.remove();
        ctx.mounted = false;
        await tick(32);
      }
    }
  },
  observe(ctx) {
    return {
      duplicateSafe: ctx.duplicateSafe,
      mounted: ctx.mounted,
      begun: ctx.begun,
      registered: ctx.registered,
      active: !!session(),
      current: session()?.currentDropTarget
        ? ctx.targets.indexOf(session().currentDropTarget.element) + 1
        : 0,
      valid: session()?.validDropTargets.map(t => ctx.targets.indexOf(t.element)) ?? [],
      drops: ctx.drops,
      ends: ctx.ends,
      listeners: ctx.listeners.read(),
      hidden: !!ctx.host.querySelector('[data-outside]')?.closest('[aria-hidden="true"], [inert]')
    };
  },
  invariants: {
    AtMostOneSession: ctx =>
      ctx.duplicateSafe && ctx.ends <= Number(ctx.begun) && !(session() && ctx.ends > 0),
    SessionCleanup: ctx =>
      !!session() ||
      (ctx.listeners.read().length === 0 &&
        !ctx.host.querySelector('[aria-hidden="true"], [inert]') &&
        !ctx.host.inert),
    DropAtMostOnce: ctx => ctx.drops <= 1,
    NoStaleTarget: ctx =>
      !session()?.currentDropTarget ||
      (session().currentDropTarget.element.isConnected &&
        ctx.registered[ctx.targets.indexOf(session().currentDropTarget.element)]),
    UnmountEndsSession: ctx => ctx.mounted || !session()
  }
});
