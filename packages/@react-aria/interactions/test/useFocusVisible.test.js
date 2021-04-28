import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useFocusVisible} from '../';

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
