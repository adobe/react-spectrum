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

import {getMetaValue} from '../../src/utils/getMetaValue';

describe('getMetaValue', () => {
  afterEach(() => {
    document.querySelectorAll('meta').forEach(el => el.remove());
    delete globalThis['__webpack_nonce__'];
  });

  it('returns undefined when no matching meta tag exists', () => {
    expect(getMetaValue('theme-color')).toBeUndefined();
  });

  it('reads a value from the name attribute for an arbitrary key', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#ff0000');
    document.head.appendChild(meta);

    expect(getMetaValue('theme-color')).toBe('#ff0000');
  });

  it('reads a value from the property attribute for an arbitrary key', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    meta.setAttribute('content', 'Hello');
    document.head.appendChild(meta);

    expect(getMetaValue('og:title')).toBe('Hello');
  });

  it('does not fall back to __webpack_nonce__ for non-nonce keys', () => {
    globalThis['__webpack_nonce__'] = 'webpack-nonce';

    expect(getMetaValue('theme-color')).toBeUndefined();
  });

  it('escapes special characters in the key when building the selector', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('name', 'my:weird.key');
    meta.setAttribute('content', 'escaped');
    document.head.appendChild(meta);

    expect(getMetaValue('my:weird.key')).toBe('escaped');
  });
});
