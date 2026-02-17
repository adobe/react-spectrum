/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createShadowRoot, render} from '@react-spectrum/test-utils-internal';
import {enableShadowDOM} from '@react-stately/flags';
import {nodeContains} from '..';
import React from 'react';
import ReactDOM from 'react-dom';
import {screen} from 'shadow-dom-testing-library';

describe('nodeContains with shadow DOM', function () {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('can tell if a node is contained even if it is within a shadow DOM', function () {
    const {shadowRoot, shadowHost, cleanup} = createShadowRoot();
    let Wrapper = () => ReactDOM.createPortal(
      <div>
        <input type="checkbox" />
        <button>Button</button>
        <input type="checkbox" />
      </div>,
      shadowRoot
    );
    render(<Wrapper />);

    let button = screen.getByShadowRole('button');

    expect(nodeContains(shadowRoot, button)).toBe(true);
    expect(nodeContains(shadowHost, button)).toBe(true);

    cleanup();
  });
});

