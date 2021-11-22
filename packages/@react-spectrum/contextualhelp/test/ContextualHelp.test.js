/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextualHelp} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {act, render} from '@testing-library/react';
import {triggerPress} from '@react-spectrum/test-utils';
import {theme} from '@react-spectrum/theme-default';

describe('ContextualHelp', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  beforeEach(() => {
    // this needs to be a setTimeout so that the dialog can be removed from the dom before the callback is invoked
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(), 0));
  });

  it('renders quiet action button', function () {
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp title="Test title" />
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    expect(button).toBeVisible();
    expect(button).toHaveClass('spectrum-ActionButton--quiet');
  });

  it('opens a popover', function () {
    let {getByRole, queryByRole, getByTestId, getByText} = render(
      <Provider theme={theme}>
        <ContextualHelp title="Test title" />
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    triggerPress(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let modal = getByTestId('popover');
    expect(modal).toBeVisible();

    expect(getByText('Test title')).toBeVisible();
  });
});
