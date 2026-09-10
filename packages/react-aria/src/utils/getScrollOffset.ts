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
import {getOwnerDocument, getOwnerWindow} from './domHelpers';
import {getScrollingElement, getWritingElement} from './layoutHelpers';
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
  let ownerDocument = getOwnerDocument(node);

  let scrollingElement = getScrollingElement(node);
  let rootScrollingElement = getScrollingElement(ownerDocument);

  // A node containing the root scrolling element shall assert as its document.
  let client = nodeContains(node, rootScrollingElement)
    ? ownerDocument.documentElement
    : (node as Element);

  let scrollSize = axis === 'block' ? scrollingElement.scrollHeight : scrollingElement.scrollWidth;
  let clientSize = axis === 'block' ? client.clientHeight : client.clientWidth;

  switch (getScrollDirection(node, axis)) {
    case 'ascending':
      return Math.max(0, scrollSize - clientSize);
    case 'descending':
      return Math.max(0, scrollSize - clientSize) * -1;
  }
}

function getScrollDirection(node: BoundingNode, axis: Axis): 'ascending' | 'descending' {
  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  let scrollingElement = getScrollingElement(node);
  let rootScrollingElement = getScrollingElement(ownerDocument);

  // A node containing the root scrolling element shall assert as its document.
  let style = nodeContains(node, rootScrollingElement)
    ? ownerWindow.getComputedStyle(getWritingElement(ownerDocument))
    : ownerWindow.getComputedStyle(getWritingElement(node));

  let isFlexDisplay = /flex/.test(style.display);
  let isFlexReverseBlock = /column-reverse/.test(style.flexDirection);
  let isFlexReverseInline = /row-reverse/.test(style.flexDirection);

  // https://bugs.webkit.org/show_bug.cgi?id=313748
  if (axis === 'block' && isFlexDisplay && isFlexReverseBlock) {
    return scrollingElement === rootScrollingElement ? 'ascending' : 'descending';
  }

  if (axis === 'inline' && isFlexDisplay && isFlexReverseInline) {
    return style.direction === 'rtl' ? 'ascending' : 'descending';
  }

  if (axis === 'inline' && style.direction === 'rtl') {
    return 'descending';
  }

  return 'ascending';
}
