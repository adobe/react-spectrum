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

export function getScrollParent(node: Element, checkForOverflow?: boolean): Element {
  let scrollableNode: Element | null = node;
  if (isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  while (scrollableNode && !isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  return scrollableNode || document.scrollingElement || document.documentElement;
}

export function isScrollable(node: Element, checkForOverflow?: boolean): boolean {
  let style = window.getComputedStyle(node);
  let isScrollable = /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);

  if (isScrollable && checkForOverflow) {
    isScrollable = node.scrollHeight !== node.clientHeight || node.scrollWidth !== node.clientWidth;
  }

  return isScrollable;
}
