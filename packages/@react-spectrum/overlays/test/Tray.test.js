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
import {Dialog} from '@react-spectrum/dialog';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {Tray} from '../';
import userEvent from '@testing-library/user-event';

describe('Tray', function () {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should render nothing if isOpen is not set', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should render when isOpen is true', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(document.body).toHaveStyle('overflow: hidden');
  });

  it('hides the tray when pressing the escape key', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    // wait for animation
    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    });
    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    act(() => {
      fireEvent.keyDown(dialog, {key: 'Escape'});
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the tray when clicking outside', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Tray>
      </Provider>
    );

    // wait for animation
    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    });
    act(() => {
      jest.runAllTimers();
    });

    act(() => {
      userEvent.click(document.body);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // TODO($9) useOverlay: useFocusWithin's onBlurWithin cb not called
  // Removing the FocusGroup wrapper in the Dialog works. Maybe this is already fixed by Rob with React 17?
  it.skip('hides the tray on blur when shouldCloseOnBlur is true', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Tray isOpen onClose={onClose} shouldCloseOnBlur>
          <Dialog>contents</Dialog>
        </Tray>
      </Provider>
    );

    // wait for animation
    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    });
    act(() => {
      jest.runAllTimers();
    });

    let dialog = getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    act(() => {
      dialog.blur();
    });
    act(() => {
      jest.runAllTimers();
    });
    // 2 due to the Safari iOS Voiceover workaround in useDialog, which blurs & refocuses
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
