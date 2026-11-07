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

import {ariaHideOutside} from '../../packages/react-aria/src/overlays/ariaHideOutside';
import {cleanup} from '../runtime.mjs';
import {createRoot, Root} from 'react-dom/client';
import {defineTarget} from '../explorer.mjs';
import {probe} from '../helpers';
import React, {act, useEffect, useRef} from 'react';
import {useOverlay} from '../../packages/react-aria/src/overlays/useOverlay';
import {usePreventScroll} from '../../packages/react-aria/src/overlays/usePreventScroll';

interface Context {
  root: Root;
  host: HTMLElement;
  mounted: boolean[];
  open: boolean[];
  order: number[];
  nested: boolean;
  escapeSafe: boolean;
  calls: number[];
  style: string;
  nodes: Set<Element>;
}
function Overlay({ctx, id, children}: {ctx: Context; id: number; children?: React.ReactNode}) {
  let ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ctx.nodes.add(ref.current!);
  }, [ctx]);
  let {overlayProps} = useOverlay({isOpen: ctx.open[id], onClose: () => ctx.calls.push(id)}, ref);
  usePreventScroll({isDisabled: !ctx.open[id]});
  let open = ctx.open[id];
  useEffect(
    () => (open ? ariaHideOutside([ref.current!], {shouldUseInert: true}) : undefined),
    [open]
  );
  return (
    <div {...overlayProps} ref={ref} id={`overlay-${id}`} tabIndex={-1}>
      {children}
    </div>
  );
}
async function render(ctx: Context) {
  let child = ctx.mounted[1] ? <Overlay ctx={ctx} id={1} /> : null;
  await act(async () =>
    ctx.root.render(
      <>
        <button id="outside">Outside</button>
        {ctx.mounted[0] && (
          <Overlay ctx={ctx} id={0}>
            {ctx.nested && child}
          </Overlay>
        )}
        {!ctx.nested && child}
      </>
    )
  );
}
const actions = Object.fromEntries(
  [0, 1].flatMap(i =>
    ['Open', 'Close', 'Unmount'].map(kind => [
      `${kind}${i}`,
      {
        enabled: (ctx: Context) =>
          ctx.mounted[i] &&
          (kind === 'Open' ? !ctx.open[i] : kind === 'Close' ? ctx.open[i] : true),
        async run(ctx: Context) {
          if (kind === 'Open') {
            ctx.open[i] = true;
            ctx.order.push(i);
          } else {
            ctx.open[i] = false;
            ctx.order = ctx.order.filter(n => n !== i);
            if (kind === 'Unmount') {
              ctx.mounted[i] = false;
              if (i === 0 && ctx.nested) {
                ctx.mounted[1] = false;
                ctx.open[1] = false;
                ctx.order = [];
              }
            }
          }
          await render(ctx);
        }
      }
    ])
  )
);
function counts() {
  return {
    overlays: probe('/overlays/useOverlay.ts').read(),
    hiddenObservers: probe('/overlays/ariaHideOutside.ts').read(),
    scroll: probe('/overlays/usePreventScroll.ts').read()
  };
}
export default defineTarget<Context>({
  name: 'overlays',
  description:
    'Two real overlays: arbitrary close/unmount order, nested or siblings, hiding and scroll locks.',
  sources: [
    'packages/react-aria/src/overlays/useOverlay.ts',
    'packages/react-aria/src/overlays/ariaHideOutside.ts',
    'packages/react-aria/src/overlays/usePreventScroll.ts'
  ],
  bounds: {depth: 6},
  async setup() {
    let host = document.createElement('div');
    document.body.append(host);
    let ctx: Context = {
      host,
      root: createRoot(host),
      mounted: [true, true],
      open: [false, false],
      order: [],
      nested: false,
      escapeSafe: true,
      calls: [],
      nodes: new Set([host]),
      style: document.documentElement.style.cssText
    };
    await render(ctx);
    return ctx;
  },
  async teardown(ctx) {
    await cleanup(
      () => act(async () => ctx.root.unmount()),
      () => ctx.host.remove()
    );
  },
  actions: {
    ...actions,
    Nested: {
      enabled: ctx => !ctx.nested && ctx.mounted.every(Boolean) && !ctx.open.some(Boolean),
      async run(ctx) {
        ctx.nested = true;
        await render(ctx);
      }
    },
    Escape: {
      enabled: ctx => ctx.order.length > 0,
      async run(ctx) {
        ctx.calls = [];
        let top = ctx.order[ctx.order.length - 1];
        await act(async () =>
          document
            .getElementById(`overlay-${top}`)!
            .dispatchEvent(
              new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
            )
        );
        ctx.escapeSafe &&= ctx.calls.length === 1 && ctx.calls[0] === top;
      }
    }
  },
  observe(ctx) {
    return {
      mounted: ctx.mounted,
      open: ctx.open,
      order: ctx.order,
      nested: ctx.nested,
      escapeSafe: ctx.escapeSafe,
      calls: ctx.calls,
      ...counts(),
      hiddenCounts: [...ctx.nodes].map(node => probe('/overlays/ariaHideOutside.ts').count(node)),
      style: document.documentElement.style.cssText,
      hidden: [...document.querySelectorAll('[aria-hidden="true"], [inert]')]
        .map(e => e.id || e.tagName)
        .sort()
    };
  },
  invariants: {
    OnlyTopHandlesEscape: ctx => ctx.escapeSafe,
    CountsMatch(ctx) {
      let c = counts();
      return (
        c.overlays.length === ctx.order.length &&
        c.hiddenObservers === ctx.order.length &&
        c.scroll === ctx.order.length
      );
    },
    ClosedRestoresDocument: ctx =>
      ctx.order.length > 0 ||
      (!ctx.host.querySelector('[aria-hidden="true"], [inert]') &&
        !ctx.host.hasAttribute('aria-hidden') &&
        !ctx.host.inert &&
        [...ctx.nodes].every(
          node =>
            probe('/overlays/ariaHideOutside.ts').count(node) === 0 &&
            !(node as HTMLElement).inert &&
            node.getAttribute('aria-hidden') !== 'true'
        ) &&
        document.documentElement.style.cssText === ctx.style)
  }
});
