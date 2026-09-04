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

import {BoundingNode} from '@react-types/shared';
import {getOwnerDocument, getOwnerWindow} from './domHelpers';
import {getParentNode, nodeContains} from './shadowdom/DOMFunctions';
import {isContainingBlock} from './isContainingBlock';
import {isDocument, isElement, isHTMLElement} from './typeHelpers';

/**
 * Returns the visual viewport of a document. This is the visible viewport intersection.
 * https://www.w3.org/TR/css-viewport/#visual-viewport.
 */
export function getVisualViewport(node: BoundingNode): VisualViewport | null {
  let ownerWindow = getOwnerWindow(node);

  return ownerWindow.visualViewport ?? null;
}

/**
 * Returns the styling element of a bounding node. This is typically the node itself.
 * https://www.w3.org/TR/2000/CR-SVG-20001102/styling.html.
 */
export function getStylingElement(node: BoundingNode): Element {
  let ownerDocument = getOwnerDocument(node);

  if (isDocument(node)) {
    return ownerDocument.documentElement;
  } else {
    return node;
  }
}

/**
 * Returns the scrolling element of a bounding node. This is typically the node itself.
 * https://www.w3.org/TR/cssom-view/#dom-document-scrollingelement.
 */
export function getScrollingElement(node: BoundingNode): Element {
  let ownerDocument = getOwnerDocument(node);

  // A node containing the root scrolling element shall assert as its document.
  if (nodeContains(node, ownerDocument.scrollingElement)) node = ownerDocument;

  // Ignore a potentially scrollable body in a quirks mode document for convenience,
  // since its unlikely to occur inside of a React application anyways.
  if (isDocument(node) && isHTMLElement(ownerDocument.scrollingElement)) {
    return ownerDocument.scrollingElement;
  } else if (isDocument(node)) {
    return ownerDocument.documentElement;
  } else {
    return node;
  }
}

/**
 * Returns the flow propagating element of a document. This is typically the body element.
 * https://www.w3.org/TR/css-writing-modes/#principal-flow.
 */
export function getWritingElement(node: BoundingNode): Element {
  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  // A node containing the body element shall assert as its document.
  if (nodeContains(node, ownerDocument.body)) node = ownerDocument;

  if (isDocument(node) && ownerDocument.body == null) {
    return ownerDocument.documentElement;
  } else if (!isDocument(node)) {
    return node;
  }

  let bodyStyle = ownerWindow.getComputedStyle(ownerDocument.body);

  if (bodyStyle.display === 'none') {
    return ownerDocument.documentElement;
  } else {
    return ownerDocument.body;
  }
}

/**
 * Returns overflow propagating element of a document. This is typically the body element.
 * https://www.w3.org/TR/css-overflow-3/#overflow-propagation.
 */
export function getOverflowingElement(node: BoundingNode): Element {
  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  // A node containing the body element shall assert as its document.
  if (nodeContains(node, ownerDocument.body)) node = ownerDocument;

  if (isDocument(node) && ownerDocument.body == null) {
    return ownerDocument.documentElement;
  } else if (!isDocument(node)) {
    return node;
  }

  let rootStyle = ownerWindow.getComputedStyle(ownerDocument.documentElement);
  let bodyStyle = ownerWindow.getComputedStyle(ownerDocument.body);

  let [overflowX, overflowY = overflowX] = String(rootStyle.overflow).split(' ');
  let isRootVisibleBlock = /(visible)/.test(overflowY + rootStyle.overflowY);
  let isRootVisibleInline = /(visible)/.test(overflowX + rootStyle.overflowX);
  let isBodyHidden = /(none)/.test(rootStyle.display + bodyStyle.display);

  if (!isRootVisibleBlock || !isRootVisibleInline || isBodyHidden) {
    return ownerDocument.documentElement;
  } else {
    return ownerDocument.body;
  }
}

/**
 * Returns the containing block of a bounding node. This is typically the offset parent.
 * https://www.w3.org/TR/css-display-4/#containing-block.
 */
export function getContainingElement(node: BoundingNode): Element | null {
  let ownerWindow = getOwnerWindow(node);
  let ownerDocument = getOwnerDocument(node);

  // A node containing the body element shall return the initial containing block.
  if (nodeContains(node, ownerDocument.body)) {
    return ownerDocument.documentElement;
  }

  // The offsetParent of an element in most cases equals the containing block.
  // https://w3c.github.io/csswg-drafts/cssom-view/#dom-htmlelement-offsetparent
  let offsetParent = isHTMLElement(node) ? node.offsetParent : null;

  // The offsetParent algorithm terminates at the document body, even if the
  // body is not a containing block — fall through to the root element then.
  if (offsetParent === ownerDocument.body) {
    let style = ownerWindow.getComputedStyle(offsetParent);

    if (style.position === 'static' && !isContainingBlock(offsetParent)) {
      offsetParent = ownerDocument.documentElement;
    }
  }

  // TODO(later): handle table elements?
  // TODO(later): handle anchor positioning?

  // The offsetParent is null for 'position: fixed', among a few other cases.
  // Fixed positioned elements are still positioned relative to their
  // containing block, which is not always the viewport — walk the flat tree.
  let currentNode: Node | null = offsetParent == null ? node : null;

  while (currentNode != null) {
    currentNode = getParentNode(currentNode);

    if (isElement(currentNode) && isContainingBlock(currentNode)) {
      return currentNode;
    }
  }

  return offsetParent;
}
