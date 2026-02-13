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

/**
 * Returns the CSP nonce, if configured via a `<meta property="csp-nonce">` tag or `__webpack_nonce__`.
 * This allows dynamically injected `<style>` elements to work with Content Security Policy.
 */
export function getNonce(doc?: Document): string | undefined {
  let d = doc ?? (typeof document !== 'undefined' ? document : undefined);
  let meta = d
    ? d.querySelector('meta[property="csp-nonce"]') as HTMLMetaElement | null
    : null;
  return meta?.nonce || meta?.content || (globalThis as Record<string, any>)['__webpack_nonce__'] || undefined;
}
