/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Overlay} from '../../src/overlays/Overlay';
import React, {useRef, useState} from 'react';
import userEvent from '@testing-library/user-event';

describe('Overlay', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('restores focus to the element returned by a restoreFocus function', async function () {
    function Test() {
      let [isOpen, setOpen] = useState(false);
      let [showTrigger, setShowTrigger] = useState(true);
      let fallbackRef = useRef(null);
      return (
        <>
          <button ref={fallbackRef}>Fallback</button>
          {showTrigger && <button onClick={() => setOpen(true)}>Open</button>}
          {isOpen && (
            <Overlay restoreFocus={({defaultTarget}) => defaultTarget ?? fallbackRef.current}>
              <button
                onClick={() => {
                  setShowTrigger(false);
                  setOpen(false);
                }}>
                Remove trigger
              </button>
            </Overlay>
          )}
        </>
      );
    }

    let {getByRole} = render(<Test />);
    await user.click(getByRole('button', {name: 'Open'}));
    act(() => jest.runAllTimers());
    await user.click(getByRole('button', {name: 'Remove trigger'}));
    act(() => jest.runAllTimers());
    expect(document.activeElement).toBe(getByRole('button', {name: 'Fallback'}));
  });
});
