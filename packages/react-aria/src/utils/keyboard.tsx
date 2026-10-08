/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {addEvent} from './domHelpers';
import {getActiveElement, getEventTarget} from './shadowdom/DOMFunctions';
import {getMetaValue} from './getMetaValue';
import {isAndroid, isMac, isWebKit} from './platform';
import {isFocusable} from './isFocusable';

const KEYBOARD_HEIGHT = 100;
const KEYBOARD_TIMEOUT = 600;

// Tracks layout state of the on-screen keyboard.
const state: KeyboardState = {
  isOpen: false,
  screenWidth: 0,
  screenHeight: 0,
  screenAngle: 0,
  screenTimeout: 0,
  startTimeStamp: 0,
  endTimeStamp: 0,
  resizeTimeStamp: 0,
  resizeTimeout: 0
};

// HTML input types that do not cause the software keyboard to appear.
const nonTextInputTypes = new Set([
  'checkbox',
  'radio',
  'range',
  'color',
  'file',
  'image',
  'button',
  'submit',
  'reset'
]);

interface KeyboardState {
  isOpen: boolean;
  screenHeight: number;
  screenWidth: number;
  screenAngle: number;
  screenTimeout: number;
  startTimeStamp: number;
  endTimeStamp: number;
  resizeTimeStamp: number;
  resizeTimeout: number;
}

interface KeyPressEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

interface TouchScreen {
  width: number;
  height: number;
  angle: number;
}

if (
  process.env.NODE_ENV === 'test' &&
  typeof window !== 'undefined' &&
  !Reflect.has(window, 'visualViewport')
) {
  const visualViewport = Object.assign(new EventTarget(), {
    offsetTop: 0,
    offsetLeft: 0,
    pageTop: 0,
    pageLeft: 0,
    scale: 1
  });

  Reflect.defineProperty(visualViewport, 'width', {
    get: () => window.innerWidth,
    configurable: true
  });

  Reflect.defineProperty(visualViewport, 'height', {
    get: () => window.innerHeight,
    configurable: true
  });

  Reflect.defineProperty(window, 'visualViewport', {
    value: visualViewport,
    configurable: true,
    writable: true
  });
}

if (
  process.env.NODE_ENV === 'test' &&
  typeof window !== 'undefined' &&
  !Reflect.has(window.screen, 'orientation')
) {
  const orientation = Object.assign(new EventTarget(), {
    type: 'landscape-primary'
  });

  Reflect.defineProperty(window.screen, 'orientation', {
    value: orientation,
    configurable: true,
    writable: true
  });

  Reflect.defineProperty(window.screen.orientation, 'angle', {
    get: () => window.orientation ?? 0,
    configurable: true
  });
}

function getTouchScreen(): TouchScreen {
  // Normalize the screen by any scaling to get the layout coordinate space.
  let screenWidth = Number(window.visualViewport?.width ?? window.innerWidth);
  let screenHeight = Number(window.visualViewport?.height ?? window.innerHeight);
  let visualScale = Number(window.visualViewport?.scale ?? 1);

  return {
    width: screenWidth * visualScale,
    height: screenHeight * visualScale,
    angle: window.screen.orientation.angle
  };
}

function onResizeStart(e: Event): void {
  // So we don't constantly call clearTimeout and setTimeout, keep track of the
  // current timeout time and only reschedule the timer when it is getting close.
  if (state.resizeTimeStamp <= e.timeStamp + 50) {
    state.resizeTimeStamp = e.timeStamp + 150;

    window.clearTimeout(state.resizeTimeout);
    state.resizeTimeout = window.setTimeout(onResizeEnd, 150);
  }
}

function onResizeEnd(): void {
  let viewportMeta = getMetaValue('viewport');

  // Overlaying keyboards do not impact geometry, so there is nothing to measure.
  // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
  if (isAndroid() && viewportMeta?.includes('overlays-content')) {
    return;
  }

  let time = performance.now();
  let screen = getTouchScreen();

  let elapsed = time - state.startTimeStamp;
  let delta = state.screenHeight - screen.height;
  let rotation = state.screenAngle - screen.angle;

  // Update the screen once an open keyboard that rotated along closes. The state swap was
  // deferred, so the old width predicts the height it should close towards.
  if (Math.abs(rotation) % 180 && state.screenWidth - screen.height < KEYBOARD_HEIGHT) {
    state.screenWidth = screen.width;
    state.screenHeight = screen.height;
    state.screenAngle = screen.angle;
    delta = 0;
  }

  // Update the screen if a resize happens outside the capture timeframe. We debounce
  // because WebKit may fire its single opening resize before the focus event.
  if (elapsed > KEYBOARD_TIMEOUT) {
    window.clearTimeout(state.screenTimeout);

    state.screenTimeout = window.setTimeout(() => {
      let activeElement = document.hasFocus() ? getActiveElement() : null;
      let willKeyboardOpen = willOpenKeyboard(activeElement);
      let screen = getTouchScreen();

      if (Math.abs(state.screenAngle - screen.angle) % 180) {
        return;
      }

      if (state.isOpen && willKeyboardOpen) {
        return;
      }

      state.screenWidth = screen.width;
      state.screenHeight = screen.height;
      state.screenAngle = screen.angle;

      state.isOpen = false;
    }, KEYBOARD_TIMEOUT);
  }

  // Otherwise, record an opening if the height changed by more than our threshold.
  // This may fail if the layout viewport changes for other reasons during this timeframe.
  if (elapsed <= KEYBOARD_TIMEOUT && delta >= KEYBOARD_HEIGHT) {
    state.endTimeStamp = time;
  }

  // Store the new open state since the viewport is stable when this is reached.
  state.isOpen = delta >= KEYBOARD_HEIGHT;
}

