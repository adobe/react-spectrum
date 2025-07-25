/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent} from '@testing-library/react';

// Triggers a "touch" event on an element.
export function triggerTouch(element: HTMLElement, opts: PointerEventInit = {}): void {
  fireEvent.pointerDown(element, {pointerType: 'touch', pointerId: 1, ...opts});
  fireEvent.pointerUp(element, {pointerType: 'touch', pointerId: 1, ...opts});
  fireEvent.click(element, opts);
}

// Mocks and prevents the next click's default operation
export function mockClickDefault(opts: AddEventListenerOptions = {}): jest.Mock {
  let onClick = jest.fn().mockImplementation(e => e.preventDefault());
  window.addEventListener('click', onClick, opts);

  return onClick;
}
