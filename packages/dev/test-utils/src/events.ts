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
// eslint-disable-next-line monorepo/no-internal-import
import {DataTransfer, DragEvent} from '@react-aria/dnd/test/mocks';
import type {ITypeOpts} from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';

// Triggers a "press" event on an element.
// TODO: move to somewhere more common
export function triggerPress(element, opts = {}) {
  fireEvent.mouseDown(element, {detail: 1, ...opts});
  fireEvent.mouseUp(element, {detail: 1, ...opts});
  fireEvent.click(element, {detail: 1, ...opts});
}

// Triggers a "touch" event on an element.
export function triggerTouch(element, opts = {}) {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...opts});
  fireEvent.pointerUp(element, {pointerType: 'touch', ...opts});
}

// Triggers a "longPress" event on an element.
export const DEFAULT_LONG_PRESS_TIME = 500;

export function triggerLongPress(element, opts = {}) {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...opts});
  act(() => {
    jest.advanceTimersByTime(DEFAULT_LONG_PRESS_TIME);
  });
  fireEvent.pointerUp(element, {pointerType: 'touch', ...opts});
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
      _init: {pageX: number, pageY: number, pointerType: string, pointerId: number, width: number, height: number};
      constructor(name, init) {
        super(name, init);
        this._init = init;
      }
      get pointerType() {
        return this._init.pointerType;
      }
      get pointerId() {
        return this._init.pointerId;
      }
      get pageX() {
        return this._init.pageX;
      }
      get pageY() {
        return this._init.pageY;
      }
      get width() {
        return this._init.width;
      }
      get height() {
        return this._init.height;
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
  let skipClick = document.activeElement === el;
  for (let char of value) {
    act(() => {
      userEvent.type(el, char, {skipClick, ...opts});
    });

    skipClick = true;
  }
}

export function getElementCenter(element: Element) {
  let {left, top, width, height} = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2
  };
}

/**
 * Drag an element onto a target element, by a specific delta, or both.
 * If target element provided, will drag to center of target element.
 * If both provided, delta will be from center of target element.
 */
export async function dragAndDrop(element: Element, {delta, to: targetElement, steps = 1, duration = 0, type = 'mouse'}) {
  if (!delta && !targetElement) {
    throw new Error('Must provide a delta or target element.');
  }

  let from = getElementCenter(element);
  let to = {x: 0, y: 0};

  if (delta && targetElement) {
    let targetCenter = getElementCenter(targetElement);
    to = {x: targetCenter.x + delta.x, y: targetCenter.y + delta.y};
  } else if (targetElement) {
    to = getElementCenter(targetElement);
  } else if (delta) {
    to = {x: from.x + delta.x, y: from.y + delta.y};
  }

  let step = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps
  };

  let current = {
    clientX: from.x,
    clientY: from.y
  };

  if (type === 'mouse') {
    fireEvent.mouseEnter(element, current);
    fireEvent.mouseOver(element, current);
    fireEvent.mouseMove(element, current);
    fireEvent.mouseDown(element, current);
  } else if (type === 'pointer') {
    fireEvent.pointerEnter(element, current);
    fireEvent.pointerOver(element, current);
    fireEvent.pointerMove(element, current);
    fireEvent.pointerDown(element, current);
  } else if (type === 'touch') {
    fireEvent.touchStart(element, current);
    fireEvent.touchMove(element, current);
  }

  let dataTransfer = new DataTransfer();
  fireEvent(element, new DragEvent('dragstart', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  await act(async () => Promise.resolve());

  for (let i = 0; i < steps; i++) {
    current.clientX += step.x;
    current.clientY += step.y;

    if (duration !== 0 && steps > 1) {
      await new Promise(resolve => {
        setTimeout(resolve, duration / steps);
      });
    }

    if (type === 'mouse') {
      fireEvent.mouseMove(element, current);
    } else if (type === 'pointer') {
      fireEvent.pointerMove(element, current);
    } else if (type === 'touch') {
      fireEvent.touchMove(element, current);
    }

    fireEvent(element, new DragEvent('drag', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
    fireEvent(targetElement, new DragEvent('dragover', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  }

  if (type === 'mouse') {
    fireEvent.mouseUp(element, current);
  } else if (type === 'pointer') {
    fireEvent.pointerUp(element, current);
  } else if (type === 'touch') {
    fireEvent.touchEnd(element, current);
  }

  fireEvent(element, new DragEvent('dragend', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
  fireEvent(targetElement, new DragEvent('drop', {dataTransfer, clientX: current.clientX, clientY: current.clientY}));
}
