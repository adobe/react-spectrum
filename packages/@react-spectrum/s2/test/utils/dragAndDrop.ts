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

import {server, userEvent} from 'vitest/browser';

/**
 * Creates a DataTransfer wrapper that works around Chromium restrictions on synthetic events.
 *
 * Chromium silently ignores writes to effectAllowed and dropEffect on DataTransfer objects
 * attached to untrusted (dispatched) DragEvents. This proxy intercepts those writes and
 * stores them in a local overlay, while forwarding everything else to the real DataTransfer.
 */
function createWritableDataTransfer(): {dataTransfer: DataTransfer, proxy: DataTransfer} {
  let dataTransfer = new DataTransfer();
  let overrides: Record<string, string> = {};

  let proxy = new Proxy(dataTransfer, {
    get(target, prop) {
      if (prop in overrides) {
        return overrides[prop as string];
      }
      let value = Reflect.get(target, prop, target);
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    },
    set(target, prop, value) {
      if (prop === 'effectAllowed' || prop === 'dropEffect') {
        overrides[prop] = value;
        try { (target as any)[prop] = value; } catch { /* noop - Chromium rejects this */ }
        return true;
      }
      (target as any)[prop] = value;
      return true;
    }
  });

  return {dataTransfer, proxy};
}

interface DragAndDropOptions {
  /** Clicks on the source element at this point relative to the top-left corner of the element's padding box. */
  sourcePosition?: {x: number, y: number},
  /** Drops on the target element at this point relative to the top-left corner of the element's padding box. */
  targetPosition?: {x: number, y: number}
}

/** Returns the clientX/clientY for a position relative to an element's padding box, or the element's center if no position is given. */
function resolveClientPosition(element: Element, position?: {x: number, y: number}): {clientX: number, clientY: number} {
  let rect = element.getBoundingClientRect();
  if (position) {
    return {clientX: rect.left + position.x, clientY: rect.top + position.y};
  }
  return {clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2};
}

/**
 * Perform a drag-and-drop from source to target.
 *
 * On non-Chromium browsers, delegates to `userEvent.dragAndDrop` which uses the
 * browser provider's native drag support.
 *
 * On Chromium, Playwright's CDP-based drag bypasses the native dragstart event,
 * which prevents useDrag from populating the DataTransfer. We fall back to
 * dispatching the full DragEvent lifecycle with synthetic events instead.
 */
export async function dragAndDrop(source: Element, target: Element, options?: DragAndDropOptions): Promise<void> {
  if (server.browser !== 'chromium') {
    await userEvent.dragAndDrop(source, target, options);
    return;
  }

  let {dataTransfer, proxy} = createWritableDataTransfer();

  let sourcePos = resolveClientPosition(source, options?.sourcePosition);
  let targetPos = resolveClientPosition(target, options?.targetPosition);

  // Patch DragEvent.prototype.dataTransfer to return our proxy whenever the
  // event carries our real dataTransfer. This is the only reliable way to make
  // effectAllowed/dropEffect writable in Chromium for synthetic events.
  let origDesc = Object.getOwnPropertyDescriptor(DragEvent.prototype, 'dataTransfer')!;
  Object.defineProperty(DragEvent.prototype, 'dataTransfer', {
    get() {
      let real = origDesc.get!.call(this);
      return real === dataTransfer ? proxy : real;
    },
    configurable: true
  });

  try {
    // Dispatch dragstart so useDrag populates the DataTransfer with items and sets effectAllowed.
    source.dispatchEvent(new DragEvent('dragstart', {dataTransfer, bubbles: true, cancelable: true, ...sourcePos}));

    // Allow React state updates from the dragstart handler to flush.
    await new Promise(resolve => requestAnimationFrame(resolve));

    target.dispatchEvent(new DragEvent('dragenter', {dataTransfer, bubbles: true, cancelable: true, ...targetPos}));
    target.dispatchEvent(new DragEvent('dragover', {dataTransfer, bubbles: true, cancelable: true, ...targetPos}));

    // In a real browser drag, the drop event only fires when dropEffect is not 'none'.
    // useDrop sets dropEffect during dragenter/dragover based on getDropOperation.
    if (proxy.dropEffect !== 'none') {
      target.dispatchEvent(new DragEvent('drop', {dataTransfer, bubbles: true, cancelable: true, ...targetPos}));
    }

    source.dispatchEvent(new DragEvent('dragend', {dataTransfer, bubbles: true, cancelable: true, ...targetPos}));
  } finally {
    // Restore the original dataTransfer getter.
    Object.defineProperty(DragEvent.prototype, 'dataTransfer', origDesc);
  }
}
