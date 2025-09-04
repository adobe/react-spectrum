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
    act(() => {
      jest.runAllTimers();
    });
  });

  it('should handle popover interactions with UNSAFE_PortalProvider in shadow DOM', async () => {
    const {shadowRoot} = createShadowRoot();
    let triggerClicked = false;
    let popoverInteracted = false;

    const popoverPortal = document.createElement('div');
    popoverPortal.setAttribute('data-testid', 'popover-portal');
    shadowRoot.appendChild(popoverPortal);

    function ShadowPopoverExample() {
      const triggerRef = useRef(null);
      const popoverRef = useRef(null);
      const state = useOverlayTriggerState({
        defaultOpen: false,
        onOpenChange: isOpen => {
          // Track state changes
        }
      });

      useOverlayTrigger({type: 'listbox'}, state, triggerRef);
      const {popoverProps} = usePopover(
        {
          triggerRef,
          popoverRef,
          placement: 'bottom start'
        },
        state
      );

      return (
        <UNSAFE_PortalProvider getContainer={() => shadowRoot as unknown as HTMLElement}>
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
          {ReactDOM.createPortal(
            <>
              
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
                  <button data-testid="close-popover" onClick={() => state.close()}>
                    Close
                  </button>
                </div>
              )}
            </>,
            popoverPortal
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
    act(() => {
      jest.runAllTimers();
    });

    // Cleanup
    unmount();
    document.body.removeChild(shadowRoot.host);
  });
});
