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

import {FocusableElement} from '@react-types/shared';

// This is a polyfill for element.focus({preventScroll: true});
// Currently necessary for Safari and old Edge:
// https://caniuse.com/#feat=mdn-api_htmlelement_focus_preventscroll_option
// See https://bugs.webkit.org/show_bug.cgi?id=178583
//

// Original licensing for the following methods can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/calvellido/focus-options-polyfill

interface ScrollableElement {
  element: HTMLElement,
  scrollTop: number,
  scrollLeft: number
}

export function focusWithoutScrolling(element: FocusableElement) {
  if (supportsPreventScroll()) {
    element.focus({preventScroll: true});
  } else {
    let scrollableElements = getScrollableElements(element);
    element.focus();
    restoreScrollPosition(scrollableElements);
  }
}

let supportsPreventScrollCached: boolean | null = null;
function supportsPreventScroll() {
  if (supportsPreventScrollCached == null) {
    supportsPreventScrollCached = false;
    try {
      let focusElem = document.createElement('div');
      focusElem.focus({
        get preventScroll() {
          supportsPreventScrollCached = true;
          return true;
        }
      });
    } catch (e) {
      // Ignore
    }
  }

  return supportsPreventScrollCached;
}

function getScrollableElements(element: FocusableElement): ScrollableElement[] {
  let parent = element.parentNode;
  let scrollableElements: ScrollableElement[] = [];
  let rootScrollingElement = document.scrollingElement || document.documentElement;

  while (parent instanceof HTMLElement && parent !== rootScrollingElement) {
    if (
      parent.offsetHeight < parent.scrollHeight ||
      parent.offsetWidth < parent.scrollWidth
    ) {
      scrollableElements.push({
        element: parent,
        scrollTop: parent.scrollTop,
        scrollLeft: parent.scrollLeft
      });
    }
    parent = parent.parentNode;
  }

  if (rootScrollingElement instanceof HTMLElement) {
    scrollableElements.push({
      element: rootScrollingElement,
      scrollTop: rootScrollingElement.scrollTop,
      scrollLeft: rootScrollingElement.scrollLeft
    });
  }

  return scrollableElements;
}

function restoreScrollPosition(scrollableElements: ScrollableElement[]) {
  for (let {element, scrollTop, scrollLeft} of scrollableElements) {
    element.scrollTop = scrollTop;
    element.scrollLeft = scrollLeft;
  }
}
