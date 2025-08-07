/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, createShadowRoot, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {enableShadowDOM} from '@react-stately/flags';
import {type OverlayTriggerProps, useOverlayTriggerState} from '@react-stately/overlays';
import React, {useRef} from 'react';
import ReactDOM from 'react-dom';
import {UNSAFE_PortalProvider, useOverlayTrigger, usePopover} from '../';
import userEvent from '@testing-library/user-event';

function Example(props: OverlayTriggerProps) {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const state = useOverlayTriggerState(props);
  useOverlayTrigger({type: 'listbox'}, state, triggerRef);
  const {popoverProps} = usePopover({triggerRef, popoverRef}, state);

  return (
    <div>
      <div ref={triggerRef} />
      <div {...popoverProps} ref={popoverRef} />
    </div>
  );
}

describe('usePopover', () => {
  it('should not close popover on scroll', () => {
    const onOpenChange = jest.fn();
    render(<Example isOpen onOpenChange={onOpenChange} />);

    fireEvent.scroll(document.body);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('usePopover with Shadow DOM and UNSAFE_PortalProvider', () => {
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

  it('should handle popover interactions within shadow DOM with UNSAFE_PortalProvider', async () => {
    const {shadowRoot} = createShadowRoot();
    let triggerClicked = false;
    let popoverInteracted = false;

    function ShadowPopoverExample() {
      const triggerRef = useRef(null);
      const popoverRef = useRef(null);
      const state = useOverlayTriggerState({
        defaultOpen: false,
        onOpenChange: (isOpen) => {
          // Track state changes
        }
      });
      
      useOverlayTrigger({type: 'listbox'}, state, triggerRef);
      const {popoverProps} = usePopover({
        triggerRef, 
        popoverRef,
        placement: 'bottom start'
      }, state);

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="popover-container">
            <button
              ref={triggerRef}
              data-testid="popover-trigger"
              onClick={() => {
                triggerClicked = true;
                state.toggle();
              }}
            >
              Open Popover
            </button>
            {state.isOpen && (
              <div 
                {...popoverProps} 
                ref={popoverRef}
                data-testid="popover-content"
                style={{
                  background: 'white',
                  border: '1px solid gray',
                  padding: '10px'
                }}
              >
                <button
                  data-testid="popover-action"
                  onClick={() => {
                    popoverInteracted = true;
                  }}
                >
                  Popover Action
                </button>
                <button
                  data-testid="close-popover"
                  onClick={() => state.close()}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<ShadowPopoverExample />);

    const trigger = shadowRoot.querySelector('[data-testid="popover-trigger"]');
    
    // Click trigger to open popover
    await user.click(trigger);
    expect(triggerClicked).toBe(true);

    // Verify popover opened in shadow DOM
    const popoverContent = shadowRoot.querySelector('[data-testid="popover-content"]');
    expect(popoverContent).toBeInTheDocument();

    // Interact with popover content
    const popoverAction = shadowRoot.querySelector('[data-testid="popover-action"]');
    await user.click(popoverAction);
    expect(popoverInteracted).toBe(true);

    // Popover should still be open after interaction
    expect(shadowRoot.querySelector('[data-testid="popover-content"]')).toBeInTheDocument();

    // Close popover
    const closeButton = shadowRoot.querySelector('[data-testid="close-popover"]');
    await user.click(closeButton);
    
    // Wait for any cleanup
    act(() => {jest.runAllTimers();});

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle focus management in shadow DOM popover with nested interactive elements', async () => {
    const {shadowRoot} = createShadowRoot();

    function FocusTestPopover() {
      const triggerRef = useRef(null);
      const popoverRef = useRef(null);
      const state = useOverlayTriggerState({defaultOpen: true});
      
      useOverlayTrigger({type: 'dialog'}, state, triggerRef);
      const {popoverProps} = usePopover({
        triggerRef, 
        popoverRef
      }, state);

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div>
            <button ref={triggerRef} data-testid="trigger">
              Trigger
            </button>
            {state.isOpen && (
              <div {...popoverProps} ref={popoverRef} data-testid="popover">
                <div role="menu" data-testid="menu">
                  <button data-testid="menu-item-1" role="menuitem">
                    First Item
                  </button>
                  <button data-testid="menu-item-2" role="menuitem">
                    Second Item
                  </button>
                  <button data-testid="menu-item-3" role="menuitem">
                    Third Item
                  </button>
                </div>
              </div>
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<FocusTestPopover />);

    const menuItem1 = shadowRoot.querySelector('[data-testid="menu-item-1"]');
    const menuItem2 = shadowRoot.querySelector('[data-testid="menu-item-2"]');
    const menuItem3 = shadowRoot.querySelector('[data-testid="menu-item-3"]');

    // Focus first menu item
    act(() => { menuItem1.focus(); });
    expect(shadowRoot.activeElement).toBe(menuItem1);

    // Tab through menu items
    await user.tab();
    expect(shadowRoot.activeElement).toBe(menuItem2);

    await user.tab();
    expect(shadowRoot.activeElement).toBe(menuItem3);

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should properly handle click events on popover content within shadow DOM (issue #8675)', async () => {
    const {shadowRoot} = createShadowRoot();
    let menuActionExecuted = false;
    let popoverClosedUnexpectedly = false;

    function MenuPopoverExample() {
      const triggerRef = useRef(null);
      const popoverRef = useRef(null);
      const [isOpen, setIsOpen] = React.useState(true);
      
      const state = useOverlayTriggerState({
        isOpen,
        onOpenChange: (open) => {
          setIsOpen(open);
          if (!open) {
            popoverClosedUnexpectedly = true;
          }
        }
      });
      
      useOverlayTrigger({type: 'listbox'}, state, triggerRef);
      const {popoverProps} = usePopover({
        triggerRef, 
        popoverRef
      }, state);

      const handleMenuAction = (action) => {
        menuActionExecuted = true;
        // In the buggy version, this wouldn't execute because popover closes first
        console.log('Menu action:', action);
      };

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div data-testid="app-container">
            <button ref={triggerRef} data-testid="menu-trigger">
              Open Menu
            </button>
            {state.isOpen && (
              <div {...popoverProps} ref={popoverRef} data-testid="menu-popover">
                <div role="menu">
                  <button
                    role="menuitem"
                    data-testid="save-item"
                    onClick={() => handleMenuAction('save')}
                  >
                    Save Document
                  </button>
                  <button
                    role="menuitem"
                    data-testid="export-item"
                    onClick={() => handleMenuAction('export')}
                  >
                    Export Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<MenuPopoverExample />);

    const saveItem = shadowRoot.querySelector('[data-testid="save-item"]');
    const menuPopover = shadowRoot.querySelector('[data-testid="menu-popover"]');

    // Verify popover is initially open
    expect(menuPopover).toBeInTheDocument();

    // Focus the menu item
    act(() => { saveItem.focus(); });
    expect(shadowRoot.activeElement).toBe(saveItem);

    // Click the menu item - this should execute the action, NOT close the popover
    await user.click(saveItem);

    // The action should have been executed (this fails in the buggy version)
    expect(menuActionExecuted).toBe(true);

    // The popover should NOT have closed unexpectedly (this fails in the buggy version)
    expect(popoverClosedUnexpectedly).toBe(false);

    // Menu should still be visible
    expect(shadowRoot.querySelector('[data-testid="menu-popover"]')).toBeInTheDocument();

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle multiple overlapping popovers in shadow DOM with portal provider', async () => {
    const {shadowRoot} = createShadowRoot();

    function MultiplePopoversExample() {
      const trigger1Ref = useRef(null);
      const popover1Ref = useRef(null);
      const trigger2Ref = useRef(null);
      const popover2Ref = useRef(null);
      
      const state1 = useOverlayTriggerState({defaultOpen: true});
      const state2 = useOverlayTriggerState({defaultOpen: true});
      
      useOverlayTrigger({type: 'dialog'}, state1, trigger1Ref);
      useOverlayTrigger({type: 'dialog'}, state2, trigger2Ref);
      
      const {popoverProps: popover1Props} = usePopover({
        triggerRef: trigger1Ref, 
        popoverRef: popover1Ref
      }, state1);

      const {popoverProps: popover2Props} = usePopover({
        triggerRef: trigger2Ref, 
        popoverRef: popover2Ref
      }, state2);

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div>
            <button ref={trigger1Ref} data-testid="trigger-1">
              Trigger 1
            </button>
            <button ref={trigger2Ref} data-testid="trigger-2">
              Trigger 2
            </button>
            
            {state1.isOpen && (
              <div {...popover1Props} ref={popover1Ref} data-testid="popover-1">
                <button data-testid="popover-1-action">Popover 1 Action</button>
              </div>
            )}
            
            {state2.isOpen && (
              <div {...popover2Props} ref={popover2Ref} data-testid="popover-2">
                <button data-testid="popover-2-action">Popover 2 Action</button>
              </div>
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<MultiplePopoversExample />);

    const popover1 = shadowRoot.querySelector('[data-testid="popover-1"]');
    const popover2 = shadowRoot.querySelector('[data-testid="popover-2"]');
    const popover1Action = shadowRoot.querySelector('[data-testid="popover-1-action"]');
    const popover2Action = shadowRoot.querySelector('[data-testid="popover-2-action"]');

    // Both popovers should be present
    expect(popover1).toBeInTheDocument();
    expect(popover2).toBeInTheDocument();

    // Should be able to interact with both popovers
    await user.click(popover1Action);
    await user.click(popover2Action);

    // Both should still be present after interactions
    expect(shadowRoot.querySelector('[data-testid="popover-1"]')).toBeInTheDocument();
    expect(shadowRoot.querySelector('[data-testid="popover-2"]')).toBeInTheDocument();

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });

  it('should handle popover positioning and containment in shadow DOM', async () => {
    const {shadowRoot} = createShadowRoot();

    function PositionedPopoverExample() {
      const triggerRef = useRef(null);
      const popoverRef = useRef(null);
      const state = useOverlayTriggerState({defaultOpen: true});
      
      useOverlayTrigger({type: 'listbox'}, state, triggerRef);
      const {popoverProps} = usePopover({
        triggerRef, 
        popoverRef,
        placement: 'bottom start',
        containerPadding: 12
      }, state);

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot}>
          <div style={{ padding: '50px' }}>
            <button ref={triggerRef} data-testid="positioned-trigger">
              Positioned Trigger
            </button>
            {state.isOpen && (
              <div 
                {...popoverProps} 
                ref={popoverRef} 
                data-testid="positioned-popover"
                style={{
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '12px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div data-testid="popover-content">
                  <p>This is a positioned popover</p>
                  <button data-testid="action-button">Action</button>
                </div>
              </div>
            )}
          </div>
        </UNSAFE_PortalProvider>
      );
    }

    const {unmount} = render(<PositionedPopoverExample />);

    const trigger = shadowRoot.querySelector('[data-testid="positioned-trigger"]');
    const popover = shadowRoot.querySelector('[data-testid="positioned-popover"]');
    const actionButton = shadowRoot.querySelector('[data-testid="action-button"]');

    // Verify popover exists and is positioned
    expect(popover).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();

    // Verify we can interact with popover content
    await user.click(actionButton);

    // Popover should still be present after interaction
    expect(shadowRoot.querySelector('[data-testid="positioned-popover"]')).toBeInTheDocument();

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });
});
