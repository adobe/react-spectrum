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

import {fireEvent, render, waitFor} from '@react-spectrum/test-utils/src/testingLibrary';
import {Modal} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';

describe('Modal', function () {
  it('should render nothing if isOpen is not set', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should render when isOpen is true', async function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(document.body).toHaveStyle('overflow: hidden');
  });

  it('hides the modal when pressing the escape key', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t hide the modal when clicking outside by default', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it('hides the modal when clicking outside if isDismissible is true', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen onClose={onClose} isDismissable>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    await waitFor(() => {
      expect(getByRole('dialog')).toBeVisible();
    }); // wait for animation

    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
