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

import {act, pointerMap, render, simulateMobile, waitFor} from '@react-spectrum/test-utils-internal';
import {ActionButton, Button} from '@react-spectrum/button';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Item, Menu, MenuTrigger, Section} from '@react-spectrum/menu';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';
import {watchModals} from '../';

describe('watchModals', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  let verify = async function (modal, queryByRole) {
    // this function expects some specific things when verifying
    // that there is a single separator in the dom that is hidden when the modal is open
    // but is accessible when the modal is open
    // that 'Escape' will close whatever the open modal is
    // that focus is given to the modal when it opens

    await waitFor(() => {
      expect(modal).toBeVisible();
    });
    // we shouldn't be able to find it because the search is done by accessibility and the non-modal
    // part of the tree should be inaccessible while the modal is open
    expect(queryByRole('separator')).toBeNull();

    expect(document.activeElement).toBe(modal);
    await user.keyboard('{Escape}');

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    }); // wait for animation

    // once the modal is removed, we should be able to access the main part of the document again
    expect(queryByRole('separator')).toBeVisible();
  };

  it('should hide everything except the modal', async () => {
    watchModals();
    let {getByLabelText, getByRole, queryByRole} = render(
      <>
        <Provider theme={theme}>
          <DialogTrigger>
            <ActionButton aria-label="Trigger" />
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(getByRole('separator')).toBeVisible();
    await user.click(getByLabelText('Trigger'));
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    await verify(dialog, queryByRole);
  });

  it('should handle nested modals', async () => {
    watchModals();
    let {getByLabelText, queryByRole, getByRole, getAllByRole, getByText} = render(
      <>
        <Provider theme={theme}>
          <DialogTrigger>
            <ActionButton aria-label="Trigger" />
            <Dialog>
              <Content>
                <div>Outer</div>
                <DialogTrigger>
                  <Button variant="primary" aria-label="Nested Trigger" />
                  <Dialog>Inner</Dialog>
                </DialogTrigger>
              </Content>
            </Dialog>
          </DialogTrigger>
        </Provider>
        <hr />
      </>
    );
    // expect just the button labeled Trigger, and open the first dialog
    expect(getByRole('separator')).toBeVisible();
    await user.click(getByLabelText('Trigger'));
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    });
    expect(getByText('Outer')).toBeVisible();
    expect(queryByRole('separator')).toBeNull();

    // the outer dialog is open now, expect to only have access to the button called Nested Trigger and click that
    let buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(getByLabelText('Nested Trigger'));
    await user.click(getByLabelText('Nested Trigger'));
    act(() => {
      jest.runAllTimers();
    });
    // should only have access to the inner most dialog
    let innerDialog = getByRole('dialog');
    await waitFor(() => {
      expect(innerDialog).toBeVisible();
    });
    expect(getByText('Inner')).toBeVisible();
    expect(queryByRole('button')).toBeNull();
    expect(queryByRole('separator')).toBeNull();

    // start closing dialogs
    await user.keyboard('{Escape}');

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(innerDialog).not.toBeInTheDocument();
    }); // wait for animation
    // run getbyrole again to make sure the outer dialog button is unhidden
    buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(getByLabelText('Nested Trigger'));
    expect(getByText('Outer')).toBeVisible();
    expect(queryByRole('separator')).toBeNull();

    // close the outer dialog
    await user.keyboard('{Escape}');
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(innerDialog).not.toBeInTheDocument();
    }); // wait for animation
    buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(getByLabelText('Trigger'));
    expect(getByRole('separator')).toBeVisible();
  });

  it('should hide around Menus', async () => {
    let withSection = [
      {name: 'Heading 1', children: [
        {name: 'Foo'},
        {name: 'Bar'},
        {name: 'Baz'}
      ]}
    ];
    watchModals();
    let {getByLabelText, getByRole, queryByRole} = render(
      <>
        <Provider theme={theme}>
          <MenuTrigger>
            <ActionButton aria-label="Trigger" />
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(getByRole('separator')).toBeVisible();
    await user.click(getByLabelText('Trigger'));

    act(() => {
      jest.runAllTimers();
    });
    let menu = getByRole('menu');
    await verify(menu, queryByRole);
  });

  it('should hide around Tray', async () => {
    let withSection = [
      {name: 'Heading 1', children: [
        {name: 'Foo'},
        {name: 'Bar'},
        {name: 'Baz'}
      ]}
    ];
    // menu should be a tray
    simulateMobile();
    watchModals();
    let {getByLabelText, getByRole, queryByRole} = render(
      <>
        <Provider theme={theme}>
          <MenuTrigger>
            <ActionButton aria-label="Trigger" />
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(getByRole('separator')).toBeVisible();
    await user.click(getByLabelText('Trigger'));
    act(() => {
      jest.runAllTimers();
    });
    let menu = getByRole('menu');
    await verify(menu, queryByRole);
  });

  it('should hide around Popover', async () => {
    watchModals();
    let {getByLabelText, getByRole, queryByRole} = render(
      <>
        <Provider theme={theme}>
          <DialogTrigger type="popover">
            <ActionButton aria-label="Trigger" />
            <Dialog>contents</Dialog>
          </DialogTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(getByRole('separator')).toBeVisible();
    await user.click(getByLabelText('Trigger'));
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    await verify(dialog, queryByRole);
  });
});
