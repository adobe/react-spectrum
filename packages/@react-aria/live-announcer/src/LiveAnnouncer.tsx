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

type Assertiveness = 'assertive' | 'polite';

/* Inspired by https://github.com/AlmeroSteyn/react-aria-live */
const LIVEREGION_TIMEOUT_DELAY = 7000;

/**
 * Announces the message using screen reader technology.
 */
export function announce(
  message: string,
  assertiveness: Assertiveness = 'assertive',
  timeout = LIVEREGION_TIMEOUT_DELAY,
  mode: 'message' | 'ids' = 'message'
) {
  if (!liveAnnouncer) {
    liveAnnouncer = new LiveAnnouncer();
  }

  liveAnnouncer.announce(message, assertiveness, timeout, mode);
}

/**
 * Stops all queued announcements.
 */
export function clearAnnouncer(assertiveness: Assertiveness) {
  if (liveAnnouncer) {
    liveAnnouncer.clear(assertiveness);
  }
}

/**
 * Removes the announcer from the DOM.
 */
export function destroyAnnouncer() {
  if (liveAnnouncer) {
    liveAnnouncer.destroy();
    liveAnnouncer = null;
  }
}

// LiveAnnouncer is implemented using vanilla DOM, not React. That's because as of React 18
// ReactDOM.render is deprecated, and the replacement, ReactDOM.createRoot is moved into a
// subpath import `react-dom/client`. That makes it hard for us to support multiple React versions.
// As a global API, we can't use portals without introducing a breaking API change. LiveAnnouncer
// is simple enough to implement without React, so that's what we do here.
// See this discussion for more details: https://github.com/reactwg/react-18/discussions/125#discussioncomment-2382638
class LiveAnnouncer {
  node: HTMLElement | null = null;
  assertiveLog: HTMLElement | null = null;
  politeLog: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.node = document.createElement('div');
      this.node.dataset.liveAnnouncer = 'true';
      // copied from VisuallyHidden
      Object.assign(this.node.style, {
        border: 0,
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap'
      });

      this.assertiveLog = this.createLog('assertive');
      this.node.appendChild(this.assertiveLog);

      this.politeLog = this.createLog('polite');
      this.node.appendChild(this.politeLog);

      document.body.prepend(this.node);
    }
  }

  createLog(ariaLive: string) {
    let node = document.createElement('div');
    node.setAttribute('role', 'log');
    node.setAttribute('aria-live', ariaLive);
    node.setAttribute('aria-relevant', 'additions');
    return node;
  }

  destroy() {
    if (!this.node) {
      return;
    }

    document.body.removeChild(this.node);
    this.node = null;
  }

  announce(message: string, assertiveness = 'assertive', timeout = LIVEREGION_TIMEOUT_DELAY, mode: 'message' | 'ids' = 'message') {
    if (!this.node) {
      return;
    }

    let node = document.createElement('div');
    if (mode === 'message') {
      node.textContent = message;
    } else {
      // To read an aria-labelledby, the element must have an appropriate role, such as img.
      node.setAttribute('role', 'img');
      node.setAttribute('aria-labelledby', message);
    }

    if (assertiveness === 'assertive') {
      this.assertiveLog?.appendChild(node);
    } else {
      this.politeLog?.appendChild(node);
    }

    if (message !== '') {
      setTimeout(() => {
        node.remove();
      }, timeout);
    }
  }

  clear(assertiveness: Assertiveness) {
    if (!this.node) {
      return;
    }

    if ((!assertiveness || assertiveness === 'assertive') && this.assertiveLog) {
      this.assertiveLog.innerHTML = '';
    }

    if ((!assertiveness || assertiveness === 'polite') && this.politeLog) {
      this.politeLog.innerHTML = '';
    }
  }
}

// singleton, setup immediately so that the DOM is primed for the first announcement as soon as possible
// Safari has a race condition where the first announcement is not read if we wait until the first announce call
let liveAnnouncer: LiveAnnouncer | null = new LiveAnnouncer();
