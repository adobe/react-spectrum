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

const cache = new WeakMap<Element, ReturnType<typeof getOffsetType>>();

// Original licensing for the following methods can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/bvaughn/react-window/blob/master/lib/utils/getRTLOffsetType.ts

// According to the spec, scrollLeft should be negative for RTL aligned elements.
// Chrome <= 85 does not seem to adhere; its scrollLeft values are positive (measured relative to the left).
// Safari's elastic bounce makes detecting this even more complicated with potential false positives.
// The safest way to check this is to intentionally set a negative offset,
// and then verify that the subsequent "scroll" event matches the negative offset.
// If it does not match, then we can assume a non-standard RTL scroll implementation.
export function getOffsetType(element: Element, recalculate: boolean = false): 'negative' | 'positive-descending' | 'positive-ascending' {
  let offsetType = cache.get(element);

  if (!offsetType || recalculate) {
    let {direction, flexDirection} = getComputedStyle(element);

    let axis = flexDirection.startsWith('row') ? 'scrollLeft' : 'scrollTop';

    let container = document.createElement('div');
    container.style.width = '50px';
    container.style.height = '50px';
    container.style.display = 'flex';
    container.style.overflow = 'scroll';
    container.style.direction = direction;
    container.style.flexDirection = flexDirection;

    let child = document.createElement('div');
    child.style.width = '100px';
    child.style.height = '100px';
    child.style.flexShrink = '0';

    container.appendChild(child);
    document.body.appendChild(container);

    if (container[axis] > 0) {
      offsetType = 'positive-descending';
    } else {
      container[axis] = 1;
      offsetType = container[axis] > 0 ? 'positive-ascending' : 'negative';
    }

    cache.set(element, offsetType);
    document.body.removeChild(container);
  }

  return offsetType;
}
