/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may obtain a copy at http://www.apache.org/licenses/LICENSE-2.0
 */

import {click, Example, LoggedEvent, pointer, timeout} from './usePress.verification.utils';
import {commands} from 'vitest/browser';
import {expect, it, vi} from 'vitest';
import React from 'react';
import {render} from 'vitest-browser-react';

declare const __VERIFICATION_TRACE__: {
  property: string;
  actions: Array<{type: string}>;
};

declare module 'vitest/browser' {
  interface BrowserCommands {
    writePressReplay: (result: object) => Promise<void>;
  }
}

it('counterexample replay', async () => {
  let trace = __VERIFICATION_TRACE__;
  let events: LoggedEvent[] = [];
  let observations: object[] = [];
  let violation: {property: string; step: number} | null = null;
  let limitation: string | null = null;
  let mounted = true;
  let canceled = false;
  let view = await render(<Example events={events} />);
  let target = view.container.querySelector('[role=button]')!;
  let active: Array<{type: string; listener: unknown; capture: boolean}> = [];
  let addNative = document.addEventListener.bind(document);
  let removeNative = document.removeEventListener.bind(document);
  let capture = (options?: boolean | AddEventListenerOptions | EventListenerOptions) =>
    typeof options === 'boolean' ? options : !!options?.capture;
  let add = vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
    if (
      ['pointerup', 'pointercancel', 'click'].includes(type) &&
      !active.some(
        item =>
          item.type === type && item.listener === listener && item.capture === capture(options)
      )
    )
      active.push({type, listener, capture: capture(options)});
    addNative(type, listener, options);
  });
  let remove = vi
    .spyOn(document, 'removeEventListener')
    .mockImplementation((type, listener, options) => {
      active = active.filter(
        item =>
          item.type !== type || item.listener !== listener || item.capture !== capture(options)
      );
      removeNative(type, listener, options);
    });
  vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
  let baselineTimers = vi.getTimerCount();
  let pressed = () => mounted && target.getAttribute('data-pressed') === 'true';
  try {
    for (let [index, action] of trace.actions.entries()) {
      let beforePressed = pressed();
      if (
        action.type === 'PointerCancel' ||
        (['Disable', 'Unmount'].includes(action.type) && beforePressed)
      )
        canceled = true;
      switch (action.type) {
        case 'PointerDown':
          await pointer(target, 'pointerdown');
          break;
        case 'PointerUp':
          await pointer(mounted ? target : document.body, 'pointerup');
          break;
        case 'PointerCancel':
          await pointer(mounted ? target : document.body, 'pointercancel');
          break;
        case 'OtherPointerDown':
          await pointer(document.body, 'pointerdown', 2);
          break;
        case 'OtherPointerCancel':
          await pointer(document.body, 'pointercancel', 2);
          break;
        case 'NativeClick':
          await click(target);
          break;
        case 'OtherClick':
        case 'Fallback':
          if (vi.getTimerCount() <= baselineTimers)
            throw new Error(`Unsupported replay: ${action.type} requires a pending fallback.`);
          if (action.type === 'OtherClick') await click(document.body);
          else await timeout();
          break;
        case 'Disable':
          await view.rerender(<Example events={events} isDisabled />);
          break;
        case 'Enable':
          await view.rerender(<Example events={events} />);
          break;
        case 'Unmount':
          await view.unmount();
          mounted = false;
          break;
        default:
          throw new Error(`Unsupported replay action: ${action.type}`);
      }
      let starts = events.filter(event => event.type === 'pressstart').length;
      let ends = events.filter(event => event.type === 'pressend').length;
      let presses = events.filter(event => event.type === 'press').length;
      let timers = vi.getTimerCount() - baselineTimers;
      observations.push({
        step: index + 1,
        action: action.type,
        mounted,
        pressed: pressed(),
        events: [...events],
        timers,
        listeners: active.map(item => ({type: item.type, capture: item.capture}))
      });
      let holds: Record<string, boolean> = {
        PointerOwnership: action.type !== 'OtherPointerCancel' || !beforePressed || pressed(),
        ActivationUnique: presses <= 1,
        CancellationSafe: !canceled || presses === 0,
        LifecycleBalanced: ends <= starts && (!mounted || starts - ends === Number(pressed())),
        CleanupComplete: (!canceled && mounted) || (timers === 0 && active.length === 0)
      };
      if (!holds[trace.property]) {
        violation = {property: trace.property, step: index + 1};
        break;
      }
    }
  } catch (error) {
    limitation = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    try {
      await commands.writePressReplay({
        schemaVersion: 1,
        property: trace.property,
        inputMode: 'synthetic',
        observations,
        violation,
        limitation
      });
    } finally {
      if (mounted) await view.unmount();
      add.mockRestore();
      remove.mockRestore();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  }
  expect(violation, `verification:replay:${trace.property}`).toBeNull();
});
