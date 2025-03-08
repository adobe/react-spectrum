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
  if (typeof window === 'undefined') {
    return;
  }

  function isTransitionEvent(event: Event): event is TransitionEvent {
    return 'propertyName' in event;
  }

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
      e.target.addEventListener('transitioncancel', onTransitionEnd, {
        once: true
      });
    }

    transitions.add(e.propertyName);
  };

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
      e.target.removeEventListener('transitioncancel', onTransitionEnd);
      transitionsByElement.delete(e.target);
    }

    // If no transitioning elements, call all of the queued callbacks.
    if (transitionsByElement.size === 0) {
      for (let cb of transitionCallbacks) {
        cb();
      }

      transitionCallbacks.clear();
    }
  };

  document.body.addEventListener('transitionrun', onTransitionStart);
  document.body.addEventListener('transitionend', onTransitionEnd);
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    setupGlobalEvents();
  } else {
    document.addEventListener('DOMContentLoaded', setupGlobalEvents);
  }
}

export function runAfterTransition(fn: () => void): void {
  // Wait one frame to see if an animation starts, e.g. a transition on mount.
  requestAnimationFrame(() => {
    // If no transitions are running, call the function immediately.
    // Otherwise, add it to a list of callbacks to run at the end of the animation.
    if (transitionsByElement.size === 0) {
      fn();
    } else {
      transitionCallbacks.add(fn);
    }
  });
}
