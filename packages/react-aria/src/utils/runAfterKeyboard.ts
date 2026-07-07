/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getActiveElement} from './shadowdom/DOMFunctions';
import {isKeyboardOpen, supportsKeyboard, willOpenKeyboard} from './keyboard';
import {isWebKit} from './platform';

const WEBKIT_OPEN_DELAY = 200;
const TRANSITION_FRAMETIME = 50;
const TRANSITION_TIMEOUT = 600;

const listenersByWindow = new WeakMap<EventTarget, number | undefined>();
const transitionCallbacks = new Set<QueuedCallback>();
const resizeCallbacks = new Set<QueuedCallback>();

interface QueuedCallback {
  (isKeyboardOpen: boolean): void;
}

function onTransitionFrame(wasOpenKeyboard: boolean, signal: AbortSignal): void {
  let isOpenKeyboard = isKeyboardOpen();

  // Flush resize callbacks when the keyboard has affected layout or we ran out of time.
  if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) {
    for (let callback of resizeCallbacks) {
      callback(isOpenKeyboard);
      resizeCallbacks.delete(callback);
    }
  }

  // WebKit only fires a single resize event at the start of an opening transition.
  // The animation takes ~200ms, so restart the listener and flush when it runs out of time.
  if (!wasOpenKeyboard && isOpenKeyboard && isWebKit() && !signal.aborted) {
    window.clearInterval(listenersByWindow.get(window));
    listenersByWindow.set(window, setupGlobalListeners(WEBKIT_OPEN_DELAY));
    return;
  }

  // Flush transition callbacks when the animation has completed or we ran out of time.
  if (wasOpenKeyboard !== isOpenKeyboard || signal.aborted) {
    for (let callback of transitionCallbacks) {
      callback(isOpenKeyboard);
      transitionCallbacks.delete(callback);
    }
  }

  // Cancel the observer when no pending updates remain or we ran out of time.
  if (resizeCallbacks.size + transitionCallbacks.size <= 0 || signal.aborted) {
    window.clearInterval(listenersByWindow.get(window));
    listenersByWindow.delete(window);
  }
}

function setupGlobalListeners(timeout = TRANSITION_TIMEOUT): number {
  return window.setInterval(
    onTransitionFrame,
    TRANSITION_FRAMETIME,
    isKeyboardOpen(),
    AbortSignal.timeout(timeout)
  );
}

/**
 * Delays a callback execution until a keyboard transition may no longer impact layout.
 * Guarantees an invocation if an expected transition did not finish within 300ms.
 */
export function runAfterKeyboard(fn: QueuedCallback): () => void {
  // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
  // or devices which did not open their OSK within our opening timeout.
  if (!supportsKeyboard()) {
    return (fn(false), () => {});
  }

  // Wait one frame to see if focus lands on an input.
  let frame = window.requestAnimationFrame(() => {
    let activeElement = document.hasFocus() ? getActiveElement() : null;
    let willKeyboardOpen = willOpenKeyboard(activeElement);

    // If keyboard won't change, call the function immediately.
    if (isKeyboardOpen() === willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    // On close, fire immediately since consumers may assert the ICB.
    if (isKeyboardOpen() && !willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    resizeCallbacks.add(fn);

    if (!listenersByWindow.has(window)) {
      listenersByWindow.set(window, setupGlobalListeners());
    }
  });

  return () => {
    window.cancelAnimationFrame(frame);
    resizeCallbacks.delete(fn);
  };
}

/**
 * Delays a callback execution until the on-screen keyboard has finished its transition.
 * Guarantees an invocation if an expected transition did not finish within 600ms.
 */
export function runAfterKeyboardTransition(fn: QueuedCallback): () => void {
  // Flush synchronously when keyboard is unsupported. This is default for non-touch devices
  // or devices which did not open their OSK within our opening timeout.
  if (!supportsKeyboard()) {
    return (fn(false), () => {});
  }

  // Wait one frame to see if focus lands on an input.
  let frame = window.requestAnimationFrame(() => {
    let activeElement = document.hasFocus() ? getActiveElement() : null;
    let willKeyboardOpen = willOpenKeyboard(activeElement);

    // If keyboard won't transition, fire immediately.
    if (isKeyboardOpen() === willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    transitionCallbacks.add(fn);

    if (!listenersByWindow.has(window)) {
      listenersByWindow.set(window, setupGlobalListeners());
    }
  });

  return () => {
    window.cancelAnimationFrame(frame);
    transitionCallbacks.delete(fn);
  };
}