function onOrientationChange(): void {
  let screen = getTouchScreen();

  let rotation = state.screenAngle - screen.angle;

  // Rotation may cause the resize buffer to be filled, but we need to make sure a screen
  // estimate is already available in case focus lands before it expires. This could fail
  // if a top bar exceeds the keyboard threshold, in which case we may need to revisit.
  if (Math.abs(rotation) % 180 && !state.isOpen) {
    let width = state.screenWidth;
    let height = state.screenHeight;

    state.screenWidth = height;
    state.screenHeight = width;
  }

  if (!state.isOpen) {
    state.screenAngle = screen.angle;
  }
}

function onFocus(e: FocusEvent): void {
  let target = getEventTarget(e);
  let willKeyboardOpen = willOpenKeyboard(target as Element);

  let time = performance.now();
  let screen = getTouchScreen();

  let delta = state.screenHeight - screen.height;

  // Update the screen and start the timer if we are about to open.
  if (delta < KEYBOARD_HEIGHT && willKeyboardOpen) {
    state.screenWidth = screen.width;
    state.screenHeight = screen.height;
    state.screenAngle = screen.angle;
    state.startTimeStamp = time;
  }

  // This focus will open a keyboard so reset the buffer.
  if (willKeyboardOpen) {
    window.clearTimeout(state.screenTimeout);
  }

  // Stop the timer if the keyboard is already open.
  if (delta >= KEYBOARD_HEIGHT && willKeyboardOpen) {
    state.endTimeStamp = time;
  }
}

function setupGlobalEvents(): void {
  let screen = getTouchScreen();

  // WebKit only fires a single event per resize.
  addEvent(window.visualViewport, 'resize', isWebKit() ? onResizeEnd : onResizeStart);
  // oxlint-disable-next-line - looks like the lint for this is a little too aggressive
  addEvent(window.screen.orientation, 'change', onOrientationChange);
  addEvent(window, 'focus', onFocus, {capture: true, passive: true});

  // Store the initial screen dimensions.
  state.screenWidth = screen.width;
  state.screenHeight = screen.height;
  state.screenAngle = screen.angle;
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    setupGlobalEvents();
  } else {
    addEvent(document, 'DOMContentLoaded', setupGlobalEvents);
  }
}

export function supportsKeyboard(): boolean {
  let viewportMeta = getMetaValue('viewport');

  // Overlaying keyboards do not impact geometry, so there is nothing to await.
  // https://caniuse.com/mdn-html_elements_meta_name_viewport_interactive-widget
  if (isAndroid() && viewportMeta?.includes('overlays-content')) {
    return false;
  }

  // WebKit may resize before focus, but an open keyboard always means we have support.
  if (state.isOpen) {
    return true;
  }

  // As long as no input has ever been focused, we return default support.
  if (!state.startTimeStamp) {
    return window.navigator.maxTouchPoints > 0;
  }

  // If keyboard geometry changed within the timeout period, we have support.
  if (state.endTimeStamp >= state.startTimeStamp) {
    return true;
  }

  // If a geometry change is mid-flight we return the most recent support.
  // Supported platforms may have a hardware keyboard, which this won't catch, but thats
  // about as far as we can reasonably go to exclude non-touch devices.
  return performance.now() - state.startTimeStamp <= KEYBOARD_TIMEOUT
    ? state.endTimeStamp > 0 || window.navigator.maxTouchPoints > 0
    : false;
}

export function willOpenKeyboard(target: Element | null): boolean {
  if (!(target instanceof Element) || !isFocusable(target)) {
    return false;
  }

  let isTextArea = target instanceof HTMLTextAreaElement;
  let isEditable = target instanceof HTMLElement && target.isContentEditable;
  let isTextInput = target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type);

  return isTextArea || isEditable || isTextInput;
}

export function isCtrlKeyPressed(event: KeyPressEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

export function isKeyboardOpen(): boolean {
  return state.isOpen;
}
