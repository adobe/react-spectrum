/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, createShadowRoot, pointerMap, render, waitFor} from '@react-spectrum/test-utils-internal';
import {enableShadowDOM} from '@react-stately/flags';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {UNSAFE_PortalProvider} from '@react-aria/overlays';
import {useFocusWithin} from '../';
import userEvent from '@testing-library/user-event';

function Example(props) {
  let {focusWithinProps} = useFocusWithin(props);
  return <div tabIndex={-1} {...focusWithinProps} data-testid="example">{props.children}</div>;
}

describe('useFocusWithin', function () {
  it('handles focus events on the target itself', function () {
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={isFocused => events.push({type: 'focuschange', isFocused})} />
    );

    let el = tree.getByTestId('example');
    act(() => {el.focus();});
    act(() => {el.blur();});

    expect(events).toEqual([
      {type: 'focus', target: el},
      {type: 'focuschange', isFocused: true},
      {type: 'blur', target: el},
      {type: 'focuschange', isFocused: false}
    ]);
  });

  it('does handle focus events on children', function () {
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={isFocused => events.push({type: 'focuschange', isFocused})}>
        <div data-testid="child" tabIndex={-1} />
      </Example>
    );

    let el = tree.getByTestId('example');
    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {el.focus();});
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(events).toEqual([
      {type: 'focus', target: child},
      {type: 'focuschange', isFocused: true},
      {type: 'blur', target: child},
      {type: 'focuschange', isFocused: false}
    ]);
  });

  it('does not handle focus events if disabled', function () {
    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <Example
        isDisabled
        onFocusWithin={addEvent}
        onBlurWithin={addEvent}
        onFocusWithinChange={isFocused => events.push({type: 'focuschange', isFocused})}>
        <div data-testid="child" tabIndex={-1} />
      </Example>
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(events).toEqual([]);
  });

  it('events do not bubble when stopPropagation is called', function () {
    let onWrapperFocus = jest.fn();
    let onWrapperBlur = jest.fn();
    let onInnerFocus = jest.fn(e => e.stopPropagation());
    let onInnerBlur = jest.fn(e => e.stopPropagation());
    let tree = render(
      <div onFocus={onWrapperFocus} onBlur={onWrapperBlur}>
        <Example
          onFocusWithin={onInnerFocus}
          onBlurWithin={onInnerBlur}>
          <div data-testid="child" tabIndex={-1} />
        </Example>
      </div>
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).not.toHaveBeenCalled();
    expect(onWrapperBlur).not.toHaveBeenCalled();
  });

  it('events bubble by default', function () {
    let onWrapperFocus = jest.fn();
    let onWrapperBlur = jest.fn();
    let onInnerFocus = jest.fn();
    let onInnerBlur = jest.fn();
    let tree = render(
      <div onFocus={onWrapperFocus} onBlur={onWrapperBlur}>
        <Example
          onFocusWithin={onInnerFocus}
          onBlurWithin={onInnerBlur}>
          <div data-testid="child" tabIndex={-1} />
        </Example>
      </div>
    );

    let child = tree.getByTestId('child');
    act(() => {child.focus();});
    act(() => {child.blur();});

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).toHaveBeenCalledTimes(1);
    expect(onWrapperBlur).toHaveBeenCalledTimes(1);
  });

  it('should fire onBlur when a focused element is disabled', async function () {
    function Example(props) {
      let {focusWithinProps} = useFocusWithin(props);
      return <div {...focusWithinProps}><button disabled={props.disabled}>Button</button></div>;
    }

    let onFocus = jest.fn();
    let onBlur = jest.fn();
    let tree = render(<Example onFocusWithin={onFocus} onBlurWithin={onBlur} />);
    let button = tree.getByRole('button');

    act(() => {button.focus();});
    expect(onFocus).toHaveBeenCalled();
    tree.rerender(<Example disabled onFocusWithin={onFocus} onBlurWithin={onBlur} />);
    // MutationObserver is async
    await waitFor(() => expect(onBlur).toHaveBeenCalled());
  });

  it('should fire onBlur when focus occurs outside', async function () {
    function Test(props) {
      let {focusWithinProps} = useFocusWithin(props);
      return <div {...focusWithinProps} data-testid="test">{props.children}</div>;
    }

    function Inner() {
      let [show, setShow] = useState(true);
      return show ? <button onClick={() => setShow(false)}>hide</button> : null;
    }

    let events = [];
    let addEvent = (e) => events.push({type: e.type, target: e.target});
    let tree = render(
      <>
        <Test
          onFocusWithin={addEvent}
          onBlurWithin={addEvent}
          onFocusWithinChange={isFocused => events.push({type: 'focuschange', isFocused})}>
          <Inner />
        </Test>
        <input data-testid="outer" />
      </>
    );

    let el = tree.getByRole('button');
    act(() => el.focus());
    act(() => el.click());
    act(() => tree.getByTestId('outer').focus());

    expect(events).toEqual([
      {type: 'focus', target: el},
      {type: 'focuschange', isFocused: true},
      {type: 'blur', target: tree.getByTestId('test')},
      {type: 'focuschange', isFocused: false}
    ]);
  });
});

