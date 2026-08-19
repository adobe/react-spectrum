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

import {getScrollParents} from './getScrollParents';
import {isIOS, isWebKit} from '../utils/platform';

interface ScrollIntoViewOpts {
  /** The position to align items along the block axis in. */
  block?: ScrollLogicalPosition;
  /** The position to align items along the inline axis in. */
  inline?: ScrollLogicalPosition;
}

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null;
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(
  scrollView: HTMLElement,
  element: HTMLElement,
  opts: ScrollIntoViewOpts = {}
): void {
  let {block = 'nearest', inline = 'nearest'} = opts;

  if (scrollView === element) {
    return;
  }

  let y = scrollView.scrollTop;
  let x = scrollView.scrollLeft;

  let target = element.getBoundingClientRect();
  let view = scrollView.getBoundingClientRect();
  let itemStyle = window.getComputedStyle(element);
  let viewStyle = window.getComputedStyle(scrollView);
  let root = document.scrollingElement || document.documentElement;
  let isRoot = scrollView === root;

  let viewTop = scrollView === root ? 0 : view.top;
  let viewBottom = scrollView === root ? scrollView.clientHeight : view.bottom;
  let viewLeft = scrollView === root ? 0 : view.left;
  let viewRight = scrollView === root ? scrollView.clientWidth : view.right;

  let scrollMarginTop = parseFloat(itemStyle.scrollMarginTop) || 0;
  let scrollMarginBottom = parseFloat(itemStyle.scrollMarginBottom) || 0;
  let scrollMarginLeft = parseFloat(itemStyle.scrollMarginLeft) || 0;
  let scrollMarginRight = parseFloat(itemStyle.scrollMarginRight) || 0;

  let scrollPaddingTop = parseFloat(viewStyle.scrollPaddingTop) || 0;
  let scrollPaddingBottom = parseFloat(viewStyle.scrollPaddingBottom) || 0;
  let scrollPaddingLeft = parseFloat(viewStyle.scrollPaddingLeft) || 0;
  let scrollPaddingRight = parseFloat(viewStyle.scrollPaddingRight) || 0;

  let borderTopWidth = parseFloat(viewStyle.borderTopWidth) || 0;
  let borderBottomWidth = parseFloat(viewStyle.borderBottomWidth) || 0;
  let borderLeftWidth = parseFloat(viewStyle.borderLeftWidth) || 0;
  let borderRightWidth = parseFloat(viewStyle.borderRightWidth) || 0;

  let scrollAreaTop = target.top - scrollMarginTop;
  let scrollAreaBottom = target.bottom + scrollMarginBottom;
  let scrollAreaLeft = target.left - scrollMarginLeft;
  let scrollAreaRight = target.right + scrollMarginRight;

  let scrollBarOffsetX = scrollView === root ? 0 : borderLeftWidth + borderRightWidth;
  let scrollBarOffsetY = scrollView === root ? 0 : borderTopWidth + borderBottomWidth;
  let scrollBarWidth =
    scrollView === root ? 0 : scrollView.offsetWidth - scrollView.clientWidth - scrollBarOffsetX;
  let scrollBarHeight =
    scrollView === root ? 0 : scrollView.offsetHeight - scrollView.clientHeight - scrollBarOffsetY;

  let scrollPortTop = viewTop + (isRoot ? 0 : borderTopWidth) + scrollPaddingTop;
  let scrollPortBottom =
    viewBottom - (isRoot ? 0 : borderBottomWidth) - scrollPaddingBottom - scrollBarHeight;
  let scrollPortLeft = viewLeft + (isRoot ? 0 : borderLeftWidth) + scrollPaddingLeft;
  let scrollPortRight = viewRight - (isRoot ? 0 : borderRightWidth) - scrollPaddingRight;

  // WebKit on iOS always positions the scrollbar on the right ¯\_(ツ)_/¯
  if ((isIOS() && isWebKit()) || viewStyle.direction === 'ltr') {
    scrollPortRight -= scrollBarWidth;
  } else if (viewStyle.direction === 'rtl') {
    scrollPortLeft += scrollBarWidth;
  }

  let shouldScrollBlock = scrollAreaTop < scrollPortTop || scrollAreaBottom > scrollPortBottom;
  let shouldScrollInline = scrollAreaLeft < scrollPortLeft || scrollAreaRight > scrollPortRight;

  if (shouldScrollBlock && block === 'start') {
    y += scrollAreaTop - scrollPortTop;
  } else if (shouldScrollBlock && block === 'center') {
    y += (scrollAreaTop + scrollAreaBottom) / 2 - (scrollPortTop + scrollPortBottom) / 2;
  } else if (shouldScrollBlock && block === 'end') {
    y += scrollAreaBottom - scrollPortBottom;
  } else if (shouldScrollBlock && block === 'nearest') {
    let start = scrollAreaTop - scrollPortTop;
    let end = scrollAreaBottom - scrollPortBottom;
    y += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (shouldScrollInline && inline === 'start') {
    x += scrollAreaLeft - scrollPortLeft;
  } else if (shouldScrollInline && inline === 'center') {
    x += (scrollAreaLeft + scrollAreaRight) / 2 - (scrollPortLeft + scrollPortRight) / 2;
  } else if (shouldScrollInline && inline === 'end') {
    x += scrollAreaRight - scrollPortRight;
  } else if (shouldScrollInline && inline === 'nearest') {
    let start = scrollAreaLeft - scrollPortLeft;
    let end = scrollAreaRight - scrollPortRight;
    x += Math.abs(start) <= Math.abs(end) ? start : end;
  }

  if (process.env.NODE_ENV === 'test') {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;
    return;
  }

  scrollView.scrollTo({left: x, top: y});
}

/**
 * Computes the visible scroll port of a scroll parent, accounting for borders,
 * scroll-padding, and scrollbars. Returns {top, bottom, left, right}.
 */
function getScrollPort(scrollView: HTMLElement): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  let root = document.scrollingElement || document.documentElement;
  let isRoot = scrollView === root || scrollView === document.body;
  let viewStyle = window.getComputedStyle(scrollView);

  let viewTop = 0;
  let viewBottom = 0;
  let viewLeft = 0;
  let viewRight = 0;

  if (isRoot) {
    viewBottom = scrollView.clientHeight;
    viewRight = scrollView.clientWidth;
  } else {
    let view = scrollView.getBoundingClientRect();
    viewTop = view.top;
    viewBottom = view.bottom;
    viewLeft = view.left;
    viewRight = view.right;
  }

  let scrollPaddingTop = parseFloat(viewStyle.scrollPaddingTop) || 0;
  let scrollPaddingBottom = parseFloat(viewStyle.scrollPaddingBottom) || 0;
  let scrollPaddingLeft = parseFloat(viewStyle.scrollPaddingLeft) || 0;
  let scrollPaddingRight = parseFloat(viewStyle.scrollPaddingRight) || 0;

  let borderTop = isRoot ? 0 : parseFloat(viewStyle.borderTopWidth) || 0;
  let borderBottom = isRoot ? 0 : parseFloat(viewStyle.borderBottomWidth) || 0;
  let borderLeft = isRoot ? 0 : parseFloat(viewStyle.borderLeftWidth) || 0;
  let borderRight = isRoot ? 0 : parseFloat(viewStyle.borderRightWidth) || 0;

  let scrollBarOffsetX = isRoot ? 0 : borderLeft + borderRight;
  let scrollBarOffsetY = isRoot ? 0 : borderTop + borderBottom;
  let scrollBarWidth = isRoot
    ? 0
    : scrollView.offsetWidth - scrollView.clientWidth - scrollBarOffsetX;
  let scrollBarHeight = isRoot
    ? 0
    : scrollView.offsetHeight - scrollView.clientHeight - scrollBarOffsetY;

  let portLeft = viewLeft + borderLeft + scrollPaddingLeft;
  let portRight = viewRight - borderRight - scrollPaddingRight;
  let portTop = viewTop + borderTop + scrollPaddingTop;
  let portBottom = viewBottom - borderBottom - scrollPaddingBottom - scrollBarHeight;

  let direction = viewStyle.direction;
  if (direction === 'rtl' && !isIOS()) {
    portLeft += scrollBarWidth;
  } else {
    portRight -= scrollBarWidth;
  }

  return {top: portTop, bottom: portBottom, left: portLeft, right: portRight};
}

