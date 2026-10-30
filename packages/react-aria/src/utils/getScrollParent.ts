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

import {genScrollParents, ScrollParentOptions} from './getScrollParents';
import {getOwnerDocument} from './domHelpers';
import {getScrollingElement} from './layoutHelpers';

/**
 * Returns the nearest (scrollable) ancestor of a given element.
 * https://drafts.csswg.org/cssom-view/#dom-htmlelement-scrollparent.
 */
export function getScrollParent(element: Element, options?: ScrollParentOptions): Element;
/** @deprecated Use 'getScrollParent(element, {scrollable: true})' instead. */
export function getScrollParent(element: Element, checkForOverflow?: boolean): Element;
export function getScrollParent(element: Element, options?: ScrollParentOptions | boolean) {
  if (typeof options === 'undefined' || typeof options === 'boolean') {
    return getScrollParent(element, {scrollable: options});
  }

  let ownerDocument = getOwnerDocument(element);

  let scrollGenerator = genScrollParents(element, {
    container: 'nearest',
    ...options
  });

  let scrollParent = scrollGenerator.next();

  // TODO(later): Fallback is a bug, remove after auditing call sites.
  return scrollParent.value ?? getScrollingElement(ownerDocument);
}
