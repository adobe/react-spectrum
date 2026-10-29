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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {click, Example, LoggedEvent, pointer, timeout} from './usePress.verification.utils';
import {commands, server} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';

declare module 'vitest/browser' {
  interface BrowserCommands {
    cancelUnrelatedTouch: () => Promise<string | null>;
  }
}

beforeEach(() => {
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('usePress verification', () => {
  it.runIf(server.browser === 'chromium')(
    'pointer ownership: trusted mouse press survives cancellation of an unrelated touch',
    async () => {
      let events: LoggedEvent[] = [];
      let raw: Array<{type: string; id: number; pointerType: string; trusted: boolean}> = [];
      let record = (event: PointerEvent) =>
        raw.push({
          type: event.type,
          id: event.pointerId,
          pointerType: event.pointerType,
          trusted: event.isTrusted
        });
      await render(
        <div data-verification-root>
          <Example events={events} />
          <div data-other-pointer style={{height: 50, marginTop: 20}}>
            Other surface
          </div>
        </div>
      );
      document.addEventListener('pointerdown', record, true);
      document.addEventListener('pointercancel', record, true);
      try {
        let pressedAfterCancel = await commands.cancelUnrelatedTouch();
        expect(raw.map(event => event.type)).toEqual([
          'pointerdown',
          'pointerdown',
          'pointercancel'
        ]);
        expect(raw.every(event => event.trusted)).toBe(true);
        expect(raw[0].id).not.toBe(raw[2].id);
        expect.soft(pressedAfterCancel, JSON.stringify(raw)).toBe('true');
        expect(events.map(event => event.type)).toEqual(['pressstart', 'pressend', 'press']);
      } finally {
        document.removeEventListener('pointerdown', record, true);
        document.removeEventListener('pointercancel', record, true);
      }
    }
  );

  it('pointer ownership: canceling an unrelated pointer preserves the active press', async () => {
    let events: LoggedEvent[] = [];
    let view = await render(<Example events={events} />);
    let target = view.container.querySelector('[role=button]')!;
    await pointer(target, 'pointerdown');
    await pointer(document.body, 'pointerdown', 2);
    await pointer(document.body, 'pointercancel', 2);
    expect.soft(target.getAttribute('data-pressed')).toBe('true');
    await pointer(target, 'pointerup');
    await click(target);
    expect(events.map(event => event.type)).toEqual(['pressstart', 'pressend', 'press']);
  });

  it('lifecycle balance: ending an activation emits one end for one start', async () => {
    let events: LoggedEvent[] = [];
    let view = await render(<Example events={events} />);
    let target = view.container.querySelector('[role=button]')!;
    await pointer(target, 'pointerdown');
    await pointer(target, 'pointerup');
    await click(target);
    expect(events.filter(event => event.type === 'pressstart')).toHaveLength(1);
    expect(
      events.filter(event => event.type === 'pressend'),
      'verification:LifecycleBalanced:ends'
    ).toHaveLength(1);
  });

  it.each(['disable', 'unmount'])(
    'resource cleanup: %s removes pending timers and document listeners',
    async action => {
      let events: LoggedEvent[] = [];
      let view = await render(<Example events={events} />);
      let target = view.container.querySelector('[role=button]')!;
      // Spies call the native methods; they only record resource acquisition/release.
      let add = vi.spyOn(document, 'addEventListener');
      let remove = vi.spyOn(document, 'removeEventListener');
      let baselineTimers = vi.getTimerCount();
      try {
        await pointer(target, 'pointerdown');
        await pointer(target, 'pointerup');
        expect(vi.getTimerCount()).toBeGreaterThan(baselineTimers);
        if (action === 'disable') {
          await view.rerender(<Example events={events} isDisabled />);
        } else {
          await view.unmount();
        }
        expect(vi.getTimerCount(), 'verification:CleanupComplete:timers').toBe(baselineTimers);
        let listeners = add.mock.calls.filter(([type]) =>
          ['pointerup', 'pointercancel', 'click'].includes(type)
        );
        expect(listeners).toHaveLength(3);
        for (let listener of listeners) {
          expect(remove.mock.calls).toContainEqual(listener);
        }
      } finally {
        add.mockRestore();
        remove.mockRestore();
      }
    }
  );

  it.each(['native-first', 'fallback-first'])(
    'activation uniqueness: %s fires once',
    async order => {
      let events: LoggedEvent[] = [];
      let view = await render(<Example events={events} />);
      let target = view.container.querySelector('[role=button]')!;
      await pointer(target, 'pointerdown');
      await pointer(target, 'pointerup');
      if (order === 'native-first') {
        await click(target);
        await timeout();
      } else {
        await timeout();
        await click(target);
      }
      expect(
        events.map(event => event.type),
        'verification:ActivationUnique:callbacks'
      ).toEqual(['pressstart', 'pressend', 'press']);
      expect(target.getAttribute('data-pressed')).toBe('false');
    }
  );

  it.each(['pointercancel', 'disable', 'unmount'])(
    'cancellation safety: %s prevents later activation',
    async action => {
      let events: LoggedEvent[] = [];
      let view = await render(<Example events={events} />);
      let target = view.container.querySelector('[role=button]')!;
      await pointer(target, 'pointerdown');
      if (action !== 'pointercancel') {
        await pointer(target, 'pointerup');
      }
      if (action === 'pointercancel') {
        await pointer(target, 'pointercancel');
      } else if (action === 'disable') {
        await view.rerender(<Example events={events} isDisabled />);
      } else {
        await view.unmount();
      }
      let afterCancel = [...events];
      await timeout();
      expect(events).toEqual(afterCancel);
      expect(
        events.filter(event => event.type === 'press'),
        'verification:CancellationSafe:activation'
      ).toHaveLength(0);
      if (action !== 'unmount') {
        expect(target.getAttribute('data-pressed')).toBe('false');
        expect(events.map(event => event.type)).toEqual(['pressstart', 'pressend']);
      }
    }
  );
});
