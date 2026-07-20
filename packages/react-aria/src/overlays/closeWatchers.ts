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

import {RefObject} from '@react-types/shared';
import {visibleOverlays} from './useOverlay';

// CloseWatcher is not yet in the TypeScript DOM lib (TS 5.8.2), so declare
// the minimal surface we rely on.
interface CloseWatcher {
  destroy(): void;
  onclose: (() => void) | null;
}
interface CloseWatcherConstructor {
  new (): CloseWatcher;
}
declare global {
  interface Window {
    CloseWatcher?: CloseWatcherConstructor;
  }
}

export interface CloseWatcherSubscriber {
  /** The overlay container ref, used to determine z-order via visibleOverlays. */
  ref: RefObject<Element | null>;
  /** Called when this overlay should close because it is the top-most. */
  onClose: () => void;
}

const subscribers = new Set<CloseWatcherSubscriber>();
const watchers: CloseWatcher[] = [];

// Refs asked to close during the current (synchronous) close request. Excluded
// from the top-most calculation so grouped synchronous fires close distinct
// overlays. Cleared on the next microtask.
const pendingClose = new Set<RefObject<Element | null>>();
let pendingClear = false;

function hasCloseWatcher(): boolean {
  return typeof window !== 'undefined' && typeof window.CloseWatcher === 'function';
}

function createWatcher(): void {
  let watcher = new window.CloseWatcher!();
  watcher.onclose = () => {
    let i = watchers.indexOf(watcher);
    if (i >= 0) {
      watchers.splice(i, 1);
    }
    try {
      notify();
    } finally {
      reconcile();
    }
  };
  watchers.push(watcher);
}

// Invariant: watchers.length === subscribers.size.
function reconcile(): void {
  if (!hasCloseWatcher()) {
    return;
  }
  while (watchers.length < subscribers.size) {
    createWatcher();
  }
  while (watchers.length > subscribers.size) {
    watchers.pop()!.destroy();
  }
}

function notify(): void {
  // Snapshot at the start so mutations (closing removes from visibleOverlays)
  // and synchronous unsubscribes do not shift the top-most check mid-pass.
  let overlays = visibleOverlays.filter(o => !pendingClose.has(o));
  let topMost = overlays[overlays.length - 1];
  if (!topMost) {
    return;
  }

  pendingClose.add(topMost);
  if (!pendingClear) {
    pendingClear = true;
    queueMicrotask(() => {
      pendingClose.clear();
      pendingClear = false;
    });
  }

  // Tell all subscribers; only the top-most one closes.
  for (let subscriber of [...subscribers]) {
    if (subscriber.ref === topMost) {
      subscriber.onClose();
    }
  }
}

export function subscribeCloseWatcher(subscriber: CloseWatcherSubscriber): () => void {
  if (!hasCloseWatcher()) {
    return () => {};
  }
  subscribers.add(subscriber);
  reconcile();
  return () => {
    subscribers.delete(subscriber);
    reconcile();
  };
}
