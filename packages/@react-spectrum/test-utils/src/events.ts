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

import {act, fireEvent} from '@testing-library/react';
import type {ITypeOpts} from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';

// Triggers a "press" event on an element.
// TODO: move to somewhere more common
export function triggerPress(element, opts = {}) {
  act(() => {
    fireEvent.mouseDown(element, {detail: 1, ...opts});
  });
  act(() => {
    fireEvent.mouseUp(element, {detail: 1, ...opts});
  });
  act(() => {
    fireEvent.click(element, {detail: 1, ...opts});
  });
}

/**
 * Enables reading pageX/pageY from fireEvent.mouse*(..., {pageX: ..., pageY: ...}).
 */
export function installMouseEvent() {
  beforeAll(() => {
    let oldMouseEvent = MouseEvent;
    // @ts-ignore
    global.MouseEvent = class FakeMouseEvent extends MouseEvent {
      _init: {pageX: number, pageY: number};
      constructor(name, init) {
        super(name, init);
        this._init = init;
      }
      get pageX() {
        return this._init.pageX;
      }
      get pageY() {
        return this._init.pageY;
      }
    };
    // @ts-ignore
    global.MouseEvent.oldMouseEvent = oldMouseEvent;
  });
  afterAll(() => {
    // @ts-ignore
    global.MouseEvent = global.MouseEvent.oldMouseEvent;
  });
}

export function installPointerEvent() {
  beforeAll(() => {
    // @ts-ignore
    global.PointerEvent = class FakePointerEvent extends MouseEvent {
      _init: {pageX: number, pageY: number, pointerType: string};
      constructor(name, init) {
        super(name, init);
        this._init = init;
      }
      get pointerType() {
        return this._init.pointerType;
      }
      get pageX() {
        return this._init.pageX;
      }
      get pageY() {
        return this._init.pageY;
      }
    };
  });
  afterAll(() => {
    // @ts-ignore
    delete global.PointerEvent;
  });
}

/**
 * Must **not** be called inside an `act` callback!
 *
 * \@testing-library/user-event's `type` helper doesn't call `act` every keystroke.
 * But we want to run all event handles after every character.
 * @param el The input element to type into.
 * @param value The text.
 */
export function typeText(el: HTMLElement, value: string, opts?: ITypeOpts) {
  for (let char of value) {
    act(() => {
      userEvent.type(el, char, opts);
    });
  }
}
