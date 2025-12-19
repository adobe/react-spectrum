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

import {hasDOM} from './domHelpers';

// We store a global list of elements that are currently transitioning,
// mapped to a set of CSS properties that are transitioning for that element.
// This is necessary rather than a simple count of transitions because of browser
// bugs, e.g. Chrome sometimes fires both transitionend and transitioncancel rather
// than one or the other. So we need to track what's actually transitioning so that
// we can ignore these duplicate events.
let transitionsByElement = new Map<EventTarget, Set<string>>();

// A list of callbacks to call once there are no transitioning elements.
let transitionCallbacks = new Set<() => void>();

function setupGlobalEvents() {
  if (!hasDOM()) {
    return;
  }

  function isTransitionEvent(event: Event): event is TransitionEvent {
    return 'propertyName' in event;
  }

  let onTransitionEnd = (e: Event) => {
    if (!isTransitionEvent(e) || !e.target) {
      return;
    }

    // Remove property from list of transitioning properties.
    let properties = transitionsByElement.get(e.target);
    if (!properties) {
      return;
    }

    properties.delete(e.propertyName);

    // If empty, remove transitioncancel event, and remove the element from the list of transitioning elements.
    if (properties.size === 0) {
      // In some environments EventTarget may not implement removeEventListener; guard anyway.
      if ('removeEventListener' in e.target) {
        (e.target as any).removeEventListener('transitioncancel', onTransitionEnd);
      }
      transitionsByElement.delete(e.target);
    }

    // If no transitioning elements, call all the queued callbacks.
    if (transitionsByElement.size === 0) {
      transitionCallbacks.forEach(cb => cb());
      transitionCallbacks.clear();
    }
  };

  let onTransitionStart = (e: Event) => {
    if (!isTransitionEvent(e) || !e.target) {
      return;
    }

    // Add the transitioning property to the list for this element.
    let transitions = transitionsByElement.get(e.target);
    if (!transitions) {
      transitions = new Set();
      transitionsByElement.set(e.target, transitions);

      // The transitioncancel event must be registered on the element itself, rather than as a global
      // event. This enables us to handle when the node is deleted from the document while it is transitioning.
      // In that case, the cancel event would have nowhere to bubble to so we need to handle it directly.
      if ('addEventListener' in e.target) {
        (e.target as any).addEventListener('transitioncancel', onTransitionEnd, {once: true});
      }
    }

    transitions.add(e.propertyName);
  };

  document.body.addEventListener('transitionrun', onTransitionStart);
  document.body.addEventListener('transitionend', onTransitionEnd);
}

// Only attach when DOM + body exist. If body isn't ready yet, wait for DOMContentLoaded.
if (typeof document !== 'undefined') {
  if (hasDOM() && document.readyState !== 'loading') {
    setupGlobalEvents();
  } else {
// If there's no DOM at all, this will never run; fine.
    document.addEventListener?.('DOMContentLoaded', setupGlobalEvents);
  }
}

/**
 * Cleans up any elements that are no longer in the document.
 * This is necessary because we can't rely on transitionend events to fire
 * for elements that are removed from the document while transitioning.
 */
function cleanupDetachedElements() {
  for (const [eventTarget] of transitionsByElement) {
    // Similar to `eventTarget instanceof Element && !eventTarget.isConnected`, but avoids
    // the explicit instanceof check, since it may be different in different contexts.
    if ('isConnected' in (eventTarget as any) && !(eventTarget as any).isConnected) {
      transitionsByElement.delete(eventTarget);
    }
  }
}

export function runAfterTransition(fn: () => void): void {
  if (!hasDOM()) {
    fn();
    return;
  }

  const raf =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;

  // Wait one frame to see if an animation starts, e.g. a transition on mount.
  raf(() => {
    cleanupDetachedElements();

    // If no transitions are running, call the function immediately.
    // Otherwise, add it to a list of callbacks to run at the end of the animation.
    if (transitionsByElement.size === 0) {
      fn();
    } else {
      transitionCallbacks.add(fn);
    }
  });
}
