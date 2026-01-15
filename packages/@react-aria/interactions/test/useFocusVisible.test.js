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
import {act, fireEvent, pointerMap, render, renderHook, screen, waitFor} from '@react-spectrum/test-utils-internal';
import {addWindowFocusTracking, useFocusVisible, useFocusVisibleListener} from '../';
import {changeHandlers, hasSetupGlobalListeners} from '../src/useFocusVisible';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useButton} from '@react-aria/button';
import {useFocusRing} from '@react-aria/focus';
import userEvent from '@testing-library/user-event';

function Example(props) {
  const {isFocusVisible} = useFocusVisible();
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
  return <div tabIndex={0} {...props}>example{isFocusVisible && '-focusVisible'}</div>;
}

function ButtonExample(props) {
  const ref = React.useRef(null);
  const {buttonProps} = useButton({}, ref);
  const {focusProps, isFocusVisible} = useFocusRing();

  return <button {...mergeProps(props, buttonProps, focusProps)} ref={ref}>example{isFocusVisible && '-focusVisible'}</button>;
}

function toggleBrowserTabs(win = window) {
  // this describes Chrome behaviour only, for other browsers visibilitychange fires after all focus events.
  // leave tab
  const lastActiveElement = win.document.activeElement;
  fireEvent(lastActiveElement, new Event('blur'));
  fireEvent(win, new Event('blur'));
  Object.defineProperty(win.document, 'visibilityState', {
    value: 'hidden',
    writable: true
  });
  Object.defineProperty(win.document, 'hidden', {value: true, writable: true});
  fireEvent(win.document, new Event('visibilitychange'));
  // return to tab
  Object.defineProperty(win.document, 'visibilityState', {
    value: 'visible',
    writable: true
  });
  Object.defineProperty(win.document, 'hidden', {value: false, writable: true});
  fireEvent(win.document, new Event('visibilitychange'));
  fireEvent(win, new Event('focus', {target: win}));
  fireEvent(lastActiveElement, new Event('focus'));
}

function toggleBrowserWindow(win = window) {
  fireEvent(win, new Event('blur', {target: win}));
  fireEvent(win, new Event('focus', {target: win}));
}

