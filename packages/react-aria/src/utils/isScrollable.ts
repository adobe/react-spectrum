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
  /** Whether the container must be snap-enabled. */
  snappable?: boolean;
  /** A logical axis to restrict the scroll to. */
  axis?: Axis;
}

/**
 * Checks whether a container is potentially scroll(snap)able using modality.
 */
// TODO: Revisit https://github.com/adobe/react-spectrum/pull/5513#issuecomment-1847614274
export function isScrollable(node: BoundingNode, options?: ScrollableOptions): boolean;
/** @deprecated Use 'isScrollable(element, {scrollable: true})' instead. */
export function isScrollable(node: BoundingNode, checkForOverflow?: boolean): boolean;
export function isScrollable(node: BoundingNode, options?: ScrollableOptions | boolean) {
  if (typeof options === 'undefined' || typeof options === 'boolean') {
    return isScrollable(node, {scrollable: options});
  }

  let {scrollable = false, snappable = false, modality = 'pointer', axis = 'both'} = options;

  // A snap always originates from the user agent so force 'virtual' modality.
  modality = snappable ? 'virtual' : modality;

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

  let [snapType] = String(style.scrollSnapType).split(' ');
  let [overflowX, overflowY = overflowX] = String(overflowStyle.overflow).split(' ');

  let isScrollableBlock = /(auto|scroll)/.test(overflowY + overflowStyle.overflowY);
  let isScrollableInline = /(auto|scroll)/.test(overflowX + overflowStyle.overflowX);

  if (isDocument(node)) {
    isScrollableBlock ||= /(visible)/.test(overflowY + overflowStyle.overflowY);
    isScrollableInline ||= /(visible)/.test(overflowX + overflowStyle.overflowX);
  }

  if (modality !== 'pointer' && isDocument(node)) {
    isScrollableBlock ||= /(clip)/.test(overflowY + overflowStyle.overflowY);
    isScrollableInline ||= /(clip)/.test(overflowX + overflowStyle.overflowX);
  }

  if (modality !== 'pointer') {
    isScrollableBlock ||= /(hidden)/.test(overflowY + overflowStyle.overflowY);
    isScrollableInline ||= /(hidden)/.test(overflowX + overflowStyle.overflowX);
  }

  if (snappable) {
    isScrollableBlock &&= /(both|block|y)/.test(snapType);
    isScrollableInline &&= /(both|inline|x)/.test(snapType);
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
