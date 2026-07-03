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

import {addEvent, getOwnerDocument, getOwnerViewport, getOwnerWindow} from './domHelpers';
import {getActiveElement, getEventTarget} from './shadowdom/DOMFunctions';
import {isFirefox, isIOS, isMac} from './platform';

// Tracks layout status of the on-screen keyboard.
const cache = new WeakMap<EventTarget, KeyboardStatus>();

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

interface KeyboardStatus {
  isOpen: boolean;
  innerHeight?: number;
  resizeTimeStamp?: number;
  resizeTimeout?: number;
  supportsKeyboard?: boolean;
}

interface KeyPressEvent {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

function onResize(e: Event): void {
  let target = getEventTarget(e);
  let ownerWindow = getOwnerWindow(target);

  let status = cache.get(ownerWindow);
  let timeStamp = Number(status?.resizeTimeStamp ?? 0);

  if (status && timeStamp <= e.timeStamp + 50) {
    status.resizeTimeStamp = e.timeStamp + 150;
    status.supportsKeyboard ||= isKeyboardVisible();

    ownerWindow.clearTimeout(status.resizeTimeout);

    status.resizeTimeout = ownerWindow.setTimeout(() => {
      status.isOpen = isKeyboardVisible();
      status.supportsKeyboard ||= status.isOpen;
      delete status.resizeTimeout;
      delete status.resizeTimeStamp;
    }, 150);
  }
}

function onIOSResize(e: Event): void {
  let target = getEventTarget(e);
  let ownerWindow = getOwnerWindow(target);

  let status = cache.get(ownerWindow);

  if (status) {
    status.isOpen = isKeyboardVisible();
    status.supportsKeyboard ||= status.isOpen;
  }
}

function setupGlobalEvents(): void {
  let ownerWindow = getOwnerWindow();
  let ownerViewport = getOwnerViewport();

  let status: KeyboardStatus = {isOpen: false};

  if (ownerWindow == null || ownerViewport == null) return;

  // https://github.com/mozilla-mobile/firefox-ios/issues/33806
  if (isIOS() && isFirefox()) {
    status.innerHeight = ownerWindow.innerHeight;
  }

  addEvent(ownerViewport, 'resize', isIOS() ? onIOSResize : onResize);
  cache.set(ownerWindow, status);
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    setupGlobalEvents();
  } else {
    addEvent(document, 'DOMContentLoaded', setupGlobalEvents);
  }
}

export function supportsKeyboard(): boolean {
  let ownerWindow = getOwnerWindow();
  let ownerViewport = getOwnerViewport();

  if (ownerWindow == null || ownerViewport == null) return false;

  let status = cache.get(ownerWindow);

  return !!status?.supportsKeyboard;
}

export function willOpenKeyboard(target: EventTarget | null): boolean {
  let isTextArea = target instanceof HTMLTextAreaElement;
  let isEditable = target instanceof HTMLElement && target.isContentEditable;
  let isTextInput = target instanceof HTMLInputElement && !nonTextInputTypes.has(target.type);

  return isTextArea || isEditable || isTextInput;
}

export function isCtrlKeyPressed(event: KeyPressEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

export function isKeyboardOpen(): boolean {
  let ownerWindow = getOwnerWindow();
  let ownerViewport = getOwnerViewport();

  if (ownerWindow == null || ownerViewport == null) return false;

  let status = cache.get(ownerWindow);

  return !!status?.isOpen;
}

export function isKeyboardVisible(): boolean {
  let ownerWindow = getOwnerWindow();
  let ownerDocument = getOwnerDocument();
  let ownerViewport = getOwnerViewport();

  if (ownerWindow == null || ownerViewport == null) return false;

  let status = cache.get(ownerWindow);

  let activeElement = getActiveElement(ownerDocument);
  let willKeyboardOpen = ownerDocument.hasFocus() && willOpenKeyboard(activeElement);

  let minHeight = Number(ownerViewport?.height) * Number(ownerViewport?.scale);
  let maxHeight = Number(status?.innerHeight) || Number(ownerWindow.innerHeight);

  return (willKeyboardOpen || !!status?.isOpen) && maxHeight - minHeight > 100;
}
