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

// CloseWatcher is not yet in the TypeScript DOM lib (TS 5.8.2)
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

// CloseWatchers are an interesting API for web development. You may not be familiar with them
// https://developer.mozilla.org/en-US/docs/Web/API/CloseWatcher
// https://html.spec.whatwg.org/multipage/interaction.html#close-requests-and-close-watchers
// The quick synopsis is that they are EventTargets which emit cancel->close events and also
// call an `onclose` property. CloseWatchers will disconnect and be destroyed after they close.
// They are in a browser managed stack in terms of which one gets called for a given event.
// This stack isn't straightforward though, it contains "groupings", and one gesture/event may
// trigger multiple close watchers to fire synchronously.

// We create a singleton which manages subscriptions from overlays that want to use CloseWatchers.
// It creates/destroys CloseWatchers as needed to match the number of subscribers.
// When a CloseWatcher fires, we determine which subscriber/overlay is the top-most and call its onClose.
// There is a weird edge case that we handle for controlled overlay triggers. If an overlay is
// controlled open and tries to close, but the parent ignores the onOpenChange, then the
// CloseWatcher will have been destroyed, but the total number of subscribers has not changed.
// In this case, we need to reconcile that difference and create a new CloseWatcher.

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
// overlays. Cleared in the next microtask.
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
// There may be a troublesome case here, creating them this way means they won't be
// "trusted" and may be "grouped" with other watchers and cause too many
// overlays to close at once. I'm unsure how to test this... but the spec seems to
// suggest this could happen.
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

// Question about this, should all overlays close synchronously? Or should it be one at a time?
// When CloseWatchers are "grouped", they will all fire synchronously, but our current hooks
// may not like that. Either overlays have closed one at a time, or the parent has closed and unmounted
// all of them. I'm not sure if there is a race to worry about if they all try to close individually.
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

  // Only the top-most one closes.
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
