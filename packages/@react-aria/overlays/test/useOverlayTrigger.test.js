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

import {fireEvent, render} from '@react-spectrum/test-utils-internal';
import React, {useRef} from 'react';
import {useOverlayPosition, useOverlayTrigger} from '../';
import {useOverlayTriggerState} from '@react-stately/overlays';

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
  return <div ref={ref} data-testid={props['data-testid'] || 'test'}>{props.children}</div>;
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
});
