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

import {getOwnerDocument, getOwnerWindow} from './domHelpers';

export function getMetaValue(key: string, doc?: Document): string | undefined {
  let ownerWindow = getOwnerWindow(doc);
  let ownerDocument = getOwnerDocument(doc);

  if (ownerDocument == null || ownerWindow == null) {
    return;
  }

  let content: string | undefined = undefined;
  let selector = `meta[name="${CSS.escape(key)}"], meta[property="${CSS.escape(key)}"]`;
  let meta = ownerDocument.querySelector(selector);

  if (meta && meta instanceof ownerWindow.HTMLMetaElement) {
    if (key === 'csp-nonce' && meta.nonce) {
      content ??= meta.nonce || undefined;
    }

    if (meta.content) {
      content ??= meta.content || undefined;
    }
  }

  if (key === 'csp-nonce') {
    content ??= ownerWindow.__webpack_nonce__ || globalThis.__webpack_nonce__ || undefined;
  }

  return content;
}
