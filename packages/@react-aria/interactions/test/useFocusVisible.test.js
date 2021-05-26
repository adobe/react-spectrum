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
import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useFocusVisibleListener, useFocusVisible} from '../';

function Example() {
  let {isFocusVisible} = useFocusVisible();
  return <div>example{isFocusVisible && '-focusVisible'}</div>;
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

describe('useFocusVisible', function () {
  it('returns positive isFocusVisible result after toggling browser tabs after keyboard navigation', function () {
    let res = render(<Example />);
    let el = res.getByText('example-focusVisible');

    fireEvent.keyDown(el, {key: 'Tab'});
    toggleBrowserTabs();

    expect(el.textContent).toBe('example-focusVisible');
  });
  it('returns negative isFocusVisible result after toggling browser tabs without prior keyboard navigation', function () {
    let res = render(<Example />);
    let el = res.getByText('example-focusVisible');

    fireEvent.mouseDown(el);
    toggleBrowserTabs();

    expect(el.textContent).toBe('example');
  });
});

describe('useFocusEmitter', function () {
  it('emits on modality change', function () {
    let fnMock = jest.fn();
    renderHook(() => useFocusVisibleListener(fnMock, []), {isTextInput: true});
    expect(fnMock).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(document.body, {key: 'Escape'});
    expect(fnMock).toHaveBeenCalledTimes(1);
    expect(fnMock.mock.calls[0][0]).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(fnMock).toHaveBeenCalledTimes(2);
    expect(fnMock.mock.calls[1][0]).toBeFalsy();
  });
});
