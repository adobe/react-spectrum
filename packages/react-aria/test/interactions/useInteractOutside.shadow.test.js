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

import {
  act,
  createShadowRoot,
  fireEvent,
  pointerMap,
  render
} from '@react-spectrum/test-utils-internal';
import {enableShadowDOM} from '@react-stately/flags';
import React, {useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {UNSAFE_PortalProvider} from '../../src/overlays/PortalProvider';
import {useInteractOutside} from '../../src/interactions/useInteractOutside';
import userEvent from '@testing-library/user-event';

describe('useInteractOutside shadow DOM', function () {
  // Helper function to create a shadow root and render the component inside it
  function createShadowRootAndRender(ui) {
    const shadowHost = document.createElement('div');
    document.body.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({mode: 'open'});

    function WrapperComponent() {
      return ReactDOM.createPortal(ui, shadowRoot);
    }

    render(<WrapperComponent />);
    return {shadowRoot, cleanup: () => document.body.removeChild(shadowHost)};
  }

  function App({onInteractOutside}) {
    const ref = useRef(null);
    useInteractOutside({ref, onInteractOutside});

    return (
      <div>
        <div id="outside-popover" />
        <div id="popover" ref={ref}>
          <div id="inside-popover" />
        </div>
      </div>
    );
  }

  it('does not trigger when clicking inside popover', function () {
    const onInteractOutside = jest.fn();
    const {shadowRoot, cleanup} = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />
    );

    const insidePopover = shadowRoot.getElementById('inside-popover');
    fireEvent.mouseDown(insidePopover);
    fireEvent.mouseUp(insidePopover);

    expect(onInteractOutside).not.toHaveBeenCalled();
    cleanup();
  });

  it('does not trigger when clicking the popover', function () {
    const onInteractOutside = jest.fn();
    const {shadowRoot, cleanup} = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />
    );

    const popover = shadowRoot.getElementById('popover');
    fireEvent.mouseDown(popover);
    fireEvent.mouseUp(popover);

    expect(onInteractOutside).not.toHaveBeenCalled();
    cleanup();
  });

  it('triggers when clicking outside the popover', function () {
    const onInteractOutside = jest.fn();
    const {cleanup} = createShadowRootAndRender(<App onInteractOutside={onInteractOutside} />);

    // Clicking on the document body outside the shadow DOM
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it('triggers when clicking a button outside the shadow dom altogether', function () {
    const onInteractOutside = jest.fn();
    const {cleanup} = createShadowRootAndRender(<App onInteractOutside={onInteractOutside} />);
    // Button outside shadow DOM and component
    const button = document.createElement('button');
    document.body.appendChild(button);

    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    document.body.removeChild(button);
    cleanup();
  });
});

describe('useInteractOutside shadow DOM extended tests', function () {
  // Setup function similar to previous tests, but includes a dynamic element scenario
  function createShadowRootAndRender(ui) {
    const shadowHost = document.createElement('div');
    document.body.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({mode: 'open'});

    function WrapperComponent() {
      return ReactDOM.createPortal(ui, shadowRoot);
    }

    render(<WrapperComponent />);
    return {shadowRoot, cleanup: () => document.body.removeChild(shadowHost)};
  }

  function App({onInteractOutside, includeDynamicElement = false}) {
    const ref = useRef(null);
    useInteractOutside({ref, onInteractOutside});

    useEffect(() => {
      if (includeDynamicElement) {
        const dynamicEl = document.createElement('div');
        dynamicEl.id = 'dynamic-outside';
        document.body.appendChild(dynamicEl);

        return () => document.body.removeChild(dynamicEl);
      }
    }, [includeDynamicElement]);

    return (
      <div>
        <div id="outside-popover" />
        <div id="popover" ref={ref}>
          <div id="inside-popover" />
        </div>
      </div>
    );
  }

  it('correctly identifies interaction with dynamically added external elements', function () {
    jest.useFakeTimers();
    const onInteractOutside = jest.fn();
    const {cleanup} = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} includeDynamicElement />
    );

    const dynamicEl = document.getElementById('dynamic-outside');
    fireEvent.mouseDown(dynamicEl);
    fireEvent.mouseUp(dynamicEl);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);

    cleanup();
  });
});

describe('useInteractOutside with Shadow DOM and UNSAFE_PortalProvider', () => {
  let user;

  beforeAll(() => {
    enableShadowDOM();
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('should handle interact outside events with UNSAFE_PortalProvider in shadow DOM', async () => {
    const {shadowRoot, cleanup} = createShadowRoot();
    let interactOutsideTriggered = false;

    // Create portal container within the shadow DOM for the popover
    const popoverPortal = document.createElement('div');
    popoverPortal.setAttribute('data-testid', 'popover-portal');
    shadowRoot.appendChild(popoverPortal);

    function ShadowInteractOutsideExample() {
      const ref = useRef();
      useInteractOutside({
        ref,
        onInteractOutside: () => {
          interactOutsideTriggered = true;
        }
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="container">
            {ReactDOM.createPortal(
              <>
                <div
                  ref={ref}
                  data-testid="target"
                  style={{padding: '20px', background: 'lightblue'}}>
                  <button data-testid="inner-button">Inner Button</button>
                  <input data-testid="inner-input" placeholder="Inner Input" />
                </div>
                <button data-testid="outside-button">Outside Button</button>
              </>,
              popoverPortal
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<ShadowInteractOutsideExample />);

    const target = shadowRoot.querySelector('[data-testid="target"]');
    const innerButton = shadowRoot.querySelector('[data-testid="inner-button"]');
    const outsideButton = shadowRoot.querySelector('[data-testid="outside-button"]');

    // Click inside the target - should NOT trigger interact outside
    await user.click(innerButton);
    expect(interactOutsideTriggered).toBe(false);

    // Click the target itself - should NOT trigger interact outside
    await user.click(target);
    expect(interactOutsideTriggered).toBe(false);

    // Click outside the target within shadow DOM - should trigger interact outside
    await user.click(outsideButton);
    expect(interactOutsideTriggered).toBe(true);

    // Cleanup
    unmount();
    cleanup();
  });
});
