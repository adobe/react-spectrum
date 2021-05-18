describe('useFocusVisible', function () {
  let React;
  let cleanup;
  let fireEvent;
  let render;
  let screen;
  let useFocusVisible;

  beforeEach(() => {
    jest.resetModules();

    React = require('react');
    useFocusVisible = require('../').useFocusVisible;
    ({fireEvent, render, screen, cleanup} = require('@testing-library/react'));
  });

  afterEach(() => {
    cleanup();
  });

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
