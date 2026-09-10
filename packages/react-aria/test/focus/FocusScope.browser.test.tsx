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

import {expect, it} from 'vitest';
import {FocusScope} from '../../src/focus/FocusScope';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

function Portal({children}: {children: React.ReactNode}) {
  return ReactDOM.createPortal(children, document.body);
}

function SiblingScopes() {
  let [showFirst, setShowFirst] = useState(true);
  let [showSecond, setShowSecond] = useState(false);

  let openSecond = () => {
    setShowSecond(true);
    setTimeout(() => setShowFirst(false), 50);
  };

  return (
    <FocusScope contain restoreFocus>
      <button>Outside</button>
      {showFirst && (
        <Portal>
          <FocusScope contain restoreFocus autoFocus>
            <button onClick={openSecond}>Choose date and time</button>
          </FocusScope>
        </Portal>
      )}
      {showSecond && (
        <Portal>
          <FocusScope contain restoreFocus autoFocus>
            <button>September</button>
            <button>2026</button>
            <button>Next month</button>
          </FocusScope>
        </Portal>
      )}
    </FocusScope>
  );
}

it.each([
  {direction: 'forward', shift: false, expected: '2026'},
  {direction: 'reverse', shift: true, expected: 'Next month'}
])(
  'keeps $direction Tab navigation in a sibling scope after unmount',
  async ({shift, expected}) => {
    let {getByRole} = await render(<SiblingScopes />);

    await userEvent.click(getByRole('button', {name: 'Choose date and time'}));
    await expect
      .element(getByRole('button', {name: 'Choose date and time'}))
      .not.toBeInTheDocument();
    await expect.element(getByRole('button', {name: 'September'})).toHaveFocus();

    await userEvent.tab({shift});
    await expect.element(getByRole('button', {name: expected})).toHaveFocus();
  }
);
