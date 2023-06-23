/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {isWebKit} from '@react-aria/utils';

interface Modifiers {
  metaKey?: boolean,
  ctrlKey?: boolean,
  altKey?: boolean,
  shiftKey?: boolean
}

export function openLink(target: HTMLAnchorElement, modifiers: Modifiers) {
  let {metaKey, ctrlKey, altKey, shiftKey} = modifiers;
  // WebKit does not support firing click events with modifier keys, but does support keyboard events.
  // https://github.com/WebKit/WebKit/blob/c03d0ac6e6db178f90923a0a63080b5ca210d25f/Source/WebCore/html/HTMLAnchorElement.cpp#L184
  let event = isWebKit() && process.env.NODE_ENV !== 'test'
    // @ts-ignore - keyIdentifier is a non-standard property, but it's what webkit expects
    ? new KeyboardEvent('keydown', {keyIdentifier: 'Enter', metaKey, ctrlKey, altKey, shiftKey})
    : new MouseEvent('click', {metaKey, ctrlKey, altKey, shiftKey, bubbles: true});
  target.dispatchEvent(event);
}
