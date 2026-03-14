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
import {resetNonceCache} from '../src/getNonce';

describe('getNonce', () => {
  afterEach(() => {
    document.querySelectorAll('meta[property="csp-nonce"]').forEach(el => el.remove());
    document.querySelectorAll('iframe').forEach(el => el.remove());
    delete globalThis['__webpack_nonce__'];
    resetNonceCache();
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

  it('prefers nonce attribute over content attribute on the same meta tag', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'nonce-attr';
    meta.setAttribute('content', 'content-attr');
    document.head.appendChild(meta);

    expect(getNonce()).toBe('nonce-attr');
  });

  it('caches the nonce per document', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'cached-nonce';
    document.head.appendChild(meta);

    expect(getNonce()).toBe('cached-nonce');

    // Remove the meta tag — cached value should still be returned
    meta.remove();
    expect(getNonce()).toBe('cached-nonce');
  });

  it('resetNonceCache clears the cached value', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'first-nonce';
    document.head.appendChild(meta);

    expect(getNonce()).toBe('first-nonce');

    // Change the nonce and clear the cache
    meta.nonce = 'second-nonce';
    resetNonceCache();

    expect(getNonce()).toBe('second-nonce');
  });

  it('treats empty string nonce as no nonce', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = '';
    meta.setAttribute('content', '');
    document.head.appendChild(meta);

    expect(getNonce()).toBeUndefined();
  });

  it('falls back to content when nonce attribute is empty', () => {
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = '';
    meta.setAttribute('content', 'content-fallback');
    document.head.appendChild(meta);

    expect(getNonce()).toBe('content-fallback');
  });

  it('does not cache a missing nonce', () => {
    // First call: no nonce configured — should return undefined
    expect(getNonce()).toBeUndefined();

    // Now set a nonce — it should be picked up because undefined wasn't cached
    globalThis['__webpack_nonce__'] = 'late-nonce';
    expect(getNonce()).toBe('late-nonce');
  });

  it('detects a meta nonce added after an initial miss', () => {
    // First call: no meta tag — should return undefined
    expect(getNonce()).toBeUndefined();

    // Add a meta tag after the initial miss
    let meta = document.createElement('meta');
    meta.setAttribute('property', 'csp-nonce');
    meta.nonce = 'late-meta-nonce';
    document.head.appendChild(meta);

    expect(getNonce()).toBe('late-meta-nonce');
  });

  it('reads __webpack_nonce__ from the provided document window', () => {
    let iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    // Set different nonces on parent and iframe windows
    globalThis['__webpack_nonce__'] = 'parent-nonce';
    iframe.contentWindow['__webpack_nonce__'] = 'iframe-nonce';

    // When given the iframe's document, should prefer the iframe's nonce
    expect(getNonce(iframe.contentDocument)).toBe('iframe-nonce');
  });
});
