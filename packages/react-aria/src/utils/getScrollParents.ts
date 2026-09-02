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

import {getContainingElement, getScrollingElement} from './layoutHelpers';
import {getOwnerDocument, getOwnerWindow} from '../utils/domHelpers';
import {getParentNode, nodeContains} from './shadowdom/DOMFunctions';
import {isDocument, isElement, isNode, isShadowRoot} from './typeHelpers';
import {isScrollable, ScrollableOptions} from './isScrollable';
import {ScrollContainer} from '@react-types/shared';
import {shadowDOM} from 'react-stately/private/flags/flags';

export interface ScrollParentOptions extends ScrollableOptions {
  /** The ancestor container to stop traversal at. */
  container?: Element | Document | ScrollContainer | null;
}

export interface ScrollTargetOptions extends ScrollableOptions {
  /** The ancestor container to stop traversal at. */
  container?: Element | Document;
}

/**
 * Returns the (scrollable) ancestor for a given scroll alignment query.
 *
 * @deprecated Use 'Array.from(genScrollParents(element))' instead.
 */
export function getScrollParents(element: Element, checkForOverflow?: boolean): Element[] {
  let scrollGenerator = genScrollParents(element, {
    scrollable: checkForOverflow,
    container: 'all'
  });

  return Array.from(scrollGenerator);
}

/**
 * Returns the nearest container-bound (scrollable) ancestor of an event target.
 * This effectively translates to the element affected by a touch gesture.
 */
export function getScrollTarget(
  target: EventTarget,
  options: ScrollTargetOptions = {}
): Element | null {
  let ownerDocument = getOwnerDocument(target);

  // A scrollable document returns its scrolling element.
  if (isDocument(target) && isScrollable(ownerDocument, options)) {
    return getScrollingElement(ownerDocument);
  }

  if (isDocument(target) || !isElement(target)) {
    return null;
  }

  // Similarly, a scrollable element returns itself.
  if (isScrollable(target, options)) {
    return target;
  }

  let scrollGenerator = genScrollParents(target, {
    container: 'nearest',
    ...options
  });

  let scrollParent = scrollGenerator.next();

  return scrollParent.value;
}

/**
 * Returns the container-bound (scrollable) ancestor of an element. Yields intermediary
 * ancestors as nodes of a scrollable flat-tree that composes the element.
 */
export function* genScrollParents(
  element: Element,
  options: ScrollParentOptions = {}
): Generator<Element, Element | null> {
  let {container = 'all'} = options;

  let node: Node | null = null;
  let cursor: Element | null = null;

  let ownerWindow = getOwnerWindow(element);
  let ownerDocument = getOwnerDocument(element);

  let rootScrollingElement = getScrollingElement(ownerDocument);

  while ((node = getParentNode(element))) {
    let style = ownerWindow.getComputedStyle(element);

    // A positioned node may only scroll with its containing element.
    if (/(absolute|fixed)/.test(style.position)) node = getContainingElement(element);

    // A shadow root cant be a scroll parent so skip to its host.
    if (isShadowRoot(node) && shadowDOM()) node = node.host;
    else if (isShadowRoot(node)) return null;

    // A fixed element without a containing block has no scroll parent.
    if (node == null && style.position === 'fixed') return null;

    // Bail if we traverse past a (custom) boundary (inclusive).
    if (isNode(container) && !nodeContains(container, node)) return cursor;
    else if (!isElement(node)) break;

    // A node containing the root scrolling element is special cased below.
    if (nodeContains(node, rootScrollingElement)) break;

    // Otherwise, yield if the node is scrollable.
    if (isScrollable(node, options)) {
      yield (cursor = node);
      if (container === 'nearest') return cursor;
    }

    element = node;
  }

  if (isScrollable(rootScrollingElement, options)) {
    yield (cursor = rootScrollingElement);
  }

  return cursor;
}
