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
import {getScrollLeft as get, getOffsetType, setScrollLeft as set} from '@react-aria/utils';

let cache: ReturnType<typeof getOffsetType> | null = null;

/** 
 * @deprecated
 */
export type RTLOffsetType = ReturnType<typeof getOffsetType>;

/** 
 * @deprecated Use `getOffsetType` from `@react-aria/utils` instead. 
 */
// TODO: Just return 'negative' here instead? Browsers aligned on RTL since Chrome 85+.
export function getRTLOffsetType(recalculate: boolean = false): ReturnType<typeof getOffsetType> {
  if (!cache || recalculate) {
    let el = document.createElement('div');
    el.dir = 'rtl';

    cache = getOffsetType(el, recalculate);
  }

  return cache;
}

/** 
 * @deprecated Use `getScrollLeft` from `@react-aria/utils` instead. 
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getScrollLeft(node: Element, direction: Direction): number {
  return get(node);
}

/** 
 * @deprecated Use `setScrollLeft` from `@react-aria/utils` instead. 
 */
export function setScrollLeft(node: Element, direction: Direction, scrollLeft: number): void {
  return set(node, scrollLeft);
}
