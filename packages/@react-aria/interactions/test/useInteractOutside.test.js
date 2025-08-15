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
  installPointerEvent,
  pointerMap,
  render,
  waitFor,
} from "@react-spectrum/test-utils-internal";
import { enableShadowDOM } from "@react-stately/flags";
import React, { useEffect, useRef } from "react";
import ReactDOM, { createPortal } from "react-dom";
import { UNSAFE_PortalProvider } from "@react-aria/overlays";
import { useInteractOutside } from "../";
import userEvent from "@testing-library/user-event";

function Example(props) {
  let ref = useRef();
  useInteractOutside({ ref, ...props });
  return (
    <div ref={ref} data-testid="example">
      test
    </div>
  );
}

function pointerEvent(type, opts) {
  let evt = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(evt, opts);
  return evt;
}

describe("useInteractOutside", function () {
  // TODO: JSDOM doesn't yet support pointer events. Once they do, convert these tests.
  // https://github.com/jsdom/jsdom/issues/2527
  describe("pointer events", function () {
    installPointerEvent();

    it("should fire interact outside events based on pointer events", function () {
      let onInteractOutside = jest.fn();
      let res = render(<Example onInteractOutside={onInteractOutside} />);

      let el = res.getByText("test");
      fireEvent(el, pointerEvent("pointerdown"));
      fireEvent(el, pointerEvent("pointerup"));
      fireEvent.click(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(document.body, pointerEvent("pointerdown"));
      fireEvent(document.body, pointerEvent("pointerup"));
      fireEvent.click(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", function () {
      let onInteractOutside = jest.fn();
      render(<Example onInteractOutside={onInteractOutside} />);

      fireEvent(document.body, pointerEvent("pointerdown", { button: 1 }));
      fireEvent(document.body, pointerEvent("pointerup", { button: 1 }));
      fireEvent.click(document.body, { button: 1 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(document.body, pointerEvent("pointerdown", { button: 0 }));
      fireEvent(document.body, pointerEvent("pointerup", { button: 0 }));
      fireEvent.click(document.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a pointer up event without a pointer down first", function () {
      // Fire pointer down before component with useInteractOutside is mounted
      fireEvent(document.body, pointerEvent("pointerdown"));

      let onInteractOutside = jest.fn();
      render(<Example onInteractOutside={onInteractOutside} />);

      fireEvent(document.body, pointerEvent("pointerup"));
      fireEvent.click(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  describe("mouse events", function () {
    it("should fire interact outside events based on mouse events", function () {
      let onInteractOutside = jest.fn();
      let res = render(<Example onInteractOutside={onInteractOutside} />);

      let el = res.getByText("test");
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", function () {
      let onInteractOutside = jest.fn();
      render(<Example onInteractOutside={onInteractOutside} />);

      fireEvent.mouseDown(document.body, { button: 1 });
      fireEvent.mouseUp(document.body, { button: 1 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(document.body, { button: 0 });
      fireEvent.mouseUp(document.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a mouse up event without a mouse down first", function () {
      // Fire mouse down before component with useInteractOutside is mounted
      fireEvent.mouseDown(document.body);

      let onInteractOutside = jest.fn();
      render(<Example onInteractOutside={onInteractOutside} />);

      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  describe("touch events", function () {
    it("should fire interact outside events based on mouse events", function () {
      let onInteractOutside = jest.fn();
      let res = render(<Example onInteractOutside={onInteractOutside} />);

      let el = res.getByText("test");
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should ignore emulated mouse events", function () {
      let onInteractOutside = jest.fn();
      let res = render(<Example onInteractOutside={onInteractOutside} />);

      let el = res.getByText("test");
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a touch end event without a touch start first", function () {
      // Fire mouse down before component with useInteractOutside is mounted
      fireEvent.touchStart(document.body);

      let onInteractOutside = jest.fn();
      render(<Example onInteractOutside={onInteractOutside} />);

      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });
  describe("disable interact outside events", function () {
    it("does not handle pointer events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(<Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent(document.body, pointerEvent("mousedown"));
      fireEvent(document.body, pointerEvent("mouseup"));
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle touch events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(<Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent.touchStart(document.body);
      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle mouse events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(<Example isDisabled onInteractOutside={onInteractOutside} />);

      fireEvent.mouseDown(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });
});

describe("useInteractOutside (iframes)", function () {
  let iframe;
  let iframeRoot;
  let iframeDocument;
  beforeEach(() => {
    iframe = document.createElement("iframe");
    window.document.body.appendChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeRoot = iframeDocument.createElement("div");
    iframeDocument.body.appendChild(iframeRoot);
  });

  afterEach(() => {
    iframe.remove();
  });

  const IframeExample = (props) => {
    return createPortal(<Example {...props} />, iframeRoot);
  };

  // TODO: JSDOM doesn't yet support pointer events. Once they do, convert these tests.
  // https://github.com/jsdom/jsdom/issues/2527
  describe("pointer events", function () {
    installPointerEvent();

    it("should fire interact outside events based on pointer events", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      const el = document
        .querySelector("iframe")
        .contentWindow.document.body.querySelector(
          'div[data-testid="example"]',
        );
      fireEvent(el, pointerEvent("pointerdown"));
      fireEvent(el, pointerEvent("pointerup"));
      fireEvent.click(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(iframeDocument.body, pointerEvent("pointerdown"));
      fireEvent(iframeDocument.body, pointerEvent("pointerup"));
      fireEvent.click(iframeDocument.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      fireEvent(
        iframeDocument.body,
        pointerEvent("pointerdown", { button: 1 }),
      );
      fireEvent(iframeDocument.body, pointerEvent("pointerup", { button: 1 }));
      fireEvent.click(iframeDocument.body, { button: 0 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(
        iframeDocument.body,
        pointerEvent("pointerdown", { button: 0 }),
      );
      fireEvent(iframeDocument.body, pointerEvent("pointerup", { button: 0 }));
      fireEvent.click(iframeDocument.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a pointer up event without a pointer down first", async function () {
      // Fire pointer down before component with useInteractOutside is mounted
      fireEvent(iframeDocument.body, pointerEvent("pointerdown"));

      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });
      fireEvent(iframeDocument.body, pointerEvent("pointerup"));
      fireEvent.click(iframeDocument.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  describe("mouse events", function () {
    it("should fire interact outside events based on mouse events", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      const el = document
        .querySelector("iframe")
        .contentWindow.document.body.querySelector(
          'div[data-testid="example"]',
        );
      fireEvent.mouseDown(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(iframeDocument.body);
      fireEvent.mouseUp(iframeDocument.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should only listen for the left mouse button", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      fireEvent.mouseDown(iframeDocument.body, { button: 1 });
      fireEvent.mouseUp(iframeDocument.body, { button: 1 });
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseDown(iframeDocument.body, { button: 0 });
      fireEvent.mouseUp(iframeDocument.body, { button: 0 });
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a mouse up event without a mouse down first", async function () {
      // Fire mouse down before component with useInteractOutside is mounted
      fireEvent.mouseDown(iframeDocument.body);

      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });
      fireEvent.mouseUp(iframeDocument.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  describe("touch events", function () {
    it("should fire interact outside events based on mouse events", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      const el = document
        .querySelector("iframe")
        .contentWindow.document.body.querySelector(
          'div[data-testid="example"]',
        );
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(iframeDocument.body);
      fireEvent.touchEnd(iframeDocument.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should ignore emulated mouse events", async function () {
      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      await waitFor(() => {
        expect(
          document
            .querySelector("iframe")
            .contentWindow.document.body.querySelector(
              'div[data-testid="example"]',
            ),
        ).toBeTruthy();
      });

      const el = document
        .querySelector("iframe")
        .contentWindow.document.body.querySelector(
          'div[data-testid="example"]',
        );
      fireEvent.touchStart(el);
      fireEvent.touchEnd(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchStart(iframeDocument.body);
      fireEvent.touchEnd(iframeDocument.body);
      fireEvent.mouseUp(iframeDocument.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it("should not fire interact outside if there is a touch end event without a touch start first", function () {
      // Fire mouse down before component with useInteractOutside is mounted
      fireEvent.touchStart(iframeDocument.body);

      let onInteractOutside = jest.fn();
      render(<IframeExample onInteractOutside={onInteractOutside} />);

      fireEvent.touchEnd(iframeDocument.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });

  describe("disable interact outside events", function () {
    it("does not handle pointer events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(
        <IframeExample isDisabled onInteractOutside={onInteractOutside} />,
      );

      fireEvent(iframeDocument.body, pointerEvent("mousedown"));
      fireEvent(iframeDocument.body, pointerEvent("mouseup"));
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle touch events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(
        <IframeExample isDisabled onInteractOutside={onInteractOutside} />,
      );

      fireEvent.touchStart(iframeDocument.body);
      fireEvent.touchEnd(iframeDocument.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });

    it("does not handle mouse events if disabled", function () {
      let onInteractOutside = jest.fn();
      render(
        <IframeExample isDisabled onInteractOutside={onInteractOutside} />,
      );

      fireEvent.mouseDown(iframeDocument.body);
      fireEvent.mouseUp(iframeDocument.body);
      expect(onInteractOutside).not.toHaveBeenCalled();
    });
  });
});

describe("useInteractOutside shadow DOM", function () {
  // Helper function to create a shadow root and render the component inside it
  function createShadowRootAndRender(ui) {
    const shadowHost = document.createElement("div");
    document.body.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    function WrapperComponent() {
      return ReactDOM.createPortal(ui, shadowRoot);
    }

    render(<WrapperComponent />);
    return { shadowRoot, cleanup: () => document.body.removeChild(shadowHost) };
  }

  function App({ onInteractOutside }) {
    const ref = useRef(null);
    useInteractOutside({ ref, onInteractOutside });

    return (
      <div>
        <div id="outside-popover" />
        <div id="popover" ref={ref}>
          <div id="inside-popover" />
        </div>
      </div>
    );
  }

  it("does not trigger when clicking inside popover", function () {
    const onInteractOutside = jest.fn();
    const { shadowRoot, cleanup } = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />,
    );

    const insidePopover = shadowRoot.getElementById("inside-popover");
    fireEvent.mouseDown(insidePopover);
    fireEvent.mouseUp(insidePopover);

    expect(onInteractOutside).not.toHaveBeenCalled();
    cleanup();
  });

  it("does not trigger when clicking the popover", function () {
    const onInteractOutside = jest.fn();
    const { shadowRoot, cleanup } = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />,
    );

    const popover = shadowRoot.getElementById("popover");
    fireEvent.mouseDown(popover);
    fireEvent.mouseUp(popover);

    expect(onInteractOutside).not.toHaveBeenCalled();
    cleanup();
  });

  it("triggers when clicking outside the popover", function () {
    const onInteractOutside = jest.fn();
    const { cleanup } = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />,
    );

    // Clicking on the document body outside the shadow DOM
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("triggers when clicking a button outside the shadow dom altogether", function () {
    const onInteractOutside = jest.fn();
    const { cleanup } = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} />,
    );
    // Button outside shadow DOM and component
    const button = document.createElement("button");
    document.body.appendChild(button);

    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);
    document.body.removeChild(button);
    cleanup();
  });
});

describe("useInteractOutside shadow DOM extended tests", function () {
  // Setup function similar to previous tests, but includes a dynamic element scenario
  function createShadowRootAndRender(ui) {
    const shadowHost = document.createElement("div");
    document.body.appendChild(shadowHost);
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    function WrapperComponent() {
      return ReactDOM.createPortal(ui, shadowRoot);
    }

    render(<WrapperComponent />);
    return { shadowRoot, cleanup: () => document.body.removeChild(shadowHost) };
  }

  function App({ onInteractOutside, includeDynamicElement = false }) {
    const ref = useRef(null);
    useInteractOutside({ ref, onInteractOutside });

    useEffect(() => {
      if (includeDynamicElement) {
        const dynamicEl = document.createElement("div");
        dynamicEl.id = "dynamic-outside";
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

  it("correctly identifies interaction with dynamically added external elements", function () {
    jest.useFakeTimers();
    const onInteractOutside = jest.fn();
    const { cleanup } = createShadowRootAndRender(
      <App onInteractOutside={onInteractOutside} includeDynamicElement />,
    );

    const dynamicEl = document.getElementById("dynamic-outside");
    fireEvent.mouseDown(dynamicEl);
    fireEvent.mouseUp(dynamicEl);

    expect(onInteractOutside).toHaveBeenCalledTimes(1);

    cleanup();
  });
});

describe("useInteractOutside with Shadow DOM and UNSAFE_PortalProvider", () => {
  let user;

  beforeAll(() => {
    enableShadowDOM();
    user = userEvent.setup({ delay: null, pointerMap });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it("should handle interact outside events with UNSAFE_PortalProvider in shadow DOM", async () => {
    const { shadowRoot } = createShadowRoot();
    let interactOutsideTriggered = false;

    // Create portal container within the shadow DOM for the popover
    const popoverPortal = document.createElement("div");
    popoverPortal.setAttribute("data-testid", "popover-portal");
    shadowRoot.appendChild(popoverPortal);

    function ShadowInteractOutsideExample() {
      const ref = useRef();
      useInteractOutside({
        ref,
        onInteractOutside: () => {
          interactOutsideTriggered = true;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="container">
            {ReactDOM.createPortal(
              <>
                <div
                  ref={ref}
                  data-testid="target"
                  style={{ padding: "20px", background: "lightblue" }}
                >
                  <button data-testid="inner-button">Inner Button</button>
                  <input data-testid="inner-input" placeholder="Inner Input" />
                </div>
                <button data-testid="outside-button">Outside Button</button>
              </>,
              popoverPortal,
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<ShadowInteractOutsideExample />);

    const target = shadowRoot.querySelector('[data-testid="target"]');
    const innerButton = shadowRoot.querySelector(
      '[data-testid="inner-button"]',
    );
    const outsideButton = shadowRoot.querySelector(
      '[data-testid="outside-button"]',
    );

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
    document.body.removeChild(shadowRoot.host);
  });

  it("should correctly identify interactions across shadow DOM boundaries (issue #8675)", async () => {
    const { shadowRoot } = createShadowRoot();
    let popoverClosed = false;

    function MenuPopoverExample() {
      const popoverRef = useRef();
      useInteractOutside({
        ref: popoverRef,
        onInteractOutside: () => {
          popoverClosed = true;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="app">
            <button data-testid="menu-trigger">Menu Trigger</button>
            <div
              ref={popoverRef}
              data-testid="menu-popover"
              style={{ border: "1px solid gray", padding: "10px" }}
            >
              <div role="menu" data-testid="menu">
                <button
                  role="menuitem"
                  data-testid="menu-item-1"
                  onClick={() => {
                    // This click should NOT trigger interact outside
                    console.log("Menu item 1 clicked");
                  }}
                >
                  Save Document
                </button>
                <button
                  role="menuitem"
                  data-testid="menu-item-2"
                  onClick={() => {
                    console.log("Menu item 2 clicked");
                  }}
                >
                  Export Document
                </button>
              </div>
            </div>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<MenuPopoverExample />);

    const menuItem1 = shadowRoot.querySelector('[data-testid="menu-item-1"]');
    const menuTrigger = shadowRoot.querySelector(
      '[data-testid="menu-trigger"]',
    );
    const menuPopover = shadowRoot.querySelector(
      '[data-testid="menu-popover"]',
    );

    // Click menu item - should NOT close popover (this is the bug being tested)
    await user.click(menuItem1);
    expect(popoverClosed).toBe(false);

    // Click on the popover itself - should NOT close popover
    await user.click(menuPopover);
    expect(popoverClosed).toBe(false);

    // Click outside the popover - SHOULD close popover
    await user.click(menuTrigger);
    expect(popoverClosed).toBe(true);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it("should handle nested portal scenarios with interact outside in shadow DOM", async () => {
    const { shadowRoot } = createShadowRoot();
    const modalPortal = document.createElement("div");
    modalPortal.setAttribute("data-testid", "modal-portal");
    shadowRoot.appendChild(modalPortal);

    let modalInteractOutside = false;
    let popoverInteractOutside = false;

    function NestedPortalsExample() {
      const modalRef = useRef();
      const popoverRef = useRef();

      useInteractOutside({
        ref: modalRef,
        onInteractOutside: () => {
          modalInteractOutside = true;
        },
      });

      useInteractOutside({
        ref: popoverRef,
        onInteractOutside: () => {
          popoverInteractOutside = true;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="main-app">
            <button data-testid="main-button">Main Button</button>

            {/* Modal */}
            {ReactDOM.createPortal(
              <div
                ref={modalRef}
                data-testid="modal"
                style={{ background: "rgba(0,0,0,0.5)", padding: "20px" }}
              >
                <div role="dialog">
                  <button data-testid="modal-button">Modal Button</button>

                  {/* Popover within modal */}
                  <div
                    ref={popoverRef}
                    data-testid="popover-in-modal"
                    style={{
                      background: "white",
                      border: "1px solid gray",
                      padding: "10px",
                    }}
                  >
                    <button data-testid="popover-button">Popover Button</button>
                  </div>
                </div>
              </div>,
              modalPortal,
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<NestedPortalsExample />);

    const mainButton = shadowRoot.querySelector('[data-testid="main-button"]');
    const modalButton = shadowRoot.querySelector(
      '[data-testid="modal-button"]',
    );
    const popoverButton = shadowRoot.querySelector(
      '[data-testid="popover-button"]',
    );

    // Click popover button - should NOT trigger either interact outside
    await user.click(popoverButton);
    expect(popoverInteractOutside).toBe(false);
    expect(modalInteractOutside).toBe(false);

    // Click modal button - should trigger popover interact outside but NOT modal
    await user.click(modalButton);
    expect(popoverInteractOutside).toBe(true);
    expect(modalInteractOutside).toBe(false);

    // Reset and click completely outside
    popoverInteractOutside = false;
    modalInteractOutside = false;

    await user.click(mainButton);
    expect(modalInteractOutside).toBe(true);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it("should handle pointer events correctly in shadow DOM with portal provider", async () => {
    installPointerEvent();

    const { shadowRoot } = createShadowRoot();
    let interactOutsideCount = 0;

    function PointerEventsExample() {
      const ref = useRef();
      useInteractOutside({
        ref,
        onInteractOutside: () => {
          interactOutsideCount++;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="container">
            <div ref={ref} data-testid="target">
              <button data-testid="target-button">Target Button</button>
            </div>
            <button data-testid="outside-button">Outside Button</button>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<PointerEventsExample />);

    const targetButton = shadowRoot.querySelector(
      '[data-testid="target-button"]',
    );
    const outsideButton = shadowRoot.querySelector(
      '[data-testid="outside-button"]',
    );

    // Simulate pointer events on target - should NOT trigger interact outside
    fireEvent(targetButton, pointerEvent("pointerdown"));
    fireEvent(targetButton, pointerEvent("pointerup"));
    fireEvent.click(targetButton);
    expect(interactOutsideCount).toBe(0);

    // Simulate pointer events outside - should trigger interact outside
    fireEvent(outsideButton, pointerEvent("pointerdown"));
    fireEvent(outsideButton, pointerEvent("pointerup"));
    fireEvent.click(outsideButton);
    expect(interactOutsideCount).toBe(1);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it("should handle interact outside with dynamic content in shadow DOM", async () => {
    const { shadowRoot } = createShadowRoot();
    let interactOutsideCount = 0;

    function DynamicContentExample() {
      const ref = useRef();
      const [showContent, setShowContent] = React.useState(true);

      useInteractOutside({
        ref,
        onInteractOutside: () => {
          interactOutsideCount++;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="container">
            <div ref={ref} data-testid="target">
              <button
                data-testid="toggle-button"
                onClick={() => setShowContent(!showContent)}
              >
                Toggle Content
              </button>
              {showContent && (
                <div data-testid="dynamic-content">
                  <button data-testid="dynamic-button">Dynamic Button</button>
                </div>
              )}
            </div>
            <button data-testid="outside-button">Outside Button</button>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<DynamicContentExample />);

    const toggleButton = shadowRoot.querySelector(
      '[data-testid="toggle-button"]',
    );
    const dynamicButton = shadowRoot.querySelector(
      '[data-testid="dynamic-button"]',
    );
    const outsideButton = shadowRoot.querySelector(
      '[data-testid="outside-button"]',
    );

    // Click dynamic content - should NOT trigger interact outside
    await user.click(dynamicButton);
    expect(interactOutsideCount).toBe(0);

    // Toggle to remove content, then click outside - should trigger interact outside
    await user.click(toggleButton);
    await user.click(outsideButton);
    expect(interactOutsideCount).toBe(1);

    // Toggle content back and click it - should still NOT trigger interact outside
    await user.click(toggleButton);
    const newDynamicButton = shadowRoot.querySelector(
      '[data-testid="dynamic-button"]',
    );
    await user.click(newDynamicButton);
    expect(interactOutsideCount).toBe(1); // Should remain 1

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it("should handle interact outside across mixed shadow DOM and regular DOM boundaries", async () => {
    const { shadowRoot } = createShadowRoot();
    let interactOutsideTriggered = false;

    // Create a regular DOM button outside the shadow DOM
    const regularDOMButton = document.createElement("button");
    regularDOMButton.textContent = "Regular DOM Button";
    regularDOMButton.setAttribute("data-testid", "regular-dom-button");
    document.body.appendChild(regularDOMButton);

    function MixedDOMExample() {
      const ref = useRef();
      useInteractOutside({
        ref,
        onInteractOutside: () => {
          interactOutsideTriggered = true;
        },
      });

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="shadow-container">
            <div ref={ref} data-testid="shadow-target">
              <button data-testid="shadow-button">Shadow Button</button>
            </div>
            <button data-testid="shadow-outside">Shadow Outside Button</button>
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const { unmount } = render(<MixedDOMExample />);

    const shadowButton = shadowRoot.querySelector(
      '[data-testid="shadow-button"]',
    );
    const shadowOutside = shadowRoot.querySelector(
      '[data-testid="shadow-outside"]',
    );

    // Click inside shadow target - should NOT trigger
    await user.click(shadowButton);
    expect(interactOutsideTriggered).toBe(false);

    // Click outside in shadow DOM - should trigger
    await user.click(shadowOutside);
    expect(interactOutsideTriggered).toBe(true);

    // Reset and test regular DOM interaction
    interactOutsideTriggered = false;
    await user.click(regularDOMButton);
    expect(interactOutsideTriggered).toBe(true);

    // Cleanup
    document.body.removeChild(regularDOMButton);
    unmount();
    document.body.removeChild(shadowRoot.host);
  });
});

function pointerEvent(type, opts) {
  let evt = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(evt, opts);
  return evt;
}
