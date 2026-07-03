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
import {getOwnerDocument, getOwnerViewport, getOwnerWindow} from './domHelpers';
import {isIOS, isWebKit} from './platform';
import {isKeyboardOpen, isKeyboardVisible, supportsKeyboard, willOpenKeyboard} from './keyboard';

const intervalByWindow = new WeakMap<EventTarget, number | undefined>();
const timeoutByWindow = new WeakMap<EventTarget, number | undefined>();
const transitionCallbacks = new Set<QueuedCallback>();
const resizeCallbacks = new Set<QueuedCallback>();

interface QueuedCallback {
  (isKeyboardOpen: boolean): void;
}

function onTransitionStart(ticks = 0): void {
  let ownerWindow = getOwnerWindow();

  let wasOpen = isKeyboardOpen();
  let wasVisible = isKeyboardVisible();

  let transitionTimeout = timeoutByWindow.get(ownerWindow);
  let transitionInterval = intervalByWindow.get(ownerWindow);

  let transitionTimer = isIOS() && isWebKit() && wasOpen ? 600 : 300;

  if (transitionInterval != null || transitionTimeout != null) {
    return;
  }

  transitionInterval = ownerWindow.setInterval(() => {
    let isOpen = isKeyboardOpen();
    let isVisible = isKeyboardVisible();
    let isSupported = supportsKeyboard();

    let isUnsupported = ++ticks >= 3 && !isSupported && !isVisible;

    if (wasOpen !== isOpen || isUnsupported) {
      for (let callback of resizeCallbacks) {
        callback(isOpen);
        resizeCallbacks.delete(callback);
      }
    }

    if ((!isIOS() && wasVisible !== isVisible) || (wasVisible && !isVisible) || isUnsupported) {
      for (let callback of transitionCallbacks) {
        callback(isVisible);
        transitionCallbacks.delete(callback);
      }
    }

    if ((!transitionCallbacks.size && !resizeCallbacks.size) || isUnsupported) {
      onTransitionEnd();
    }
  }, 50);

  transitionTimeout = ownerWindow.setTimeout(() => {
    let isOpen = isKeyboardOpen();
    let isVisible = isKeyboardVisible();

    for (let callback of resizeCallbacks) {
      callback(isOpen);
      resizeCallbacks.delete(callback);
    }

    for (let callback of transitionCallbacks) {
      callback(isVisible);
      transitionCallbacks.delete(callback);
    }

    onTransitionEnd();
  }, transitionTimer);

  timeoutByWindow.set(ownerWindow, transitionTimeout);
  intervalByWindow.set(ownerWindow, transitionInterval);
}

function onTransitionEnd(): void {
  let ownerWindow = getOwnerWindow();

  let transitionTimeout = timeoutByWindow.get(ownerWindow);
  let transitionInterval = intervalByWindow.get(ownerWindow);

  ownerWindow.clearTimeout(transitionTimeout);
  ownerWindow.clearInterval(transitionInterval);

  timeoutByWindow.delete(ownerWindow);
  intervalByWindow.delete(ownerWindow);
}

/**
 * Delays a callback execution until a keyboard transition may no longer impact layout.
 * Guarantees an invocation if an expected transition did not finish within 300ms.
 */
export function runAfterKeyboard(fn: QueuedCallback): () => void {
  let ownerWindow = getOwnerWindow();
  let ownerDocument = getOwnerDocument();
  let ownerViewport = getOwnerViewport();

  // Flush synchronously when the viewport API is unsupported.
  if (ownerViewport == null) {
    return fn(false) ?? (() => {});
  }

  // Assert based on geometry rather than focus to support intermediate states, in which
  // document.activeElement can't be used to reliably infer the open state of the OSK.
  let wasKeyboardOpen = isKeyboardOpen();

  // Wait one frame to see if focus lands on an input.
  let frame = ownerWindow.requestAnimationFrame(() => {
    let activeElement = getActiveElement(ownerDocument);
    let willKeyboardOpen = ownerDocument.hasFocus() && willOpenKeyboard(activeElement);

    // If keyboard won't change, call the function immediately.
    if (wasKeyboardOpen === willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    // On close, fire immediately since consumers may assert the ICB.
    if (wasKeyboardOpen && !willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    resizeCallbacks.add(fn);
    onTransitionStart();
  });

  return () => {
    ownerWindow.cancelAnimationFrame(frame);
    resizeCallbacks.delete(fn);
  };
}

/**
 * Delays a callback execution until the on-screen keyboard has finished its transition.
 * Guarantees an invocation if an expected transition did not finish within 600ms.
 */
export function runAfterKeyboardTransition(fn: QueuedCallback): () => void {
  let ownerWindow = getOwnerWindow();
  let ownerDocument = getOwnerDocument();
  let ownerViewport = getOwnerViewport();

  // Flush synchronously when the viewport API is unsupported.
  if (ownerViewport == null) {
    return fn(false) ?? (() => {});
  }

  // Assert based on geometry rather than focus to support intermediate states, in which
  // document.activeElement can't be used to reliably infer the open state of the OSK.
  let wasKeyboardOpen = isKeyboardOpen();

  // Wait one frame to see if focus lands on an input.
  let frame = ownerWindow.requestAnimationFrame(() => {
    let activeElement = getActiveElement(ownerDocument);
    let willKeyboardOpen = ownerDocument.hasFocus() && willOpenKeyboard(activeElement);

    // If keyboard won't transition, fire immediately.
    if (wasKeyboardOpen === willKeyboardOpen) {
      return fn(willKeyboardOpen);
    }

    transitionCallbacks.add(fn);
    onTransitionStart();
  });

  return () => {
    ownerWindow.cancelAnimationFrame(frame);
    transitionCallbacks.delete(fn);
  };
}
