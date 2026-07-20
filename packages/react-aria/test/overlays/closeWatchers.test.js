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

import {subscribeCloseWatcher} from '../../src/overlays/closeWatchers';
import {visibleOverlays} from '../../src/overlays/useOverlay';

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
