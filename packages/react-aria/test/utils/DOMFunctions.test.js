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
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {nodeContains} from '../../src/utils/shadowdom/DOMFunctions';
import React from 'react';
import ReactDOM from 'react-dom';
import {screen} from 'shadow-dom-testing-library';

describe('nodeContains with shadow DOM', function () {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('can tell if a node is contained even if it is within a shadow DOM', function () {
    const {shadowRoot, shadowHost, cleanup} = createShadowRoot();
    let Wrapper = () =>
      ReactDOM.createPortal(
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

  it('can tell if slotted light DOM content is contained by a node inside the shadow root', function () {
    const {shadowHost, shadowRoot, cleanup} = createShadowRoot();

    // A <slot> lives inside the shadow root, wrapped in a container element.
    const container = document.createElement('div');
    const slot = document.createElement('slot');
    container.appendChild(slot);
    shadowRoot.appendChild(container);

    // A light DOM child of the host gets projected into the slot.
    const button = document.createElement('button');
    shadowHost.appendChild(button);

    // Sanity check that the browser assigned the button to the slot.
    expect(button.assignedSlot).toBe(slot);

    // The button's DOM parent is the host (light DOM), so reaching `container`
    // (inside the shadow root) is only possible by following assignedSlot:
    // button -> assignedSlot (slot) -> slot.parentNode (container).
    expect(nodeContains(container, button)).toBe(true);
    expect(nodeContains(shadowRoot, button)).toBe(true);

    // A sibling outside the slotted subtree should not be considered contained.
    const outside = document.createElement('span');
    document.body.appendChild(outside);
    expect(nodeContains(container, outside)).toBe(false);
    document.body.removeChild(outside);

    cleanup();
  });
});
