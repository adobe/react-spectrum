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

import {isFocusable, isTabbable} from '../../src/utils/isFocusable';

describe('isFocusable', () => {
  it('detects focusable elements in the document', () => {
    let button = document.createElement('button');
    document.body.appendChild(button);
    expect(isFocusable(button)).toBe(true);
    document.body.removeChild(button);
  });

  describe('detached nodes (ownerDocument.defaultView === null)', () => {
    let detachedDocument: Document;

    beforeEach(() => {
      detachedDocument = document.implementation.createHTMLDocument('');
      // Sanity check that we are reproducing the detached condition.
      expect(detachedDocument.defaultView).toBe(null);
    });

    it('does not throw for isFocusable', () => {
      let button = detachedDocument.createElement('button');
      detachedDocument.body.appendChild(button);
      // Matches how the dev-only effect in useFocusable calls isFocusable (no options).
      expect(() => isFocusable(button)).not.toThrow();
      expect(() => isFocusable(button, {skipVisibilityCheck: true})).not.toThrow();
      expect(isFocusable(button, {skipVisibilityCheck: true})).toBe(true);
    });

    it('does not throw for isTabbable', () => {
      let button = detachedDocument.createElement('button');
      detachedDocument.body.appendChild(button);
      expect(() => isTabbable(button)).not.toThrow();
    });

    it('does not throw when an ancestor is inert', () => {
      let wrapper = detachedDocument.createElement('div');
      wrapper.inert = true;
      let button = detachedDocument.createElement('button');
      wrapper.appendChild(button);
      detachedDocument.body.appendChild(wrapper);
      expect(() => isFocusable(button, {skipVisibilityCheck: true})).not.toThrow();
    });
  });
});
