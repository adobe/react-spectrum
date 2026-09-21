/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getOwnerWindow} from './domHelpers';

/**
 * Returns whether a container establishes a containing block (of an element).
 * https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block.
 */
export function isContainingBlock(container: Element, element?: Element): boolean {
  let ownerWindow = getOwnerWindow(container);

  let containerStyle = ownerWindow.getComputedStyle(container);
  let contentStyle = element ? ownerWindow.getComputedStyle(element) : null;

  return (
    containerStyle.transform !== 'none' ||
    containerStyle.perspective !== 'none' ||
    containerStyle.filter !== 'none' ||
    /(transform|perspective|filter)/.test(containerStyle.willChange) ||
    /(layout|paint|strict|content)/.test(containerStyle.contain) ||
    ('backdropFilter' in containerStyle && containerStyle.backdropFilter !== 'none') ||
    ('WebkitBackdropFilter' in containerStyle && containerStyle.WebkitBackdropFilter !== 'none') ||
    (contentStyle?.position === 'absolute' && containerStyle.position !== 'static')
  );
}
