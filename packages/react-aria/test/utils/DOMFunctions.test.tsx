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
import {getPropagationTargets, nodeContains} from '../../src/utils/shadowdom/DOMFunctions';
import React, {HTMLAttributes, ReactNode, useCallback, useRef, useState} from 'react';
import {screen} from 'shadow-dom-testing-library';

describe('nodeContains with shadow DOM', function () {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('can tell if a node is contained even if it is within a shadow DOM', function () {
    const {shadowRoot, shadowHost, cleanup} = createShadowRoot();

    render(
      <div>
        <input type="checkbox" />
        <button>Button</button>
        <input type="checkbox" />
      </div>,
      {container: shadowRoot as unknown as HTMLElement}
    );

    let button = screen.getByShadowRole('button');

    expect(nodeContains(shadowRoot, button)).toBe(true);
    expect(nodeContains(shadowHost, button)).toBe(true);

    cleanup();
  });
});

describe('getPropagationTargets with shadow DOM', function () {
  beforeAll(() => {
    enableShadowDOM();
  });

  it('can just get the global window', function () {
    const {shadowRoot, cleanup} = createShadowRoot();
    render(
      <div>
        <div>Shadow root</div>
      </div>,
      {container: shadowRoot as unknown as HTMLElement}
    );
    expect(getPropagationTargets(null)).toEqual([window]);
    // @ts-expect-error - can fix this after improved ts pr is merged
    expect(getPropagationTargets(document)).toEqual([window]);
    // @ts-expect-error - can fix this after improved ts pr is merged
    expect(getPropagationTargets(window)).toEqual([window]);
    cleanup();
  });

  it('can get the propagation targets from a shadow root', function () {
    const {shadowRoot, cleanup} = createShadowRoot();
    render(
      <div>
        <button id="target">Shadow child</button>
      </div>,
      {container: shadowRoot as unknown as HTMLElement}
    );
    let target = screen.getByShadowRole('button');
    expect(getPropagationTargets(target)).toEqual([window, shadowRoot]);
    expect(getPropagationTargets(target, document)).toEqual([document, shadowRoot]);
    expect(getPropagationTargets(target, window)).toEqual([window, shadowRoot]);
    cleanup();
  });

  it('can get the propagation targets for multiple nested shadow roots', function () {
    const {shadowRoot, cleanup} = createShadowRoot();
    const intermediateNode = document.createElement('div');
    shadowRoot.appendChild(intermediateNode);
    const {shadowRoot: shadowRoot2, cleanup: cleanup2} = createShadowRoot(intermediateNode);

    render(<button>Shadow root</button>, {container: shadowRoot2 as unknown as HTMLElement});

    let target = screen.getByShadowRole('button');
    expect(getPropagationTargets(target)).toEqual([window, shadowRoot2, shadowRoot]);
    expect(getPropagationTargets(target, document)).toEqual([document, shadowRoot2, shadowRoot]);
    expect(getPropagationTargets(target, intermediateNode)).toEqual([
      intermediateNode,
      shadowRoot2
    ]);
    cleanup2();
    shadowRoot.removeChild(intermediateNode);
    cleanup();
  });

  it('does not return propagation targets when given a null destination', function () {
    const {shadowRoot, cleanup} = createShadowRoot();
    render(<button>Shadow root</button>, {container: shadowRoot as unknown as HTMLElement});

    let target = screen.getByShadowRole('button');
    expect(getPropagationTargets(target, null)).toEqual([]);
    cleanup();
  });
});
