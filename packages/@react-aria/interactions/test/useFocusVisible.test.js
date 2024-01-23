/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {act, fireEvent, render, renderHook, screen, waitFor} from '@react-spectrum/test-utils';
import {hasSetupGlobalListeners} from '../src/useFocusVisible';
import React from 'react';
import {render as ReactDOMRender} from 'react-dom';
import {setupFocus, useFocusVisible, useFocusVisibleListener} from '../';

function Example(props) {
  const {isFocusVisible} = useFocusVisible();
  return <div id={props.id}>example{isFocusVisible && '-focusVisible'}</div>;
}

function toggleBrowserTabs() {
  // this describes Chrome behaviour only, for other browsers visibilitychange fires after all focus events.
  // leave tab
  const lastActiveElement = document.activeElement;
  fireEvent(lastActiveElement, new Event('blur'));
  fireEvent(window, new Event('blur'));
  Object.defineProperty(document, 'visibilityState', {
    value: 'hidden',
    writable: true
  });
  Object.defineProperty(document, 'hidden', {value: true, writable: true});
  fireEvent(document, new Event('visibilitychange'));
  // return to tab
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    writable: true
  });
  Object.defineProperty(document, 'hidden', {value: false, writable: true});
  fireEvent(document, new Event('visibilitychange'));
  fireEvent(window, new Event('focus', {target: window}));
  fireEvent(lastActiveElement, new Event('focus'));
}

function toggleBrowserWindow() {
  fireEvent(window, new Event('blur', {target: window}));
  fireEvent(window, new Event('focus', {target: window}));
}

describe('useFocusVisible', function () {
  beforeEach(() => {
    fireEvent.focus(document.body);
  });

  it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', function () {
    render(<Example />);
    let el = screen.getByText('example-focusVisible');

    fireEvent.keyDown(el, {key: 'Tab'});
    toggleBrowserTabs();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', function () {
    render(<Example />);
    let el = screen.getByText('example-focusVisible');

    fireEvent.mouseDown(el);
    toggleBrowserTabs();

    expect(el.textContent).toBe('example');
  });

  it('returns positive isFocusVisible result after toggling browser window after keyboard navigation', function () {
    render(<Example />);
    let el = screen.getByText('example-focusVisible');

    fireEvent.keyDown(el, {key: 'Tab'});
    toggleBrowserWindow();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser window without prior keyboard navigation', function () {
    render(<Example />);
    let el = screen.getByText('example-focusVisible');

    fireEvent.mouseDown(el);
    toggleBrowserWindow();

    expect(el.textContent).toBe('example');
  });

  describe('Setups global event listeners in a different window', () => {
    let iframe;
    let iframeRoot;
    beforeEach(() => {
      iframe = document.createElement('iframe');
      window.document.body.appendChild(iframe);
      iframeRoot = iframe.contentWindow.document.createElement('div');
      iframe.contentWindow.document.body.appendChild(iframeRoot);
    });

    afterEach(() => {
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      iframe.remove();
    });

    it('sets up focus listener in a different window', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');

      // Focus in iframe before setupFocus should not do anything
      fireEvent.focus(iframe.contentWindow.document.body);
      expect(el.textContent).toBe('example');

      // Setup focus in iframe
      setupFocus(iframeRoot);
      expect(el.textContent).toBe('example');

      // Focus in iframe after setupFocus
      fireEvent.focus(iframe.contentWindow.document.body);
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('removes event listeners on beforeunload', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      setupFocus(iframeRoot);

      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      fireEvent.mouseDown(el);
      expect(el.textContent).toBe('example');

      // Focus events after beforeunload no longer work
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      fireEvent.focus(iframe.contentWindow.document.body);
      expect(el.textContent).toBe('example');
    });

    it('removes the window object from the hasSetupGlobalListeners object on beforeunload', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();

      // After setup focus
      setupFocus(iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(2);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeTruthy();

      // After unmount
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();
    });

    it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      setupFocus(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      fireEvent.focus(iframe.contentWindow.document.body);

      // Iframe event listeners
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      // Toggling browser tabs should have the same behavior since the iframe is on the same tab as before.
      fireEvent.keyDown(el, {key: 'Tab'});
      toggleBrowserTabs();
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      setupFocus(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      fireEvent.focus(iframe.contentWindow.document.body);

      // Iframe event listeners
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      fireEvent.mouseDown(el);
      expect(el.textContent).toBe('example');
    });

    it('returns positive isFocusVisible result after toggling browser window after keyboard navigation', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      setupFocus(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      fireEvent.focus(iframe.contentWindow.document.body);

      // Iframe event listeners
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      fireEvent.keyDown(el, {key: 'Tab'});
      toggleBrowserWindow();
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('returns negative isFocusVisible result after toggling browser window without prior keyboard navigation', async function () {
      ReactDOMRender(<Example id="iframe-example" />, iframeRoot);
      setupFocus(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      fireEvent.focus(iframe.contentWindow.document.body);

      // Iframe event listeners
      const el = document.querySelector('iframe').contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      fireEvent.mouseDown(el);
      toggleBrowserWindow();
      expect(el.textContent).toBe('example');
    });
  });
});

describe('useFocusVisibleListener', function () {
  it('emits on modality change (non-text input)', function () {
    let fnMock = jest.fn();
    renderHook(() => useFocusVisibleListener(fnMock, []));
    expect(fnMock).toHaveBeenCalledTimes(0);
    act(() => {
      fireEvent.keyDown(document.body, {key: 'a'});
      fireEvent.keyUp(document.body, {key: 'a'});
      fireEvent.keyDown(document.body, {key: 'Escape'});
      fireEvent.keyUp(document.body, {key: 'Escape'});
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body); // does not trigger change handlers (but included for completeness)
    });
    expect(fnMock).toHaveBeenCalledTimes(5);
    expect(fnMock.mock.calls).toEqual([[true], [true], [true], [true], [false]]);
  });

  it('emits on modality change (text input)', function () {
    let fnMock = jest.fn();
    renderHook(() => useFocusVisibleListener(fnMock, [], {isTextInput: true}));
    expect(fnMock).toHaveBeenCalledTimes(0);
    act(() => {
      fireEvent.keyDown(document.body, {key: 'a'});
      fireEvent.keyUp(document.body, {key: 'a'});
      fireEvent.keyDown(document.body, {key: 'Escape'});
      fireEvent.keyUp(document.body, {key: 'Escape'});
      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body); // does not trigger change handlers (but included for completeness)
    });
    expect(fnMock).toHaveBeenCalledTimes(3);
    expect(fnMock.mock.calls).toEqual([[true], [true], [false]]);
  });
});
