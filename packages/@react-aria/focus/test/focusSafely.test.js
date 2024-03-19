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


import {act, render} from '@react-spectrum/test-utils';
import {createShadowRoot} from '@react-spectrum/test-utils/src/shadowDOM';
import {focusSafely} from '../';
import React from 'react';
import * as ReactAriaUtils from '../../utils/index';
import ReactDOM from 'react-dom';
import {setInteractionModality} from '@react-aria/interactions';

jest.useFakeTimers();

describe('focusSafely', () => {
  const focusWithoutScrollingSpy = jest.spyOn(ReactAriaUtils, 'focusWithoutScrolling').mockImplementation(() => {});

  it("should not focus on the element if it's no longer connected", async function () {
    setInteractionModality('virtual');

    const Example = () => <button>Button</button>;
    const {unmount} = render(<Example />);

    const button = document.body.querySelector('button');

    requestAnimationFrame(() => {
      unmount();
    });
    expect(button).toBeTruthy();
    focusSafely(button);

    act(() => {
      jest.runAllTimers();
    });

    expect(focusWithoutScrollingSpy).toBeCalledTimes(0);
  });

  it("should focus on the element if it's connected", async function () {
    setInteractionModality('virtual');

    const Example = () => <button>Button</button>;
    render(<Example />);

    const button = document.body.querySelector('button');

    expect(button).toBeTruthy();
    focusSafely(button);

    act(() => {
      jest.runAllTimers();
    });

    expect(focusWithoutScrollingSpy).toBeCalledTimes(1);
  });

  describe('focusSafely with Shadow DOM', function () {
    const focusWithoutScrollingSpy = jest.spyOn(ReactAriaUtils, 'focusWithoutScrolling').mockImplementation(() => {});

    it("should not focus on the element if it's no longer connected within shadow DOM", async function () {
      const {shadowRoot, shadowHost} = createShadowRoot();
      setInteractionModality('virtual');

      const Example = () => <button>Button</button>;
      ReactDOM.render(<Example />, shadowRoot);

      const button = shadowRoot.querySelector('button');

      requestAnimationFrame(() => {
        ReactDOM.unmountComponentAtNode(shadowRoot);
        document.body.removeChild(shadowHost);
      });
      expect(button).toBeTruthy();
      focusSafely(button);

      act(() => {
        jest.runAllTimers();
      });

      expect(focusWithoutScrollingSpy).toBeCalledTimes(0);
    });

    it("should focus on the element if it's connected within shadow DOM", async function () {
      const {shadowRoot} = createShadowRoot();
      setInteractionModality('virtual');

      const Example = () => <button>Button</button>;
      ReactDOM.render(<Example />, shadowRoot);

      const button = shadowRoot.querySelector('button');

      expect(button).toBeTruthy();
      focusSafely(button);

      act(() => {
        jest.runAllTimers();
      });

      expect(focusWithoutScrollingSpy).toBeCalledTimes(1);

      // Cleanup
      ReactDOM.unmountComponentAtNode(shadowRoot);
      shadowRoot.host.remove();
    });
  });
});
