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

interface ScrollIntoViewportOpts {
  /** The optional containing element of the target to be centered in the viewport. */
  containingElement?: Element | null
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(scrollView: HTMLElement, element: HTMLElement): void {
  let offsetX = relativeOffset(scrollView, element, 'left');
  let offsetY = relativeOffset(scrollView, element, 'top');
  let width = element.offsetWidth;
  let height = element.offsetHeight;
  let x = scrollView.scrollLeft;
  let y = scrollView.scrollTop;

  // Account for top/left border offsetting the scroll top/Left + scroll padding
  let {
    borderTopWidth,
    borderLeftWidth,
    scrollPaddingTop,
    scrollPaddingRight,
    scrollPaddingBottom,
    scrollPaddingLeft
  } = getComputedStyle(scrollView);

  // Account for scroll margin of the element
  let {
    scrollMarginTop,
    scrollMarginRight,
    scrollMarginBottom,
    scrollMarginLeft
  } = getComputedStyle(element);

  let borderAdjustedX = x + parseInt(borderLeftWidth, 10);
  let borderAdjustedY = y + parseInt(borderTopWidth, 10);
  // Ignore end/bottom border via clientHeight/Width instead of offsetHeight/Width
  let maxX = borderAdjustedX + scrollView.clientWidth;
  let maxY = borderAdjustedY + scrollView.clientHeight;

  // Get scroll padding / margin values as pixels - defaults to 0 if no scroll padding / margin
  // is used.
  let scrollPaddingTopNumber = parseInt(scrollPaddingTop, 10) || 0;
  let scrollPaddingBottomNumber = parseInt(scrollPaddingBottom, 10) || 0;
  let scrollPaddingRightNumber = parseInt(scrollPaddingRight, 10) || 0;
  let scrollPaddingLeftNumber = parseInt(scrollPaddingLeft, 10) || 0;
  let scrollMarginTopNumber = parseInt(scrollMarginTop, 10) || 0;
  let scrollMarginBottomNumber = parseInt(scrollMarginBottom, 10) || 0;
  let scrollMarginRightNumber = parseInt(scrollMarginRight, 10) || 0;
  let scrollMarginLeftNumber = parseInt(scrollMarginLeft, 10) || 0;

  let targetLeft = offsetX - scrollMarginLeftNumber;
  let targetRight = offsetX + width + scrollMarginRightNumber;
  let targetTop = offsetY - scrollMarginTopNumber;
  let targetBottom = offsetY + height + scrollMarginBottomNumber;

  let scrollPortLeft = x + parseInt(borderLeftWidth, 10) + scrollPaddingLeftNumber;
  let scrollPortRight = maxX - scrollPaddingRightNumber;
  let scrollPortTop = y + parseInt(borderTopWidth, 10) + scrollPaddingTopNumber;
  let scrollPortBottom = maxY - scrollPaddingBottomNumber;

  if (targetLeft > scrollPortLeft || targetRight < scrollPortRight) {
    if (targetLeft <= x + scrollPaddingLeftNumber) {
      x = targetLeft - parseInt(borderLeftWidth, 10) - scrollPaddingLeftNumber;
    } else if (targetRight > maxX - scrollPaddingRightNumber) {
      x += targetRight - maxX + scrollPaddingRightNumber;
    }
  }

  if (targetTop > scrollPortTop || targetBottom < scrollPortBottom) {
    if (targetTop <= borderAdjustedY + scrollPaddingTopNumber) {
      y = targetTop - parseInt(borderTopWidth, 10) - scrollPaddingTopNumber;
    } else if (targetBottom > maxY - scrollPaddingBottomNumber) {
      y += targetBottom - maxY + scrollPaddingBottomNumber;
    }
  }

  if (process.env.NODE_ENV === 'test') {
    scrollView.scrollLeft = x;
    scrollView.scrollTop = y;
    return;
  }

  scrollView.scrollTo({left: x, top: y});
}

/**
 * Computes the offset left or top from child to ancestor by accumulating
 * offsetLeft or offsetTop through intervening offsetParents.
 */
function relativeOffset(ancestor: HTMLElement, child: HTMLElement, axis: 'left'|'top') {
  const prop = axis === 'left' ? 'offsetLeft' : 'offsetTop';
  let sum = 0;
  while (child.offsetParent) {
    sum += child[prop];
    if (child.offsetParent === ancestor) {
      // Stop once we have found the ancestor we are interested in.
      break;
    } else if (child.offsetParent.contains(ancestor)) {
      // If the ancestor is not `position:relative`, then we stop at
      // _its_ offset parent, and we subtract off _its_ offset, so that
      // we end up with the proper offset from child to ancestor.
      sum -= ancestor[prop];
      break;
    }
    child = child.offsetParent as HTMLElement;
  }
  return sum;
}

/**
 * Scrolls the `targetElement` so it is visible in the viewport. Accepts an optional `opts.containingElement`
 * that will be centered in the viewport prior to scrolling the targetElement into view. If scrolling is prevented on
 * the body (e.g. targetElement is in a popover), this will only scroll the scroll parents of the targetElement up to but not including the body itself.
 */
export function scrollIntoViewport(targetElement: Element | null, opts?: ScrollIntoViewportOpts): void {
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
        opts?.containingElement?.scrollIntoView?.({block: 'center', inline: 'center'});
        targetElement.scrollIntoView?.({block: 'nearest'});
      }
    } else {
      let scrollParents = getScrollParents(targetElement);
      // If scrolling is prevented, we don't want to scroll the body since it might move the overlay partially offscreen and the user can't scroll it back into view.
      for (let scrollParent of scrollParents) {
        scrollIntoView(scrollParent as HTMLElement, targetElement as HTMLElement);
      }
    }
  }
}
