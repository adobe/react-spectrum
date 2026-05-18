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

import {act, pointerMap, render, simulateDesktop} from '@react-spectrum/test-utils-internal';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Footer} from '../../src/view/Footer';
import {Heading} from '../../src/text/Heading';
import {Link} from '../../src/link/Link';
import {Provider} from '../../src/provider/Provider';
import React from 'react';
import {defaultTheme as theme} from '../../src/theme-default/defaultTheme';
import userEvent from '@testing-library/user-event';

describe('ContextualHelp', function () {
  beforeAll(() => {
    jest.useFakeTimers();
    simulateDesktop();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // this needs to be a setTimeout so that the dialog can be removed from the dom before the callback is invoked
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(), 0));
  });

  it('renders quiet action button', function () {
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp>
          <Heading>Test title</Heading>
        </ContextualHelp>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    expect(button).toBeVisible();
    expect(button).toHaveClass('spectrum-ActionButton--quiet');
  });

  it('opens a popover', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole, getByTestId, getByText} = render(
      <Provider theme={theme}>
        <ContextualHelp>
          <Heading>Test title</Heading>
        </ContextualHelp>
      </Provider>
    );

    expect(queryByRole('dialog')).toBeNull();

    let button = getByRole('button');
    await user.click(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    let modal = getByTestId('popover');
    expect(modal).toBeVisible();

    expect(getByText('Test title')).toBeVisible();
  });

  it('renders content', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <ContextualHelp>
          <Heading>Test title</Heading>
          <Content>Help content</Content>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    const content = getByText('Help content');
    expect(content).toBeVisible();
  });

  it('renders a link', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <ContextualHelp>
          <Heading>Test title</Heading>
          <Content>Help content</Content>
          <Footer>
            <Link>Test link</Link>
          </Footer>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);

    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();

    const content = getByText('Test link');
    expect(content).toBeVisible();
    expect(content.parentElement).toHaveClass('react-spectrum-ContextualHelp-footer');
  });

  it('includes a default aria-label', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp>
          <Heading>Test title</Heading>
          <Content>Help content</Content>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Help');
  });

  it('includes a default aria-label for info variant', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp variant="info">
          <Heading>Test title</Heading>
          <Content>Help content</Content>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Information');
  });

  it('supports a custom aria-label', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp aria-label="test">
          <Heading>Test title</Heading>
          <Content>Help content</Content>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'test');
  });

  it('supports a custom aria-labelledby', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <ContextualHelp aria-labelledby="test">
          <Heading>Test title</Heading>
          <Content>Help content</Content>
        </ContextualHelp>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).not.toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-labelledby', 'test');
  });
});