describe('useFocusVisible', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    fireEvent.focus(document.body);
  });

  it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', async function () {
    render(<Example />);
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    toggleBrowserTabs();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', async function () {
    render(<Example />);
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    await user.click(el);
    toggleBrowserTabs();

    expect(el.textContent).toBe('example');
  });

  it('returns positive isFocusVisible result after toggling browser window after keyboard navigation', async function () {
    render(<Example />);
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    toggleBrowserWindow();

    expect(el.textContent).toBe('example-focusVisible');
  });

  it('returns negative isFocusVisible result after toggling browser window without prior keyboard navigation', async function () {
    render(<Example />);
    await user.tab();
    let el = screen.getByText('example-focusVisible');

    await user.click(el);
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
      iframe.contentWindow.document.body.addEventListener('keydown', e => e.stopPropagation());
    });

    afterEach(async () => {
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      iframe.remove();
    });

    it('sets up focus listener in a different window', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      const el = iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]');

      // Focus in iframe before setupFocus should not do anything
      await user.click(document.body);
      await user.click(el);
      expect(el.textContent).toBe('example');

      // Setup focus in iframe
      addWindowFocusTracking(iframeRoot);
      expect(el.textContent).toBe('example');

      // Focus in iframe after setupFocus
      expect(iframe.contentWindow.document.activeElement).toBe(el);
      await user.keyboard('{Enter}');
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('removes event listeners on beforeunload', async function () {
      let tree = render(<Example data-testid="iframe-example" />, {container: iframeRoot});

      await waitFor(() => {
        expect(tree.getByTestId('iframe-example')).toBeTruthy();
      });
      const el = tree.getByTestId('iframe-example');
      addWindowFocusTracking(iframeRoot);
      // trigger keyboard focus
      await user.tab();
      await user.keyboard('a');
      expect(el.textContent).toBe('example-focusVisible');

      await user.click(el);
      expect(el.textContent).toBe('example');

      // Focus events after beforeunload no longer work
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      await user.keyboard('{Enter}');
      expect(el.textContent).toBe('example');
    });

    it('removes event listeners using teardown function', async function () {
      let tree = render(<Example data-testid="iframe-example" />, {container: iframeRoot});
      let tearDown = addWindowFocusTracking(iframeRoot);

      await waitFor(() => {
        expect(tree.getByTestId('iframe-example')).toBeTruthy();
      });
      const el = tree.getByTestId('iframe-example');
      // trigger keyboard focus
      await user.tab();
      await user.keyboard('a');
      expect(el.textContent).toBe('example-focusVisible');

      await user.click(el);
      expect(el.textContent).toBe('example');

      tearDown();
      await user.keyboard('{Enter}');
      expect(el.textContent).toBe('example');
    });

    it('removes the window object from the hasSetupGlobalListeners object on beforeunload', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();

      // After setup focus
      addWindowFocusTracking(iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(2);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeTruthy();

      // After unmount
      fireEvent(iframe.contentWindow, new Event('beforeunload'));
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();
    });

    it('removes the window object from the hasSetupGlobalListeners object if we preemptively tear down', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();

      // After setup focus
      let tearDown = addWindowFocusTracking(iframeRoot);
      expect(hasSetupGlobalListeners.size).toBe(2);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeTruthy();

      tearDown();
      expect(hasSetupGlobalListeners.size).toBe(1);
      expect(hasSetupGlobalListeners.get(window)).toBeTruthy();
      expect(hasSetupGlobalListeners.get(iframe.contentWindow)).toBeFalsy();
    });

    it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      addWindowFocusTracking(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      await user.tab();

      // Iframe event listeners
      const el = iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      // Toggling browser tabs should have the same behavior since the iframe is on the same tab as before.
      toggleBrowserTabs(iframe.contentWindow);
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      addWindowFocusTracking(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      await user.tab();

      // Iframe event listeners
      const el = iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      await user.click(el);
      expect(el.textContent).toBe('example');
    });

    it('returns positive isFocusVisible result after toggling browser window after keyboard navigation', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      addWindowFocusTracking(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      await user.tab();

      // Iframe event listeners
      const el = iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      toggleBrowserWindow();
      expect(el.textContent).toBe('example-focusVisible');
    });

    it('returns negative isFocusVisible result after toggling browser window without prior keyboard navigation', async function () {
      render(<Example id="iframe-example" />, {container: iframeRoot});
      addWindowFocusTracking(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]')).toBeTruthy();
      });
      await user.tab();

      // Iframe event listeners
      const el = iframe.contentWindow.document.body.querySelector('div[id="iframe-example"]');
      expect(el.textContent).toBe('example-focusVisible');

      await user.click(el);
      toggleBrowserWindow();
      expect(el.textContent).toBe('example');
    });

    it('correctly shifts focus to the iframe when the iframe is focused', async function () {
      render(<ButtonExample id="iframe-example" />, {container: iframeRoot});
      addWindowFocusTracking(iframeRoot);

      // Fire focus in iframe
      await waitFor(() => {
        expect(iframe.contentWindow.document.body.querySelector('button[id="iframe-example"]')).toBeTruthy();
      });

      const el = iframe.contentWindow.document.body.querySelector('button[id="iframe-example"]');

      await user.pointer({target: el, keys: '[MouseLeft]'});
      await user.keyboard('{Esc}');

      expect(el.textContent).toBe('example-focusVisible');
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

  describe('subscription model', function () {
    let user;
    beforeAll(() => {
      user = userEvent.setup({delay: null, pointerMap});
    });

    function Example(props) {
      return (
        <div>
          <ButtonExample data-testid="button1" />
          <ButtonExample data-testid="button2" />
        </div>
      );
    }

    function ButtonExample(props) {
      const ref = React.useRef(null);
      const {buttonProps} = useButton({}, ref);
      const {focusProps, isFocusVisible} = useFocusRing();

      return <button {...mergeProps(props, buttonProps, focusProps)} data-focus-visible={isFocusVisible || undefined} ref={ref}>example</button>;
    }
    it('does not call changeHandlers when unneeded', async function () {
      // Save original methods
      const originalAdd = changeHandlers.add.bind(changeHandlers);
      const originalDelete = changeHandlers.delete.bind(changeHandlers);
      // Map so we can also track references to the original handlers to remove them later
      const handlerSpies = new Map();

      // Intercept handler registration and wrap with spy
      changeHandlers.add = function (handler) {
        const spy = jest.fn(handler);
        handlerSpies.set(handler, spy);
        return originalAdd.call(this, spy);
      };

      changeHandlers.delete = function (handler) {
        const spy = handlerSpies.get(handler);
        if (spy) {
          handlerSpies.delete(handler);
          return originalDelete.call(this, spy);
        }
        return originalDelete.call(this, handler);
      };

      // Possibly a little extra cautious with the unmount, but better safe than sorry with cleanup.
      let {getByTestId, unmount} = render(<Example />);

      let button1 = getByTestId('button1');
      let button2 = getByTestId('button2');
      expect(button1).not.toHaveAttribute('data-focus-visible');
      expect(button2).not.toHaveAttribute('data-focus-visible');
      // No handlers registered yet because nothing is focused
      expect(handlerSpies.size).toBe(0);

      // Tab to first button, this should add its handler
      await user.tab();
      expect(document.activeElement).toBe(button1);
      expect(button1).toHaveAttribute('data-focus-visible');
      expect(button2).not.toHaveAttribute('data-focus-visible');

      expect(handlerSpies.size).toBe(1);
      let [button1Spy] = [...handlerSpies.values()];

      button1Spy.mockClear();

      // Tab to second button - first handler should be removed, second added
      await user.tab();
      expect(button1).not.toHaveAttribute('data-focus-visible');
      expect(button2).toHaveAttribute('data-focus-visible');

      // Still only 1 handler registered (swapped from button1 to button2)
      expect(handlerSpies.size).toBe(1);
      let [button2Spy] = [...handlerSpies.values()];
      expect(button2Spy).not.toBe(button1Spy); // Should be a different spy

      // button1's handler was called during tab (keydown/keyup before removal)
      // the handler is removed later in an effect
      expect(button1Spy.mock.calls.length).toBeGreaterThan(0);

      button1Spy.mockClear();
      button2Spy.mockClear();

      // After button1's handler is removed, it should NOT be called
      // for subsequent modality changes - only button2's handler should be called
      await user.click(button2);
      expect(button1).not.toHaveAttribute('data-focus-visible');
      expect(button2).not.toHaveAttribute('data-focus-visible');
      expect(button1Spy).toHaveBeenCalledTimes(0); // button1's handler should NOT be called
      expect(button2Spy).toHaveBeenCalledTimes(1); // Only button2's handler called to change modality to pointer

      // Cleanup
      unmount();
      changeHandlers.add = originalAdd;
      changeHandlers.delete = originalDelete;
    });
  });
});
