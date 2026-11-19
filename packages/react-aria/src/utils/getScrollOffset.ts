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

import {Axis, BoundingNode} from '@react-types/shared';
import {getOverflowingElement, getScrollingElement, getWritingElement} from './layoutHelpers';
import {getOwnerDocument, getOwnerWindow} from './domHelpers';
import {isDocument} from './typeHelpers';
import {nodeContains} from './shadowdom/DOMFunctions';

export function getScrollLeft(node: BoundingNode): number {
  return getScrollOffset(node, 'inline');
}

export function getScrollTop(node: BoundingNode): number {
  return getScrollOffset(node, 'block');
}

export function getMaxScrollLeft(node: BoundingNode): number {
  return getMaxScrollOffset(node, 'inline');
}

export function getMaxScrollTop(node: BoundingNode): number {
  return getMaxScrollOffset(node, 'block');
}

export function getScrollLeftDirection(node: BoundingNode): 'ascending' | 'descending' {
  return getScrollDirection(node, 'inline');
}

export function getScrollTopDirection(node: BoundingNode): 'ascending' | 'descending' {
  return getScrollDirection(node, 'block');
}

function getScrollOffset(node: BoundingNode, axis: Axis): number {
  let scrollingElement = getScrollingElement(node);

  // TODO: Leave this to each callsite that needs it or force it here?
  // https://issues.chromium.org/issues/40839168
  // if (isWebKit() && !isIOS() && ownerWindow.devicePixelRatio !== 1) {
  //   top = Math.round(scrollOffsetBlock);
  //   left = Math.round(scrollOffsetInline);
  // }

  switch (axis) {
    case 'block':
      return scrollingElement.scrollTop;
    case 'inline':
      return scrollingElement.scrollLeft;
  }
}

function getMaxScrollOffset(node: BoundingNode, axis: Axis): number {
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
  if (node === rootOverflowingElement) return 0;

  let scrollingElement = getScrollingElement(node);
  let overflowingElement = getOverflowingElement(node);

  let style = ownerWindow.getComputedStyle(overflowingElement);
  let [overflowX, overflowY = overflowX] = String(style.overflow).split(' ');

  let isScrollableBlock = /(auto|scroll|hidden)/.test(overflowY + style.overflowY);
  let isScrollableInline = /(auto|scroll|hidden)/.test(overflowX + style.overflowX);

  // Bail if an element is not scrollable in the given axis.
  if (axis === 'block' && !isScrollableBlock && !isDocument(node)) return 0;
  if (axis === 'inline' && !isScrollableInline && !isDocument(node)) return 0;

  // Otherwise, measure the scrollable range in the current direction.
  let scrollSize = axis === 'block' ? scrollingElement.scrollHeight : scrollingElement.scrollWidth;
  let clientSize = axis === 'block' ? scrollingElement.clientHeight : scrollingElement.clientWidth;

  switch (getScrollDirection(node, axis)) {
    case 'ascending':
      return Math.max(0, scrollSize - clientSize);
    case 'descending':
      return Math.min(0, clientSize - scrollSize);
  }
}

function getScrollDirection(node: BoundingNode, axis: Axis): 'ascending' | 'descending' {
  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  let rootScrollingElement = getScrollingElement(ownerDocument);

  // A node containing the root scrolling element shall assert as its document.
  if (nodeContains(node, rootScrollingElement)) node = ownerDocument;

  let writingElement = getWritingElement(node);
  let style = ownerWindow.getComputedStyle(writingElement);

  let isFlexDisplay = /flex/.test(style.display);
  let isFlexReverseBlock = /column-reverse/.test(style.flexDirection);
  let isFlexReverseInline = /row-reverse/.test(style.flexDirection);

  // A viewport is never a flex container, so it only follows the writing direction
  // and any reversed content falls outside of its scrollable overflow region.
  // https://drafts.csswg.org/css-overflow/#scrollable-overflow-region
  if (axis === 'block' && isFlexDisplay && isFlexReverseBlock) {
    return isDocument(node) ? 'ascending' : 'descending';
  }

  if (axis === 'inline' && isFlexDisplay && isFlexReverseInline && isDocument(node)) {
    return style.direction === 'rtl' ? 'descending' : 'ascending';
  }

  if (axis === 'inline' && isFlexDisplay && isFlexReverseInline) {
    return style.direction === 'rtl' ? 'ascending' : 'descending';
  }

  if (axis === 'inline' && style.direction === 'rtl') {
    return 'descending';
  }

  return 'ascending';
}
