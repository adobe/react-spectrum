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

let cachedNonce: string | undefined;
let cachePopulated = false;

/** Reset the cached nonce value. Exported for testing only. */
export function resetNonceCache(): void {
  cachedNonce = undefined;
  cachePopulated = false;
}

/**
 * Returns the CSP nonce, if configured via a `<meta property="csp-nonce">` tag or `__webpack_nonce__`.
 * This allows dynamically injected `<style>` elements to work with Content Security Policy.
 */
export function getNonce(doc?: Document): string | undefined {
  if (!doc && cachePopulated) {
    return cachedNonce;
  }

  let d = doc ?? (typeof document !== 'undefined' ? document : undefined);
  let meta = d
    ? d.querySelector('meta[property="csp-nonce"]')
    : null;
  let nonce = (meta && meta instanceof getOwnerWindow(meta).HTMLMetaElement && (meta?.nonce || meta?.content)) || globalThis['__webpack_nonce__'] || undefined;

  if (!doc) {
    cachedNonce = nonce;
    cachePopulated = true;
  }

  return nonce;
}
