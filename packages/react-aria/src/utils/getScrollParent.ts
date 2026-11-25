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

import {BoundingNode} from '@react-types/shared';
import {genScrollParents, ScrollParentOptions} from './getScrollParents';
import {getMaxScrollLeft, getMaxScrollTop} from './getScrollOffset';
import {getOverflowingElement} from 'react-aria/private/utils/layoutHelpers';
import {getOwnerDocument, getOwnerWindow} from './domHelpers';
import {getScrollingElement, getStylingElement} from './layoutHelpers';
import {nodeContains} from './shadowdom/DOMFunctions';

/**
 * Returns the nearest container-bound (scrollable) ancestor of a given element.
 * https://drafts.csswg.org/cssom-view/#dom-htmlelement-scrollparent.
 */
export function getScrollParent(element: Element, options?: ScrollParentOptions): Element;
/** @deprecated Use 'getScrollParent(element, {scrollable: true})' instead. */
export function getScrollParent(element: Element, checkForOverflow?: boolean): Element;
export function getScrollParent(element: Element, options?: ScrollParentOptions | boolean) {
  if (typeof options === 'undefined' || typeof options === 'boolean') {
    return getScrollParent(element, {scrollable: options});
  }

  let ownerDocument = getOwnerDocument(element);

  let scrollGenerator = genScrollParents(element, {
    container: 'nearest',
    ...options
  });

  let scrollParent = scrollGenerator.next();

  // TODO(later): Fallback is a bug, remove after auditing call sites.
  return scrollParent.value ?? getScrollingElement(ownerDocument);
}

/**
 * Returns the container-bound (scrollable) snappable ancestor of a given element.
 * https://drafts.csswg.org/css-scroll-snap-1/#scroll-snap-container.
 */
export function getSnapParent(element: Element, options: ScrollParentOptions = {}) {
  let {axis, container, modality = 'virtual', scrollable = false} = options;

  let ownerWindow = getOwnerWindow(element);
  let ownerDocument = getOwnerDocument(element);

  let rootScrollingElement = getScrollingElement(ownerDocument);

  // A snap always originates from the user agent, so walk using 'virtual' modality.
  let scrollGenerator = genScrollParents(element, {
    modality: 'virtual',
    container
  });

  let scrollParent = scrollGenerator.next();
  let node: BoundingNode | null = scrollParent.value;

  // Bail if the tree walker did not find any potentially scrollable ancestor.
  if (node == null) return null;

  // A node containing the root scrolling element shall assert as its document.
  if (nodeContains(node, rootScrollingElement)) node = ownerDocument;

  let stylingElement = getStylingElement(node);
  let overflowingElement = getOverflowingElement(node);

  let style = ownerWindow.getComputedStyle(stylingElement);
  let overflowStyle = ownerWindow.getComputedStyle(overflowingElement);

  // JSDOM may not provide a computed style, so we fallback to visible overflow.
  let {overflow = '', overflowX = '', overflowY = ''} = overflowStyle;
  let [shorthandX, shorthandY = shorthandX] = overflow.split(' ');

  let isSnappableBlock = /^(both|block|y)\b/.test(style.scrollSnapType);
  let isSnappableInline = /^(both|inline|x)\b/.test(style.scrollSnapType);

  if (modality === 'pointer') {
    isSnappableBlock &&= /(^$|auto|scroll|visible)/.test(shorthandY + overflowY);
    isSnappableInline &&= /(^$|auto|scroll|visible)/.test(shorthandX + overflowX);
  }

  if (scrollable) {
    isSnappableBlock &&= getMaxScrollTop(node) !== 0;
    isSnappableInline &&= getMaxScrollLeft(node) !== 0;
  }

  switch (axis) {
    case 'block':
      return isSnappableBlock ? scrollParent.value : null;
    case 'inline':
      return isSnappableInline ? scrollParent.value : null;
    default:
      return isSnappableBlock || isSnappableInline ? scrollParent.value : null;
  }
}
