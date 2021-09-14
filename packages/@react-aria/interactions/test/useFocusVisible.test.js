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
import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useFocusVisible, useFocusVisibleListener} from '../';

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
