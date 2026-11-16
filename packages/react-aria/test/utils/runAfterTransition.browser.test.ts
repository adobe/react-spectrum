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

import {expect, it, vi} from 'vitest';
import {runAfterTransition} from '../../src/utils/runAfterTransition';

it.each([false, true])(
  'releases a removed CSS transition when cancellation is intercepted: %s',
  async interceptCancellation => {
    const element = document.createElement('div');
    element.style.cssText = 'opacity: 1; transition: opacity 10s linear';
    document.body.appendChild(element);
    const callback = vi.fn();
    const cancelled = vi.fn();
    element.addEventListener('transitioncancel', event => {
      cancelled();
      if (interceptCancellation) {
        event.stopImmediatePropagation();
      }
    });

    let cancel: (() => void) | undefined;
    try {
      getComputedStyle(element).opacity;
      const started = new Promise<void>(resolve => {
        element.addEventListener('transitionrun', () => resolve(), {once: true});
      });
      element.style.opacity = '0';
      await started;
      cancel = runAfterTransition(callback);
      await new Promise(requestAnimationFrame);
      expect(callback).not.toHaveBeenCalled();

      element.remove();
      await expect.poll(() => cancelled.mock.calls.length).toBe(1);
      await expect.poll(() => callback.mock.calls).toEqual([[true]]);
    } finally {
      cancel?.();
      element.remove();
      const cleanup = runAfterTransition(() => {});
      await new Promise(requestAnimationFrame);
      cleanup();
    }
  }
);
