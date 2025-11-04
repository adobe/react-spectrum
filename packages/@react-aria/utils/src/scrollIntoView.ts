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
import {isChrome} from './platform';

interface ScrollIntoViewOpts {
  /** The position to align items along the block axis in. */
  block?: ScrollLogicalPosition,
  /** The position to align items along the inline axis in. */
  inline?: ScrollLogicalPosition
}

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(scrollView: HTMLElement, element: HTMLElement, opts: ScrollIntoViewOpts = {}): void {
  let {block = 'nearest', inline = 'nearest'} = opts;

  if (scrollView === element) { return; }

  let y = scrollView.scrollTop;
  let x = scrollView.scrollLeft;

  let target = element.getBoundingClientRect();
  let view = scrollView.getBoundingClientRect();
  let itemStyle = window.getComputedStyle(element);
  let viewStyle = window.getComputedStyle(scrollView);
  let root = document.scrollingElement || document.documentElement;

  let viewTop = scrollView === root ? 0 : view.top;
  let viewBottom = scrollView === root ? scrollView.clientHeight : view.bottom;
  let viewLeft = scrollView === root ? 0 : view.left;
  let viewRight = scrollView === root ? scrollView.clientWidth : view.right;

  let scrollMarginTop = parseInt(itemStyle.scrollMarginTop, 10) || 0;
  let scrollMarginBottom = parseInt(itemStyle.scrollMarginBottom, 10) || 0;
  let scrollMarginLeft = parseInt(itemStyle.scrollMarginLeft, 10) || 0;
  let scrollMarginRight = parseInt(itemStyle.scrollMarginRight, 10) || 0;

  let scrollPaddingTop = parseInt(itemStyle.scrollPaddingTop, 10) || 0;
  let scrollPaddingBottom = parseInt(itemStyle.scrollPaddingBottom, 10) || 0;
  let scrollPaddingLeft = parseInt(itemStyle.scrollPaddingLeft, 10) || 0;
  let scrollPaddingRight = parseInt(itemStyle.scrollPaddingRight, 10) || 0;

  let borderTopWidth = parseInt(viewStyle.borderTopWidth, 10) || 0;
  let borderBottomWidth = parseInt(viewStyle.borderBottomWidth, 10) || 0;
  let borderLeftWidth = parseInt(viewStyle.borderLeftWidth, 10) || 0;
  let borderRightWidth = parseInt(viewStyle.borderRightWidth, 10) || 0;

  let scrollAreaTop = target.top - scrollMarginTop;
  let scrollAreaBottom = target.bottom + scrollMarginBottom;
  let scrollAreaLeft = target.left - scrollMarginLeft;
  let scrollAreaRight = target.right + scrollMarginRight;

  let scrollPortTop = viewTop + borderTopWidth + scrollPaddingTop;
  let scrollPortBottom = viewBottom - borderBottomWidth - scrollPaddingBottom;
  let scrollPortLeft = viewLeft + borderLeftWidth + scrollPaddingLeft;
  let scrollPortRight = viewRight - borderRightWidth - scrollPaddingRight;

  let shouldScrollBlock = scrollAreaTop < scrollPortTop || scrollAreaBottom > scrollPortBottom;
  let shouldScrollInline = scrollAreaLeft < scrollPortLeft || scrollAreaRight > scrollPortRight;

  if (shouldScrollBlock && block === 'start') {
    y += scrollAreaLeft - scrollPortLeft;
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
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional `opts.containingElement`
 * that will be centered in the viewport prior to scrolling the targetElement into view. If scrolling is prevented on
 * the body (e.g. targetElement is in a popover), this will only scroll the scroll parents of the targetElement up to but not including the body itself.
 */
export function scrollIntoViewport(targetElement: Element | null, opts: ScrollIntoViewportOpts = {}): void {
  let {containingElement} = opts;
  if (targetElement && document.contains(targetElement)) {
    let root = document.scrollingElement || document.documentElement;
    let isScrollPrevented = window.getComputedStyle(root).overflow === 'hidden';
    // If scrolling is not currently prevented then we aren't in a overlay nor is a overlay open, just use element.scrollIntoView to bring the element into view
    // Also ignore in chrome because of this bug: https://issues.chromium.org/issues/40074749
    if (!isScrollPrevented && !isChrome()) {
      let {left: originalLeft, top: originalTop} = targetElement.getBoundingClientRect();

      // use scrollIntoView({block: 'nearest'}) instead of .focus to check if the element is fully in view or not since .focus()
      // won't cause a scroll if the element is already focused and doesn't behave consistently when an element is partially out of view horizontally vs vertically
      targetElement?.scrollIntoView?.({block: 'nearest'});
      let {left: newLeft, top: newTop} = targetElement.getBoundingClientRect();
      // Account for sub pixel differences from rounding
      if ((Math.abs(originalLeft - newLeft) > 1) || (Math.abs(originalTop - newTop) > 1)) {
        containingElement?.scrollIntoView?.({block: 'center', inline: 'center'});
        targetElement.scrollIntoView?.({block: 'nearest'});
      }
    } else {
      let {left: originalLeft, top: originalTop} = targetElement.getBoundingClientRect();

      // If scrolling is prevented, we don't want to scroll the body since it might move the overlay partially offscreen and the user can't scroll it back into view.
      let scrollParents = getScrollParents(targetElement, true);
      for (let scrollParent of scrollParents) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
      }
      let {left: newLeft, top: newTop} = targetElement.getBoundingClientRect();
      // Account for sub pixel differences from rounding
      if ((Math.abs(originalLeft - newLeft) > 1) || (Math.abs(originalTop - newTop) > 1)) {
        scrollParents = containingElement ? getScrollParents(containingElement, true) : [];
        for (let scrollParent of scrollParents) {
          scrollIntoView(scrollParent as HTMLElement, containingElement as HTMLElement, {block: 'center', inline: 'center'});
        }
      }
    }
  }
}