/**
 * ScrollIntoViewIfNeeded(element, scrollView):
 * Implements the non-standard scrollIntoViewIfNeeded(false) algorithm using
 * direct pixel-delta math — no 'nearest' or 'center' alignment keywords.
 */
function scrollIntoViewIfNeeded(scrollView: HTMLElement, element: HTMLElement): boolean {
  if (scrollView === element) {
    return false;
  }

  let itemStyle = window.getComputedStyle(element);
  let target = element.getBoundingClientRect();

  let scrollMarginTop = parseFloat(itemStyle.scrollMarginTop) || 0;
  let scrollMarginBottom = parseFloat(itemStyle.scrollMarginBottom) || 0;
  let scrollMarginLeft = parseFloat(itemStyle.scrollMarginLeft) || 0;
  let scrollMarginRight = parseFloat(itemStyle.scrollMarginRight) || 0;

  let areaTop = target.top - scrollMarginTop;
  let areaBottom = target.bottom + scrollMarginBottom;
  let areaLeft = target.left - scrollMarginLeft;
  let areaRight = target.right + scrollMarginRight;

  let port = getScrollPort(scrollView);

  let isVisibleV = areaTop >= port.top && areaBottom <= port.bottom;
  let isVisibleH = areaLeft >= port.left && areaRight <= port.right;
  if (isVisibleV && isVisibleH) {
    return false;
  }

  let deltaY = 0;
  let deltaX = 0;

  if (!isVisibleV) {
    if (areaTop < port.top) {
      deltaY = areaTop - port.top;
    } else {
      deltaY = areaBottom - port.bottom;
    }
  }

  if (!isVisibleH) {
    if (areaLeft < port.left) {
      deltaX = areaLeft - port.left;
    } else {
      deltaX = areaRight - port.right;
    }
  }

  let newScrollTop = scrollView.scrollTop + deltaY;
  let newScrollLeft = scrollView.scrollLeft + deltaX;

  if (process.env.NODE_ENV === 'test') {
    scrollView.scrollTop = newScrollTop;
    scrollView.scrollLeft = newScrollLeft;
    return true;
  }

  scrollView.scrollTo({top: newScrollTop, left: newScrollLeft});
  return true;
}

