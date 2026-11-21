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

import {Axis, BoundingNode, ScrollOptions} from '@react-types/shared';
import {getMaxScrollLeft, getMaxScrollTop} from './getScrollOffset';
import {getOverflowingElement, getScrollingElement, getStylingElement} from './layoutHelpers';
import {getOwnerDocument, getOwnerWindow} from './domHelpers';
import {isDocument} from './typeHelpers';
import {nodeContains} from './shadowdom/DOMFunctions';

export interface ScrollableOptions extends Omit<ScrollOptions, 'behavior'> {
  /** Whether the container must overflow. */
  scrollable?: boolean;
  /** A logical axis to restrict the scroll to. */
  axis?: Axis;
}

/**
 * Checks whether a container is potentially scrollable using modality.
 * https://drafts.csswg.org/css-overflow-3/#scrolling.
 */
export function isScrollable(node: BoundingNode, options?: ScrollableOptions): boolean;
/** @deprecated Use 'isScrollable(element, {scrollable: true})' instead. */
export function isScrollable(node: BoundingNode, checkForOverflow?: boolean): boolean;
export function isScrollable(node: BoundingNode, options?: ScrollableOptions | boolean) {
  if (typeof options === 'undefined' || typeof options === 'boolean') {
    return isScrollable(node, {scrollable: options});
  }

  let {axis, modality = 'pointer', scrollable = false} = options;

  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  let rootScrollingElement = getScrollingElement(ownerDocument);
  let rootOverflowingElement = getOverflowingElement(ownerDocument);

  // A node containing the root scrolling element shall assert as its document.
  if (nodeContains(node, rootScrollingElement)) node = ownerDocument;

  // Overflow on the body and root may be propagated to the viewport, so 'visible'
  // becomes 'auto' and 'clip' turns into 'hidden'. If an element propagates
  // its overflow, its own overflow is always a 'visible' used value, so bail out.
  // https://drafts.csswg.org/css-overflow/#overflow-propagation
  if (node === rootOverflowingElement) return false;

  let stylingElement = getStylingElement(node);
  let overflowingElement = getOverflowingElement(node);

  let style = ownerWindow.getComputedStyle(stylingElement);
  let overflowStyle = ownerWindow.getComputedStyle(overflowingElement);

  // Overflow only applies to block, flex and grid containers, so bail for inline boxes,
  // table tracks or elements replaced by their contents. The root is always blockified.
  // https://drafts.csswg.org/css-overflow/#overflow-properties
  if (/(contents|inline|inline list-item)$/.test(style.display)) return false;
  else if (/(table-(row|column|header|footer))/.test(style.display)) return false;

  // JSDOM may not provide a computed style, so we fallback to visible overflow.
  let {overflow = '', overflowX = '', overflowY = ''} = overflowStyle;
  let [shorthandX, shorthandY = shorthandX] = overflow.split(' ');

  let isScrollableBlock = /(auto|scroll)/.test(shorthandY + overflowY);
  let isScrollableInline = /(auto|scroll)/.test(shorthandX + overflowX);

  if (isDocument(node)) {
    isScrollableBlock ||= /(^$|visible)/.test(shorthandY + overflowY);
    isScrollableInline ||= /(^$|visible)/.test(shorthandX + overflowX);
  }

  if (modality !== 'pointer' && isDocument(node)) {
    isScrollableBlock ||= /(clip)/.test(shorthandY + overflowY);
    isScrollableInline ||= /(clip)/.test(shorthandX + overflowX);
  }

  if (modality !== 'pointer') {
    isScrollableBlock ||= /(hidden)/.test(shorthandY + overflowY);
    isScrollableInline ||= /(hidden)/.test(shorthandX + overflowX);
  }

  if (scrollable) {
    isScrollableBlock &&= getMaxScrollTop(node) !== 0;
    isScrollableInline &&= getMaxScrollLeft(node) !== 0;
  }

  switch (axis) {
    case 'block':
      return isScrollableBlock;
    case 'inline':
      return isScrollableInline;
    default:
      return isScrollableBlock || isScrollableInline;
  }
}
