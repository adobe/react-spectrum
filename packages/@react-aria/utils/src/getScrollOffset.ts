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

import {getOffsetType} from './getOffsetType';

function getScrollOffset(element: Element, axis: 'left' | 'top', allowOverscroll = true): number {
  let size = element[axis === 'left' ? 'scrollWidth' : 'scrollHeight'];
  let rect = element[axis === 'left' ? 'clientWidth' : 'clientHeight'];
  let offset = element[axis === 'left' ? 'scrollLeft' : 'scrollTop'];

  switch (getOffsetType(element)) {
    case 'negative':
      offset = Math.abs(allowOverscroll ? offset : Math.min(0, offset));
      break;
    case 'positive-ascending':
      offset = allowOverscroll ? offset : Math.max(0, offset);
      break;
    case 'positive-descending':
      offset = size - rect - offset;
      offset = allowOverscroll ? offset : Math.max(0, offset);
      break;
  }

  return allowOverscroll ? offset : Math.min(size - rect, offset);
}

function setScrollOffset(element: Element, axis: 'left' | 'top', offset: number): void {
  let scrollWidth = element[axis === 'left' ? 'scrollWidth' : 'scrollHeight'];
  let clientWidth = element[axis === 'left' ? 'clientWidth' : 'clientHeight'];

  switch (getOffsetType(element)) {
    case 'negative':
      offset = Math.abs(offset) * -1;
      break;
    case 'positive-ascending':
      offset = Math.abs(offset);
      break;
    case 'positive-descending':
      offset = scrollWidth - clientWidth - Math.abs(offset);
      break;
  }

  element.scrollLeft = offset;
}

export function getScrollLeft(element: Element, allowOverscroll = true): number {
  return getScrollOffset(element, 'left', allowOverscroll);
}

export function setScrollLeft(element: Element, scrollLeft: number): void {
  return setScrollOffset(element, 'left', scrollLeft);
}

export function getScrollTop(element: Element, allowOverscroll = true): number {
  return getScrollOffset(element, 'top', allowOverscroll);
}

export function setScrollTop(element: Element, scrollTop: number): void {
  return setScrollOffset(element, 'top', scrollTop);
}