/**
 * Returns true if `parent` is an ancestor of (or the same node as) `child`.
 */
function isAncestor(parent: Element, child: Node): boolean {
  let current: Node | null = child;
  while (current) {
    if (current === parent) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional
 * `opts.containingElement` that is used to limit which scroll parents are considered
 * internal to the component vs external.
 */
export function scrollIntoViewport(
  targetElement: Element | null,
  opts: ScrollIntoViewportOpts = {}
): void {
  let {containingElement} = opts;
  if (!targetElement || !targetElement.isConnected) {
    return;
  }

  let root = document.scrollingElement || document.documentElement;
  let isScrollPrevented = window.getComputedStyle(root).overflow === 'hidden';

  // Single pass: every scroll parent of containingElement is also a scroll parent of
  // targetElement (containingElement is an ancestor), so one getScrollParents call covers both.
  // Scroll parents inside containingElement are always processed; those outside skip root/body
  // when page scroll is prevented (e.g. an overlay has overflow:hidden on the root).
  let scrollParents = getScrollParents(targetElement, true);
  for (let scrollParent of scrollParents) {
    let isOuter = containingElement != null && !isAncestor(containingElement, scrollParent as Node);
    if (isOuter && isScrollPrevented && (scrollParent === root || scrollParent === document.body)) {
      continue;
    }
    if (scrollParent instanceof HTMLElement && targetElement instanceof HTMLElement) {
      scrollIntoViewIfNeeded(scrollParent, targetElement);
    }
  }
}