describe('useFocusWithin with Shadow DOM and UNSAFE_PortalProvider', () => {
  let user;

  beforeAll(() => {
    enableShadowDOM();
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  it('should handle focus within events in shadow DOM with UNSAFE_PortalProvider', async () => {
    const {shadowRoot} = createShadowRoot();
    let focusWithinTriggered = false;
    let blurWithinTriggered = false;
    let focusChangeEvents = [];

    function ShadowFocusWithinExample() {
      const handleFocusWithin = () => {
        focusWithinTriggered = true;
      };

      const handleBlurWithin = () => {
        blurWithinTriggered = true;
      };

      const handleFocusWithinChange = (isFocused) => {
        focusChangeEvents.push(isFocused);
      };

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="focus-within-container">
            <Example 
              onFocusWithin={handleFocusWithin}
              onBlurWithin={handleBlurWithin}
              onFocusWithinChange={handleFocusWithinChange}
            >
              <button data-testid="inner-button">Inner Button</button>
              <input data-testid="inner-input" placeholder="Inner Input" />
            </Example>
            <button data-testid="outer-button">Outer Button</button>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<ShadowFocusWithinExample />);

    const innerButton = shadowRoot.querySelector('[data-testid="inner-button"]');
    const innerInput = shadowRoot.querySelector('[data-testid="inner-input"]');
    const outerButton = shadowRoot.querySelector('[data-testid="outer-button"]');

    // Focus within the example container
    act(() => { innerButton.focus(); });
    expect(shadowRoot.activeElement).toBe(innerButton);
    expect(focusWithinTriggered).toBe(true);
    expect(focusChangeEvents).toContain(true);

    // Move focus within the container (should not trigger blur)
    act(() => { innerInput.focus(); });
    expect(shadowRoot.activeElement).toBe(innerInput);
    expect(blurWithinTriggered).toBe(false);

    // Move focus outside the container
    act(() => { outerButton.focus(); });
    expect(shadowRoot.activeElement).toBe(outerButton);
    expect(blurWithinTriggered).toBe(true);
    expect(focusChangeEvents).toContain(false);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle focus within detection across shadow DOM boundaries (issue #8675)', async () => {
    const {shadowRoot} = createShadowRoot();
    let focusWithinEvents = [];

    function MenuWithFocusWithinExample() {
      const handleFocusWithinChange = (isFocused) => {
        focusWithinEvents.push({type: 'focusWithinChange', isFocused});
      };

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="app">
            <button data-testid="menu-trigger">Menu Trigger</button>
            <Example 
              onFocusWithinChange={handleFocusWithinChange}
              data-testid="menu-popover"
            >
              <div role="menu" data-testid="menu">
                <button 
                  role="menuitem" 
                  data-testid="menu-item-1"
                  onClick={() => {
                    // This should not cause focus within to be lost
                    console.log('Menu item 1 clicked');
                  }}
                >
                  Save Document
                </button>
                <button 
                  role="menuitem" 
                  data-testid="menu-item-2"
                  onClick={() => {
                    console.log('Menu item 2 clicked');
                  }}
                >
                  Export Document
                </button>
              </div>
            </Example>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<MenuWithFocusWithinExample />);

    const menuItem1 = shadowRoot.querySelector('[data-testid="menu-item-1"]');
    const menuItem2 = shadowRoot.querySelector('[data-testid="menu-item-2"]');
    const menuTrigger = shadowRoot.querySelector('[data-testid="menu-trigger"]');

    // Focus enters the menu
    act(() => { menuItem1.focus(); });
    expect(shadowRoot.activeElement).toBe(menuItem1);
    expect(focusWithinEvents).toContainEqual({type: 'focusWithinChange', isFocused: true});

    // Click menu item (this should not cause focus within to be lost)
    await user.click(menuItem1);
    
    // Focus should remain within the menu area
    expect(focusWithinEvents.filter(e => e.isFocused === false)).toHaveLength(0);

    // Move focus within menu
    act(() => { menuItem2.focus(); });
    expect(shadowRoot.activeElement).toBe(menuItem2);

    // Only when focus moves completely outside should focus within be false
    act(() => { menuTrigger.focus(); });
    expect(shadowRoot.activeElement).toBe(menuTrigger);
    expect(focusWithinEvents).toContainEqual({type: 'focusWithinChange', isFocused: false});

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle nested focus within containers in shadow DOM with portals', async () => {
    const {shadowRoot} = createShadowRoot();
    let outerFocusEvents = [];
    let innerFocusEvents = [];

    function NestedFocusWithinExample() {
      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <Example 
            onFocusWithinChange={(isFocused) => outerFocusEvents.push(isFocused)}
            data-testid="outer-container"
          >
            <button data-testid="outer-button">Outer Button</button>
            <Example 
              onFocusWithinChange={(isFocused) => innerFocusEvents.push(isFocused)}
              data-testid="inner-container"
            >
              <button data-testid="inner-button-1">Inner Button 1</button>
              <button data-testid="inner-button-2">Inner Button 2</button>
            </Example>
            <button data-testid="outer-button-2">Outer Button 2</button>
          </Example>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<NestedFocusWithinExample />);

    const outerButton = shadowRoot.querySelector('[data-testid="outer-button"]');
    const innerButton1 = shadowRoot.querySelector('[data-testid="inner-button-1"]');
    const innerButton2 = shadowRoot.querySelector('[data-testid="inner-button-2"]');
    const outerButton2 = shadowRoot.querySelector('[data-testid="outer-button-2"]');

    // Focus enters outer container
    act(() => { outerButton.focus(); });
    expect(outerFocusEvents).toContain(true);
    expect(innerFocusEvents).toHaveLength(0);

    // Focus enters inner container
    act(() => { innerButton1.focus(); });
    expect(innerFocusEvents).toContain(true);
    expect(outerFocusEvents.filter(e => e === false)).toHaveLength(0); // Outer should still be focused

    // Move within inner container
    act(() => { innerButton2.focus(); });
    expect(innerFocusEvents.filter(e => e === false)).toHaveLength(0);

    // Move to outer container (leaves inner)
    act(() => { outerButton2.focus(); });
    expect(innerFocusEvents).toContain(false);
    expect(outerFocusEvents.filter(e => e === false)).toHaveLength(0);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle focus within with complex portal hierarchies in shadow DOM', async () => {
    const {shadowRoot} = createShadowRoot();
    const modalPortal = document.createElement('div');
    modalPortal.setAttribute('data-testid', 'modal-portal');
    shadowRoot.appendChild(modalPortal);

    let modalFocusEvents = [];
    let popoverFocusEvents = [];

    function ComplexPortalExample() {
      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="main-app">
            <button data-testid="main-button">Main Button</button>
            
            {/* Modal with focus within */}
            {ReactDOM.createPortal(
              <Example 
                onFocusWithinChange={(isFocused) => modalFocusEvents.push(isFocused)}
                data-testid="modal"
              >
                <div role="dialog">
                  <button data-testid="modal-button-1">Modal Button 1</button>
                  <button data-testid="modal-button-2">Modal Button 2</button>
                  
                  {/* Nested popover within modal */}
                  <Example 
                    onFocusWithinChange={(isFocused) => popoverFocusEvents.push(isFocused)}
                    data-testid="popover"
                  >
                    <div role="menu">
                      <button data-testid="popover-item-1">Popover Item 1</button>
                      <button data-testid="popover-item-2">Popover Item 2</button>
                    </div>
                  </Example>
                </div>
              </Example>,
              modalPortal
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<ComplexPortalExample />);

    const modalButton1 = shadowRoot.querySelector('[data-testid="modal-button-1"]');
    const popoverItem1 = shadowRoot.querySelector('[data-testid="popover-item-1"]');
    const popoverItem2 = shadowRoot.querySelector('[data-testid="popover-item-2"]');
    const mainButton = shadowRoot.querySelector('[data-testid="main-button"]');

    // Focus enters modal
    act(() => { modalButton1.focus(); });
    expect(modalFocusEvents).toContain(true);

    // Focus enters popover within modal
    act(() => { popoverItem1.focus(); });
    expect(popoverFocusEvents).toContain(true);
    expect(modalFocusEvents.filter(e => e === false)).toHaveLength(0); // Modal should still have focus within

    // Move within popover
    act(() => { popoverItem2.focus(); });
    expect(popoverFocusEvents.filter(e => e === false)).toHaveLength(0);

    // Move back to modal (leaves popover)
    act(() => { modalButton1.focus(); });
    expect(popoverFocusEvents).toContain(false);
    expect(modalFocusEvents.filter(e => e === false)).toHaveLength(0);

    // Move completely outside (leaves modal)
    act(() => { mainButton.focus(); });
    expect(modalFocusEvents).toContain(false);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should correctly handle focus within when elements are dynamically added/removed in shadow DOM', async () => {
    const {shadowRoot} = createShadowRoot();
    let focusWithinEvents = [];

    function DynamicFocusWithinExample() {
      const [showItems, setShowItems] = React.useState(true);

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <Example 
            onFocusWithinChange={(isFocused) => focusWithinEvents.push(isFocused)}
            data-testid="dynamic-container"
          >
            <button 
              data-testid="toggle-button"
              onClick={() => setShowItems(!showItems)}
            >
              Toggle Items
            </button>
            {showItems && (
              <div>
                <button data-testid="dynamic-item-1">Dynamic Item 1</button>
                <button data-testid="dynamic-item-2">Dynamic Item 2</button>
              </div>
            )}
          </Example>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<DynamicFocusWithinExample />);

    const toggleButton = shadowRoot.querySelector('[data-testid="toggle-button"]');
    const dynamicItem1 = shadowRoot.querySelector('[data-testid="dynamic-item-1"]');

    // Focus within the container
    act(() => { dynamicItem1.focus(); });
    expect(focusWithinEvents).toContain(true);

    // Click toggle to remove items while focused on one
    await user.click(toggleButton);
    
    // Focus should now be on the toggle button, still within container
    expect(shadowRoot.activeElement).toBe(toggleButton);
    expect(focusWithinEvents.filter(e => e === false)).toHaveLength(0);

    // Toggle back to show items
    await user.click(toggleButton);

    // Focus should still be within the container
    const newDynamicItem1 = shadowRoot.querySelector('[data-testid="dynamic-item-1"]');
    act(() => { newDynamicItem1.focus(); });
    expect(focusWithinEvents.filter(e => e === false)).toHaveLength(0);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });
});
