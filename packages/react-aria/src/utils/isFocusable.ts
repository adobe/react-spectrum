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

import {isElementVisible} from './isElementVisible';

const focusableElements = [
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable^="false"])',
  'permission'
];

const FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(':not([hidden]),') + ',[tabindex]:not([disabled]):not([hidden])';

focusableElements.push('[tabindex]:not([tabindex="-1"]):not([disabled])');
const TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([hidden]):not([tabindex="-1"]),');

export function isFocusable(element: Element): boolean {
  return element.matches(FOCUSABLE_ELEMENT_SELECTOR) && isElementVisible(element) && !isInert(element);
}

export function isTabbable(element: Element): boolean {
  return element.matches(TABBABLE_ELEMENT_SELECTOR) && isElementVisible(element) && !isInert(element);
}

function isInert(element: Element): boolean {
  let node: Element | null = element;
  while (node != null) {
    if (node instanceof node.ownerDocument.defaultView!.HTMLElement && node.inert) {
      return true;
    }

    node = node.parentElement;
  }

  return false;
}
