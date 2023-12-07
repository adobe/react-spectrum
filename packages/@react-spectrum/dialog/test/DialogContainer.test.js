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

import {act, fireEvent, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {DialogContainerExample, MenuExample, NestedDialogContainerExample} from '../stories/DialogContainerExamples';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

describe('DialogContainer', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  it('should open and close a dialog based on controlled state', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <DialogContainerExample />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    let dialog = getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    button = within(dialog).getByText('Confirm');

    await user.click(button);
    act(() => {jest.runAllTimers();});

    expect(queryByRole('dialog')).toBeNull();
  });

  it('should support closing a dialog via the Escape key', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <DialogContainerExample />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    let dialog = getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});
    act(() => {jest.runAllTimers();});

    expect(queryByRole('dialog')).toBeNull();
  });

  it('should not close a dialog via the Escape key if isKeyboardDismissDisabled', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <DialogContainerExample isKeyboardDismissDisabled />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    let dialog = getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});
    act(() => {jest.runAllTimers();});

    expect(getByRole('dialog')).toBeVisible();
  });

  it('should not close when clicking outside the dialog by default', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <DialogContainerExample />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    expect(getByRole('dialog')).toBeVisible();

    await user.click(document.body);
    act(() => {jest.runAllTimers();});

    expect(getByRole('dialog')).toBeVisible();
  });

  it('should close when clicking outside the dialog when isDismissible', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <DialogContainerExample isDismissable />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    expect(getByRole('dialog')).toBeVisible();

    await user.click(document.body);
    act(() => {jest.runAllTimers();});

    expect(queryByRole('dialog')).toBeNull();
  });

  it('should not close the dialog when a trigger unmounts', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <MenuExample />
      </Provider>
    );

    let button = getByRole('button');
    expect(queryByRole('dialog')).toBeNull();

    await user.click(button);
    act(() => {jest.runAllTimers();});

    expect(queryByRole('dialog')).toBeNull();

    let menu = getByRole('menu');
    let menuitem = within(menu).getByRole('menuitem');

    await user.click(menuitem);
    act(() => {jest.runAllTimers();});

    expect(queryByRole('menu')).toBeNull();
    expect(queryByRole('menuitem')).toBeNull();

    let dialog = getByRole('dialog');
    button = within(dialog).getByText('Confirm');

    await user.click(button);
    act(() => {jest.runAllTimers();});
    act(() => {jest.runAllTimers();});

    expect(queryByRole('dialog')).toBeNull();
  });

  it('should be able to have dialogs open dialogs and still restore focus', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let {getByRole} = render(
      <Provider theme={theme}>
        <NestedDialogContainerExample />
      </Provider>
    );

    let button = getByRole('button');
    await user.click(button);
    act(() => {jest.runAllTimers();});

    let menu = getByRole('menu');
    let menuitem = within(menu).getAllByRole('menuitem')[0];

    await user.click(menuitem);
    act(() => {jest.runAllTimers();});

    let dialog = getByRole('dialog');
    let confirmButton = within(dialog).getByText('Do that');

    await user.click(confirmButton);
    act(() => {jest.runAllTimers();});

    dialog = getByRole('dialog');
    confirmButton = within(dialog).getByRole('button', {name: 'Do this'});

    expect(document.activeElement).toBe(confirmButton);

    let closeButton = getByRole('button', {name: 'Dismiss'});

    await user.click(closeButton);
    act(() => {jest.runAllTimers();});
    act(() => {jest.runAllTimers();});

    expect(document.activeElement).toBe(button);
  });
});
