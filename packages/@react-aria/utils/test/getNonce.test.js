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

import {getNonce} from '../';

describe('getNonce', () => {
  afterEach(() => {
    document.querySelectorAll('meta[property="csp-nonce"]').forEach(el => el.remove());
    delete globalThis['__webpack_nonce__'];
  });

  it('returns undefined when no nonce is configured', () => {
    expect(getNonce()).toBeUndefined();
  });

  it('reads nonce from meta tag nonce attribute', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'test-nonce-123';
    document.head.appendChild(meta);

    expect(getNonce()).toBe('test-nonce-123');
  });

  it('reads nonce from meta tag content attribute', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.setAttribute('content', 'content-nonce-456');
    document.head.appendChild(meta);

    expect(getNonce()).toBe('content-nonce-456');
  });

  it('reads nonce from __webpack_nonce__ global', () => {
    globalThis['__webpack_nonce__'] = 'webpack-nonce-789';

    expect(getNonce()).toBe('webpack-nonce-789');
  });

  it('prefers meta tag nonce over __webpack_nonce__', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'meta-nonce';
    document.head.appendChild(meta);
    globalThis['__webpack_nonce__'] = 'webpack-nonce';

    expect(getNonce()).toBe('meta-nonce');
  });
});
