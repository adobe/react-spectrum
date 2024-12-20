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

import {fireEvent, render} from '@react-spectrum/test-utils-internal';
import React, {useRef} from 'react';
import {useOverlayTriggerState} from '@react-stately/overlays';
import {usePopover} from '../';

function Example() {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const state = useOverlayTriggerState({isOpen: true});
  const {popoverProps} = usePopover({triggerRef, popoverRef}, state);

  return (
    <div>
      <div ref={triggerRef} />
      <div {...popoverProps} ref={popoverRef} />
    </div>
  );
}

describe('usePopover', () => {
  it('should not add scroll listener', () => {
    const spy = jest.spyOn(window, 'addEventListener');
    render(<Example />);

    fireEvent.scroll(document.body);
    expect(window.addEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function), true);
    spy.mockRestore();
  });
});
