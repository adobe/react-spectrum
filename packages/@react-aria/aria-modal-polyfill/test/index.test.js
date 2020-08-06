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

import {act, fireEvent, render, waitFor} from '@testing-library/react';
import {ActionButton, Button} from '@react-spectrum/button';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Item, Menu, MenuTrigger, Section} from '@react-spectrum/menu';
import MatchMediaMock from 'jest-matchmedia-mock';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import {watchModals} from '../';

describe('watchModals', () => {
  let matchMedia;
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    matchMedia = new MatchMediaMock();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
  });

  afterEach(() => {
    jest.runAllTimers();
    matchMedia.clear();
    window.requestAnimationFrame.mockRestore();
  });

  let verify = async function (modal, getByRole) {
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
    expect(() => getByRole('separator')).toThrow();

    expect(document.activeElement).toBe(modal);

    fireEvent.keyDown(modal, {key: 'Escape'});
    fireEvent.keyUp(modal, {key: 'Escape'});

    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    }); // wait for animation

    // once the modal is removed, we should be able to access the main part of the document again
    expect(() => getByRole('separator')).not.toThrow();
  };

  it('should hide everything except the modal', async () => {
    watchModals();
    let {getByLabelText, getByRole} = render(
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
    expect(() => getByRole('separator')).not.toThrow();
    act(() => {
      triggerPress(getByLabelText('Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    verify(dialog, getByRole);
  });

  it('should handle nested modals', async () => {
    watchModals();
    let {getByLabelText, getByRole, getAllByRole, getByText} = render(
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
    expect(() => getByRole('separator')).not.toThrow();
    act(() => {
      triggerPress(getByLabelText('Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    await waitFor(() => {
      expect(dialog).toBeVisible();
    });
    expect(getByText('Outer')).toBeVisible();
    expect(() => getByRole('separator')).toThrow();

    // the outer dialog is open now, expect to only have access to the button called Nested Trigger and click that
    let buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(getByLabelText('Nested Trigger'));
    act(() => {
      triggerPress(getByLabelText('Nested Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    // should only have access to the inner most dialog
    let innerDialog = getByRole('dialog');
    await waitFor(() => {
      expect(innerDialog).toBeVisible();
    });
    expect(getByText('Inner')).toBeVisible();
    expect(() => getByRole('button')).toThrow();
    expect(() => getByRole('separator')).toThrow();

    // start closing dialogs
    fireEvent.keyDown(innerDialog, {key: 'Escape'});
    fireEvent.keyUp(innerDialog, {key: 'Escape'});
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
    expect(() => getByRole('separator')).toThrow();

    // close the outer dialog
    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent.keyUp(dialog, {key: 'Escape'});
    act(() => {
      jest.runAllTimers();
    });
    await waitFor(() => {
      expect(innerDialog).not.toBeInTheDocument();
    }); // wait for animation
    buttons = getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(getByLabelText('Trigger'));
    expect(() => getByRole('separator')).not.toThrow();
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
    let {getByLabelText, getByRole} = render(
      <>
        <Provider theme={theme}>
          <MenuTrigger>
            <ActionButton aria-label="Trigger" />
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(() => getByRole('separator')).not.toThrow();
    act(() => {
      triggerPress(getByLabelText('Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    let menu = getByRole('menu');
    verify(menu, getByRole);
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
    matchMedia.useMediaQuery('(max-width: 700px)');
    watchModals();
    let {getByLabelText, getByRole} = render(
      <>
        <Provider theme={theme}>
          <MenuTrigger>
            <ActionButton aria-label="Trigger" />
            <Menu items={withSection}>
              {item => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {item => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
                </Section>
              )}
            </Menu>
          </MenuTrigger>
        </Provider>
        <hr />
      </>
    );
    expect(() => getByRole('separator')).not.toThrow();
    act(() => {
      triggerPress(getByLabelText('Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    let menu = getByRole('menu');
    verify(menu, getByRole);
  });

  it('should hide around Popover', async () => {
    watchModals();
    let {getByLabelText, getByRole} = render(
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
    expect(() => getByRole('separator')).not.toThrow();
    act(() => {
      triggerPress(getByLabelText('Trigger'));
    });
    act(() => {
      jest.runAllTimers();
    });
    let dialog = getByRole('dialog');
    verify(dialog, getByRole);
  });
});
