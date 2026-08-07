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
  createShadowRoot,
  fireEvent,
  installMouseEvent,
  installPointerEvent,
  render
} from '@react-spectrum/test-utils-internal';
import {enableShadowDOM} from '@react-stately/flags';
import {mergeProps} from '../../src/utils/mergeProps';
import React, {useRef} from 'react';
import ReactDOM from 'react-dom';
import {useOverlay} from '../../src/overlays/useOverlay';

function Example(props) {
  let ref = useRef();
  let {overlayProps, underlayProps} = useOverlay(props, ref);
  return (
    <div {...mergeProps(underlayProps, props.underlayProps || {})} data-testid={'underlay'}>
      <div ref={ref} {...overlayProps} data-testid={props['data-testid'] || 'test'}>
        {props.children}
      </div>
    </div>
  );
}

describe('useOverlay with shadow dom', () => {
  beforeAll(() => {
    enableShadowDOM();
  });

  describe.each`
    type              | prepare              | actions
    ${'Mouse Events'} | ${installMouseEvent} | ${[el => fireEvent.mouseDown(el, {button: 0}), el => fireEvent.mouseUp(el, {button: 0})]}
    ${'Pointer Events'} | ${installPointerEvent} | ${[el => fireEvent.pointerDown(el, {button: 0, pointerId: 1}), el => {
    fireEvent.pointerUp(el, {button: 0, pointerId: 1});
    fireEvent.click(el, {button: 0, pointerId: 1});
  }]}
    ${'Touch Events'} | ${() => {}}          | ${[el => fireEvent.touchStart(el, {changedTouches: [{identifier: 1}]}), el => fireEvent.touchEnd(el, {changedTouches: [{identifier: 1}]})]}
  `('$type', ({actions: [pressStart, pressEnd], prepare}) => {
    prepare();

    it('should close the overlay when clicking outside if shouldCloseOnInteractOutside returns true', function () {
      const {shadowRoot, cleanup} = createShadowRoot();

      let onClose = jest.fn();
      let underlay;

      const WrapperComponent = () =>
        ReactDOM.createPortal(
          <Example
            isOpen
            onClose={onClose}
            isDismissable
            shouldCloseOnInteractOutside={target => {
              return target === underlay;
            }}
          />,
          shadowRoot
        );

      const {unmount} = render(<WrapperComponent />);

      underlay = shadowRoot.querySelector("[data-testid='underlay']");

      pressStart(underlay);
      pressEnd(underlay);
      expect(onClose).toHaveBeenCalled();

      // Cleanup
      unmount();
      cleanup();
    });

    it('should not close the overlay when clicking outside if shouldCloseOnInteractOutside returns false', function () {
      const {shadowRoot, cleanup} = createShadowRoot();

      let onClose = jest.fn();
      let underlay;

      const WrapperComponent = () =>
        ReactDOM.createPortal(
          <Example
            isOpen
            onClose={onClose}
            isDismissable
            shouldCloseOnInteractOutside={target => target !== underlay}
          />,
          shadowRoot
        );

      const {unmount} = render(<WrapperComponent />);

      underlay = shadowRoot.querySelector("[data-testid='underlay']");

      pressStart(underlay);
      pressEnd(underlay);
      expect(onClose).not.toHaveBeenCalled();

      // Cleanup
      unmount();
      cleanup();
    });
  });
});
