/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export function setupIntersectionObserverMock({
  disconnect = () => null,
  observe = () => null,
  takeRecords = () => [],
  unobserve = () => null
} = {}) {
  class MockIntersectionObserver {
    root;
    rootMargin;
    thresholds;
    disconnect;
    observe;
    takeRecords;
    unobserve;
    callback;
    static instance;

    constructor(cb: IntersectionObserverCallback, opts: IntersectionObserverInit = {}) {
      // TODO: since we are using static to access this in the test,
      // it will have the values of the latest new IntersectionObserver call
      // Will replace with jsdom-testing-mocks when possible and I figure out why it blew up
      // last when I tried to use it
      MockIntersectionObserver.instance = this;
      this.root = opts.root;
      this.rootMargin = opts.rootMargin;
      this.thresholds = opts.threshold;
      this.disconnect = disconnect;
      this.observe = observe;
      this.takeRecords = takeRecords;
      this.unobserve = unobserve;
      this.callback = cb;
    }

    triggerCallback(entries) {
      this.callback(entries);
    }
  }

  window.IntersectionObserver = MockIntersectionObserver;
  return MockIntersectionObserver;
}
