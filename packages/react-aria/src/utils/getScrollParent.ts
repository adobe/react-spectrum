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

import {genScrollParents} from './getScrollParents';
import {getOwnerDocument} from './domHelpers';
import {getScrollingElement} from './layoutHelpers';

/**
 * Returns the (scrollable) parent container for a given scroll alignment query.
 *
 * @deprecated Use 'getScrollTarget(element.parentElement)' instead.
 */
export function getScrollParent(element: Element, checkForOverflow?: boolean): Element {
  let ownerDocument = getOwnerDocument(element);

  let generator = genScrollParents(element, {
    scrollable: checkForOverflow,
    container: 'nearest'
  });

  let cursor = generator.next();

  // Fallback is a bug, but is kept for backwards compatibility.
  return cursor.value ?? getScrollingElement(ownerDocument);
}
