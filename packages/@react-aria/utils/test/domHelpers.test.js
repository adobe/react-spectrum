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


import {getOwnerDocument, getOwnerWindow} from '../';
import React, {createRef} from 'react';
import {render} from '@react-spectrum/test-utils-internal';

describe('getOwnerDocument', () => {
  test.each([null, undefined])('returns the document if the argument is %p', (value) => {
    expect(getOwnerDocument(value)).toBe(document);
  });

  it('returns the document if the element is in the document', () => {
    const div = document.createElement('div');
    window.document.body.appendChild(div);
    expect(getOwnerDocument(div)).toBe(document);
  });

  it('returns the document if object passed in does not have an ownerdocument', () => {
    const div = document.createElement('div');
    expect(getOwnerDocument(div)).toBe(document);
  });

  it('returns the document if nothing is passed in', () => {
    expect(getOwnerDocument()).toBe(document);
    expect(getOwnerDocument(null)).toBe(document);
    expect(getOwnerDocument(undefined)).toBe(document);
  });

  it('returns the document if ref exists, but is not associated with an element', () => {
    const ref = createRef();

    expect(getOwnerDocument(ref.current)).toBe(document);
  });

  it("returns the iframe's document if the element is in an iframe", () => {
    const iframe = document.createElement('iframe');
    const iframeDiv = document.createElement('div');
    window.document.body.appendChild(iframe);
    iframe.contentWindow.document.body.appendChild(iframeDiv);

    expect(getOwnerDocument(iframeDiv)).not.toBe(document);
    expect(getOwnerDocument(iframeDiv)).toBe(iframe.contentWindow.document);
    expect(getOwnerDocument(iframeDiv)).toBe(iframe.contentDocument);

    // Teardown
    iframe.remove();
  });

  it("returns the iframe's document if the ref is in an iframe", () => {
    const ref = createRef();
    const iframe = document.createElement('iframe');
    const iframeDiv = document.createElement('div');
    window.document.body.appendChild(iframe);
    iframe.contentWindow.document.body.appendChild(iframeDiv);

    render(<div ref={ref} />, {
      container: iframeDiv
    });

    expect(getOwnerDocument(ref.current)).not.toBe(document);
    expect(getOwnerDocument(ref.current)).toBe(iframe.contentWindow.document);
    expect(getOwnerDocument(ref.current)).toBe(iframe.contentDocument);
  });

});

describe('getOwnerWindow', () => {
  test.each([null, undefined])('returns the window if the argument is %p', (value) => {
    expect(getOwnerWindow(value)).toBe(window);
  });

  it('returns the window if the element is in the window', () => {
    const div = document.createElement('div');
    window.document.body.appendChild(div);
    expect(getOwnerWindow(div)).toBe(window);
  });

  it('returns the window if the element is the window', () => {
    expect(getOwnerWindow(window)).toBe(window);
  });

  it("returns the iframe's window if the element is in the iframe", () => {
    const iframe = document.createElement('iframe');
    const iframeDiv = document.createElement('div');
    window.document.body.appendChild(iframe);
    iframe.contentWindow.document.body.appendChild(iframeDiv);

    expect(getOwnerWindow(iframeDiv)).toBe(iframe.contentWindow);

    // Teardown
    iframe.remove();
  });
});
