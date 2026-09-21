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

import {act} from 'react-dom/test-utils';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {getActiveElement} from '../../src/utils/shadowdom/DOMFunctions';
import {getOwnerDocument, getOwnerWindow, setStyle} from '../../src/utils/domHelpers';

describe('getOwnerDocument', () => {
  beforeAll(() => {
    enableShadowDOM();
  });
  test.each([null, undefined])('returns the document if the argument is %p', value => {
    expect(getOwnerDocument(value)).toBe(document);
  });

  it('returns the document if the argument is the document', () => {
    expect(getOwnerDocument(document)).toBe(document);
  });

  it('returns the document if the argument is the window', () => {
    expect(getOwnerDocument(window)).toBe(document);
  });

  it("returns the element's document if the element is in the document", () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(getOwnerDocument(div)).toBe(document);
    div.remove();
  });

  it("returns the iframe's document if the argument is the iframe's document", () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    expect(getOwnerDocument(iframe.contentWindow.document)).toBe(iframe.contentWindow.document);

    iframe.remove();
  });

  it("returns the iframe's document if the element is in the iframe", () => {
    const iframe = document.createElement('iframe');
    const iframeDiv = document.createElement('div');
    document.body.appendChild(iframe);
    iframe.contentWindow.document.body.appendChild(iframeDiv);

    expect(getOwnerDocument(iframeDiv)).toBe(iframe.contentWindow.document);

    iframe.remove();
  });
});

describe('getOwnerWindow', () => {
  beforeAll(() => {
    enableShadowDOM();
  });
  test.each([null, undefined])('returns the window if the argument is %p', value => {
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

describe('getActiveElement', () => {
  beforeAll(() => {
    enableShadowDOM();
  });
  it('returns the body as the active element by default', () => {
    act(() => {
      document.body.focus();
    }); // Ensure the body is focused, clearing any specific active element
    expect(getActiveElement()).toBe(document.body);
  });

  it('returns the active element in the light DOM', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    act(() => {
      btn.focus();
    });
    expect(getActiveElement()).toBe(btn);
    document.body.removeChild(btn);
  });

  it('returns the active element inside a shadow DOM', () => {
    const div = document.createElement('div');
    const shadowRoot = div.attachShadow({mode: 'open'});
    const btnInShadow = document.createElement('button');

    shadowRoot.appendChild(btnInShadow);
    document.body.appendChild(div);

    act(() => {
      btnInShadow.focus();
    });

    expect(getActiveElement()).toBe(btnInShadow);

    document.body.removeChild(div);
  });

  it('returns the active element from within nested shadow DOMs', () => {
    const outerHost = document.createElement('div');
    const outerShadow = outerHost.attachShadow({mode: 'open'});
    const innerHost = document.createElement('div');

    outerShadow.appendChild(innerHost);

    const innerShadow = innerHost.attachShadow({mode: 'open'});
    const input = document.createElement('input');

    innerShadow.appendChild(input);
    document.body.appendChild(outerHost);

    act(() => {
      input.focus();
    });

    expect(getActiveElement()).toBe(input);

    document.body.removeChild(outerHost);
  });

  it('returns the active element in document after focusing an element in shadow DOM and then in document', () => {
    const hostDiv = document.createElement('div');

    document.body.appendChild(hostDiv);

    const shadowRoot = hostDiv.attachShadow({mode: 'open'});
    const shadowInput = document.createElement('input');
    const bodyInput = document.createElement('input');

    shadowRoot.appendChild(shadowInput);
    document.body.appendChild(bodyInput);

    act(() => {
      shadowInput.focus();
    });
    act(() => {
      bodyInput.focus();
    });

    expect(getActiveElement()).toBe(bodyInput);

    document.body.removeChild(hostDiv);
    document.body.removeChild(bodyInput);
  });

  it('returns the active element within an iframe', () => {
    const iframe = document.createElement('iframe');
    const input = document.createElement('input');
    window.document.body.appendChild(iframe);
    iframe.contentWindow.document.body.appendChild(input);

    act(() => {
      input.focus();
    });

    expect(getActiveElement(iframe.contentWindow.document)).toBe(input);

    // Teardown
    iframe.remove();
  });
});

describe('setStyle', () => {
  it('returns a no-op cleanup and does not throw when the target is null', () => {
    const cleanup = setStyle(null, 'opacity', '0');
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  it('sets a CSS property on a single element and removes the property on cleanup when there was no initial value', () => {
    const el = document.createElement('div');
    const cleanup = setStyle(el, 'opacity', '0');
    expect(el.style.getPropertyValue('opacity')).toBe('0');

    cleanup();
    expect(el.style.getPropertyValue('opacity')).toBe('');
    expect(el.getAttribute('style')).toBeFalsy();
  });

  it('restores the previous value on cleanup when one existed', () => {
    const el = document.createElement('div');
    el.style.setProperty('opacity', '0.5');

    const cleanup = setStyle(el, 'opacity', '0');
    expect(el.style.getPropertyValue('opacity')).toBe('0');

    cleanup();
    expect(el.style.getPropertyValue('opacity')).toBe('0.5');
  });

  it('applies the given priority and restores the previous priority on cleanup', () => {
    const el = document.createElement('div');
    el.style.setProperty('color', 'red', 'important');

    const cleanup = setStyle(el, 'color', 'blue', 'important');
    expect(el.style.getPropertyValue('color')).toBe('blue');
    expect(el.style.getPropertyPriority('color')).toBe('important');

    cleanup();
    expect(el.style.getPropertyValue('color')).toBe('red');
    expect(el.style.getPropertyPriority('color')).toBe('important');
  });

  it('ets the property on every element in an array and restores on cleanup, preserving each prior value', () => {
    const withPrior = document.createElement('div');
    withPrior.style.setProperty('display', 'flex');
    const withoutPrior = document.createElement('div');

    const cleanup = setStyle([withPrior, withoutPrior], 'display', 'none');
    expect(withPrior.style.getPropertyValue('display')).toBe('none');
    expect(withoutPrior.style.getPropertyValue('display')).toBe('none');

    cleanup();
    expect(withPrior.style.getPropertyValue('display')).toBe('flex');
    expect(withoutPrior.style.getPropertyValue('display')).toBe('');
  });
});
