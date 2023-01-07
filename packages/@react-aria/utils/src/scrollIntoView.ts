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

import {getScrollParent} from './';

let isScrollPrevented = false;

export function setScrollPrevented(value: boolean) {
  isScrollPrevented = value;
}

/**
 * Scrolls `scrollView` so that `element` is visible.
 * Similar to `element.scrollIntoView({block: 'nearest'})` (not supported in Edge),
 * but doesn't affect parents above `scrollView`.
 */
export function scrollIntoView(scrollView: HTMLElement, element: HTMLElement) {
  let offsetX = relativeOffset(scrollView, element, 'left');
  let offsetY = relativeOffset(scrollView, element, 'top');
  let width = element.offsetWidth;
  let height = element.offsetHeight;
  let x = scrollView.scrollLeft;
  let y = scrollView.scrollTop;
  let maxX = x + scrollView.offsetWidth;
  let maxY = y + scrollView.offsetHeight;
  if (offsetX <= x) {
    x = offsetX;
  } else if (offsetX + width > maxX) {
    x += offsetX + width - maxX;
  }
  if (offsetY <= y) {
    y = offsetY;
  } else if (offsetY + height > maxY) {
    y += offsetY + height - maxY;
  }

  scrollView.scrollLeft = x;
  scrollView.scrollTop = y;
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

export function scrollIntoViewFully(target: Element, scrollOptions?: ScrollIntoViewOptions) {
  if (scrollOptions == null) {
    scrollOptions = {
      block: 'nearest'
    };
  }

  if (shouldScrollIntoView(target)) {
    scrollIntoViewHelper(target, scrollOptions);
  }
}

// TODO: use Rect from stately and perhaps add getPercentageOutofView to Rect's methods
// Determines if a the target rect intersects the container rect
function intersects(targetRect, containerRect): boolean {
  return targetRect.x <= containerRect.x + containerRect.width
      && containerRect.x <= targetRect.x + targetRect.width
      && targetRect.y <= containerRect.y + containerRect.height
      && containerRect.y <= targetRect.y + targetRect.height;
}

// Determines if the container rect contains the target rect
function containsRect(targetRect, containerRect): boolean {
  return containerRect.x <= targetRect.x
      && containerRect.y <= targetRect.y
      && containerRect.x + containerRect.width >= targetRect.x + targetRect.width
      && containerRect.y + containerRect.height >= targetRect.y + targetRect.height;
}

// Get the percentage that the target rect is outside the container
// TODO: think about if I should just do percentage out of view for just the x direction and y direction instead of
// doing an area percentage diff. Also note that this approach really only works with block: nearest since block:nearest isn't very
// aggressive in its scroll adjustments when bringing a item into view. block: center wouldn't really work for Table rows which
// can have a large percentage outside of the viewport even if the whole table fits in the viewport
function getPercentageOutOfView(targetRect, containerRect): number {
  if (!intersects(targetRect, containerRect)) {
    if (!containsRect(targetRect, containerRect)) {
      return 100;
    } else {
      return 0;
    }
  }

  let x = Math.max(targetRect.x, containerRect.x);
  let y = Math.max(targetRect.y, containerRect.y);
  let width = Math.min(targetRect.x + targetRect.width, containerRect.x + containerRect.width) - x;
  let height = Math.min(targetRect.y + targetRect.height, containerRect.y + containerRect.height) - y;
  return  (1 - ((width * height) / (targetRect.width * targetRect.height))) * 100;
}

// Determines if a target element is fully out of view and thus should be scrolled into view if possible.
// Recurses through every scrollable parent of the target and returns true the target is not visible in any of the scrollable parents.
function shouldScrollIntoView(target: Element, scrollContainer?: Element) {
  let root = document.scrollingElement || document.documentElement;
  if (target === root || target == null) {
    return false;
  }

  // Note: there are cases where the target can be out of view but doesn't have a scrollable parent that would accurately determine
  // if it is out of view. Example: the table resizer is absolutely positioned and can be moved out of view but the scrollable element
  // to check would the table's body since the column headers aren't scrollable. However, the table body isn't a scrollable parent of the resizer and thus this function
  // fails to determine that the resizer should be scrolled into view.
  let scrollParent = scrollContainer || getScrollParent(target);
  let scrollIntoView = false;

  let targetRect = target.getBoundingClientRect();
  while (root.contains(scrollParent) && !scrollIntoView) {
    let containerRect;
    if (scrollParent === root) {
      // Account for pinch zooming on mobile devices
      let viewportTop = window.visualViewport?.offsetTop ?? 0;
      let viewportLeft = window.visualViewport?.offsetLeft ?? 0;
      let viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      let viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      let viewportRect = {width: viewportWidth, height: viewportHeight, x: viewportLeft, y: viewportTop};

      // TODO: consider configurable tolerence value here
      return getPercentageOutOfView(targetRect, viewportRect) > 10;
    } else {
      containerRect = scrollParent.getBoundingClientRect();
    }

    scrollIntoView = getPercentageOutOfView(targetRect, containerRect) > 10;
    scrollParent = getScrollParent(scrollParent);
  }

  return scrollIntoView;
}

function scrollIntoViewHelper(target: Element, scrollOptions: ScrollIntoViewOptions) {
  // If scrolling is not currently prevented then we aren’t in a overlay nor is a overlay open, just use element.scrollIntoView to bring the element into view
  if (!isScrollPrevented) {
    target?.scrollIntoView?.(scrollOptions);
  } else {
    let root = document.scrollingElement || document.documentElement;
    let scrollParent = getScrollParent(target);
    // If scrolling is prevented, we don't want to scroll the body since it might move the overlay partially offscreen and the user can't scroll it back into view.
    while (target && scrollParent && target !== root && scrollParent !== root) {
      scrollIntoView(scrollParent as HTMLElement, target as HTMLElement);
      target = scrollParent;
      scrollParent = getScrollParent(target);
    }
  }
}
