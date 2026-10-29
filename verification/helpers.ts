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
import {vi} from 'vitest';

export function probe(name: string): any {
  let value = (globalThis as any).__verification?.[name];
  if (!value) throw new Error(`Missing verification probe: ${name}`);
  return value;
}

export async function tick(ms = 0) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

// Include timer deadlines in observations, not only counts: different remaining
// delays can lead to different successors even with identical rendered state.
export function trackTimers() {
  let set = globalThis.setTimeout;
  let clear = globalThis.clearTimeout;
  let due = new Map<unknown, number>();
  globalThis.setTimeout = ((callback, delay = 0, ...args) => {
    let id = set(() => {
      due.delete(id);
      callback(...args);
    }, delay);
    due.set(id, Date.now() + delay);
    return id;
  }) as typeof setTimeout;
  globalThis.clearTimeout = (id => {
    due.delete(id);
    clear(id);
  }) as typeof clearTimeout;
  return {
    pending: () => [...due.values()].map(time => time - Date.now()).sort((a, b) => a - b),
    restore() {
      globalThis.setTimeout = set;
      globalThis.clearTimeout = clear;
    }
  };
}

export function trackListeners() {
  let listeners: {owner: EventTarget; type: string; listener: unknown; capture: boolean}[] = [];
  let restores: (() => void)[] = [];
  for (let owner of [document, window]) {
    let add = owner.addEventListener;
    let remove = owner.removeEventListener;
    let capture = options => (typeof options === 'boolean' ? options : !!options?.capture);
    owner.addEventListener = function (type, listener, options) {
      if (
        !listeners.some(
          x =>
            x.owner === owner &&
            x.type === type &&
            x.listener === listener &&
            x.capture === capture(options)
        )
      ) {
        listeners.push({owner, type, listener, capture: capture(options)});
      }
      return add.call(this, type, listener, options);
    };
    owner.removeEventListener = function (type, listener, options) {
      listeners = listeners.filter(
        x =>
          !(
            x.owner === owner &&
            x.type === type &&
            x.listener === listener &&
            x.capture === capture(options)
          )
      );
      return remove.call(this, type, listener, options);
    };
    restores.push(() => {
      owner.addEventListener = add;
      owner.removeEventListener = remove;
    });
  }
  return {
    read: () =>
      listeners
        .map(x => `${x.owner === window ? 'window' : 'document'}:${x.type}:${x.capture}`)
        .sort(),
    restore() {
      for (let x of listeners)
        x.owner.removeEventListener(x.type, x.listener as EventListener, x.capture);
      for (let restore of restores) restore();
    }
  };
}
