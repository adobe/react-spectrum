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

import {Direction} from '@react-types/shared';

export type RTLOffsetType =
  | 'negative'
  | 'positive-descending'
  | 'positive-ascending';

let cachedRTLResult: RTLOffsetType | null = null;


// Original licensing for the following methods can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/bvaughn/react-window/blob/master/src/createGridComponent.js

// According to the spec, scrollLeft should be negative for RTL aligned elements.
// Chrome does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
// Safari's elastic bounce makes detecting this even more complicated wrt potential false positives.
// The safest way to check this is to intentionally set a negative offset,
// and then verify that the subsequent "scroll" event matches the negative offset.
// If it does not match, then we can assume a non-standard RTL scroll implementation.
export function getRTLOffsetType(recalculate: boolean = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    const outerDiv = document.createElement('div');
    const outerStyle = outerDiv.style;
    outerStyle.width = '50px';
    outerStyle.height = '50px';
    outerStyle.overflow = 'scroll';
    outerStyle.direction = 'rtl';

    const innerDiv = document.createElement('div');
    const innerStyle = innerDiv.style;
    innerStyle.width = '100px';
    innerStyle.height = '100px';

    outerDiv.appendChild(innerDiv);

    document.body.appendChild(outerDiv);

    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = 'positive-descending';
    } else {
      outerDiv.scrollLeft = 1;
      if (outerDiv.scrollLeft === 0) {
        cachedRTLResult = 'negative';
      } else {
        cachedRTLResult = 'positive-ascending';
      }
    }

    document.body.removeChild(outerDiv);

    return cachedRTLResult;
  }

  return cachedRTLResult;
}

export function getScrollLeft(node: Element, direction: Direction): number {
  let {scrollLeft} = node;

  // scrollLeft in rtl locales differs across browsers, so normalize.
  // See comment by getRTLOffsetType below for details.
  if (direction === 'rtl') {
    let {scrollWidth, clientWidth} = node;
    switch (getRTLOffsetType()) {
      case 'negative':
        scrollLeft = -scrollLeft;
        break;
      case 'positive-descending':
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
    }
  }

  return scrollLeft;
}

export function setScrollLeft(node: Element, direction: Direction, scrollLeft: number) {
  if (direction === 'rtl') {
    switch (getRTLOffsetType()) {
      case 'negative':
        scrollLeft = -scrollLeft;
        break;
      case 'positive-ascending':
        break;
      default: {
        const {clientWidth, scrollWidth} = node;
        scrollLeft = scrollWidth - clientWidth - scrollLeft;
        break;
      }
    }
  }

  node.scrollLeft = scrollLeft;
}
