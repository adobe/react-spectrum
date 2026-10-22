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

import {act, fireEvent, render} from '@react-spectrum/test-utils-internal';
import {Overlay} from '../../src/overlays/Overlay';
import React, {useRef} from 'react';
import {useOverlayPosition} from '../../src/overlays/useOverlayPosition';
import {useOverlayTrigger} from '../../src/overlays/useOverlayTrigger';
import {useOverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {usePopover} from '../../src/overlays/usePopover';

function Example(props) {
  let ref = useRef();
  let containerRef = useRef();
  let overlayRef = useRef();
  let state = useOverlayTriggerState(props);
  useOverlayTrigger(props, state, ref);
  useOverlayPosition({
    targetRef: ref,
    containerRef,
    overlayRef
  });
  return (
    <div ref={ref} data-testid={props['data-testid'] || 'test'}>
      {props.children}
    </div>
  );
}

describe('useOverlayTrigger', function () {
  it('should close the overlay when the trigger scrolls with useOverlayPosition for backward compatibility', function () {
    let onOpenChange = jest.fn();
    let res = render(
      <div data-testid="scrollable">
        <Example isOpen onOpenChange={onOpenChange} />
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not close the overlay when an adjacent scrollable region scrolls with useOverlayPosition for backward compatibility', function () {
    let onOpenChange = jest.fn();
    let res = render(
      <div>
        <Example isOpen onOpenChange={onOpenChange} />
        <div data-testid="scrollable">test</div>
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('should close the overlay when the body scrolls  with useOverlayPosition for backward compatibility', function () {
    let onOpenChange = jest.fn();
    render(<Example isOpen onOpenChange={onOpenChange} />);

    fireEvent.scroll(document.body);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe('supports restoring focus to the trigger', function () {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    function Popover({name, state, triggerRef, overlayProps}) {
      let popoverRef = useRef(null);
      let {popoverProps} = usePopover({popoverRef, triggerRef}, state);
      return (
        <Overlay>
          <div {...popoverProps} {...overlayProps} ref={popoverRef}>
            <input data-testid={`${name}-inside`} autoFocus />
          </div>
        </Overlay>
      );
    }

    function Trigger({name, ...props}) {
      let triggerRef = useRef(null);
      let state = useOverlayTriggerState(props);
      let {overlayProps} = useOverlayTrigger({type: 'dialog'}, state, triggerRef);
      return (
        <>
          <button data-testid={`${name}-trigger`} ref={triggerRef} />
          {state.isOpen && (
            <Popover
              name={name}
              state={state}
              triggerRef={triggerRef}
              overlayProps={overlayProps}
            />
          )}
        </>
      );
    }

    it('should restore focus to the trigger of an overlay open at mount', function () {
      let {getByTestId} = render(<Trigger name="first" defaultOpen />);
      let trigger = getByTestId('first-trigger');

      fireEvent.keyDown(getByTestId('first-inside'), {key: 'Escape'});
      act(() => jest.runAllTimers());

      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus to its own trigger when overlays close in the same frame', function () {
      function Test({isOpen}) {
        return (
          <>
            <Trigger name="first" isOpen={isOpen} />
            <Trigger name="second" isOpen={isOpen} />
          </>
        );
      }

      let {getByTestId, rerender} = render(<Test isOpen />);
      let trigger = getByTestId('first-trigger');
      // React 18's StrictMode schedules a focus restoration in the frame after mount.
      act(() => jest.runAllTimers());

      act(() => getByTestId('first-inside').focus());
      rerender(<Test isOpen={false} />);
      act(() => jest.runAllTimers());

      expect(document.activeElement).toBe(trigger);
    });
  });
});
