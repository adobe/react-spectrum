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

import {act, pointerMap, render, simulateDesktop} from '@react-spectrum/test-utils-internal';
import {ActionButton} from '../../src/button/ActionButton';
import {AlertDialog} from '../../src/dialog/AlertDialog';
import {DialogTrigger} from '../../src/dialog/DialogTrigger';
import {Provider} from '../../src/provider/Provider';
import React from 'react';
import {defaultTheme as theme} from '../../src/theme-default/defaultTheme';
import userEvent from '@testing-library/user-event';

describe('AlertDialog', function () {
  it('renders alert dialog with onPrimaryAction', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPrimaryAction = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          onPrimaryAction={onPrimaryAction}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let button = getByRole('button');
    await user.click(button);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onPrimaryAction).toHaveBeenCalledWith();
  });

  it('renders 2 button alert dialog with onPrimaryAction / onCancel', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onCancelSpy = jest.fn();
    let onPrimaryAction = jest.fn();
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          cancelLabel="cancel"
          onPrimaryAction={onPrimaryAction}
          onCancel={onCancelSpy}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let cancelButton = getByText('cancel');
    await user.click(cancelButton);
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith();

    let confirmButton = getByText('confirm');
    await user.click(confirmButton);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onPrimaryAction).toHaveBeenCalledWith();
  });

  it('renders a 3 button alert dialog with onPrimaryAction / onCancel', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onCancelSpy = jest.fn();
    let onPrimaryAction = jest.fn();
    let onSecondaryAction = jest.fn();
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          cancelLabel="cancel"
          secondaryActionLabel="secondary"
          onPrimaryAction={onPrimaryAction}
          onSecondaryAction={onSecondaryAction}
          onCancel={onCancelSpy}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let confirmButton = getByText('confirm');
    let secondaryButton = getByText('secondary');
    let cancelButton = getByText('cancel');
    await user.click(secondaryButton);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenLastCalledWith();
    expect(onCancelSpy).toHaveBeenCalledTimes(0);

    await user.click(confirmButton);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onPrimaryAction).toHaveBeenLastCalledWith();
    expect(onCancelSpy).toHaveBeenCalledTimes(0);

    await user.click(cancelButton);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenLastCalledWith();
  });

  it('disable its confirm button', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPrimaryAction = jest.fn();
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          isPrimaryActionDisabled
          title="the title"
          primaryActionLabel="confirm"
          onPrimaryAction={onPrimaryAction}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let button = getByText('confirm');
    await user.click(button);
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
  });

  it('autofocus its confirm button', function () {
    let {getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          autoFocusButton="primary">
          Content body
        </AlertDialog>
      </Provider>
    );

    let button = getByText('confirm').closest('button');
    expect(document.activeElement).toBe(button);
  });

  it('autofocus its cancel button', function () {
    let {getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          cancelLabel="cancel"
          autoFocusButton="cancel">
          Content body
        </AlertDialog>
      </Provider>
    );

    let button = getByText('cancel').closest('button');
    expect(document.activeElement).toBe(button);
  });

  it('disable its secondary button', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPrimaryAction = jest.fn();
    let {getByRole, getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          isSecondaryActionDisabled
          title="the title"
          primaryActionLabel="confirm"
          secondaryActionLabel="secondary"
          onPrimaryAction={onPrimaryAction}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let button = getByText('secondary');
    await user.click(button);
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
  });

  it('autofocus its secondary button', function () {
    let {getByText} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          secondaryActionLabel="secondary"
          autoFocusButton="secondary">
          Content body
        </AlertDialog>
      </Provider>
    );

    let button = getByText('secondary').closest('button');
    expect(document.activeElement).toBe(button);
  });

  it('can add test ids', function () {
    let {getByTestId} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          cancelLabel="cancel"
          primaryActionLabel="confirm"
          secondaryActionLabel="secondary"
          autoFocusButton="secondary"
          data-testid="alert-dialog">
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByTestId('alert-dialog');
    expect(dialog).toBeDefined();
    let cancelBtn = getByTestId('rsp-AlertDialog-cancelButton');
    expect(cancelBtn).toBeDefined();
    let secondaryBtn = getByTestId('rsp-AlertDialog-secondaryButton');
    expect(secondaryBtn).toBeDefined();
    let primaryBtn = getByTestId('rsp-AlertDialog-confirmButton');
    expect(primaryBtn).toBeDefined();
  });

  it('should have aria-describedby pointing to the content', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <AlertDialog variant="confirmation" title="the title" primaryActionLabel="confirm">
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-describedby');
    let contentId = dialog.getAttribute('aria-describedby');
    let content = document.getElementById(contentId);
    expect(content).not.toBeNull();
    expect(content.textContent).toBe('Content body');
  });

  it('accepts custom aria-describedby', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <AlertDialog
          aria-describedby="content-id"
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm">
          Content body
        </AlertDialog>
      </Provider>
    );

    expect(getByRole('alertdialog')).toHaveAttribute('aria-describedby', 'content-id');
  });

  it('fires onCancel when the Escape key is pressed', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onCancelSpy = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          cancelLabel="cancel"
          onCancel={onCancelSpy}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    await user.keyboard('{Escape}');
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith();
  });

  it('does not fire other handlers on Escape when onCancel is not provided', async function () {
    let user = userEvent.setup({delay: null, pointerMap});
    let onPrimaryAction = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <AlertDialog
          variant="confirmation"
          title="the title"
          primaryActionLabel="confirm"
          onPrimaryAction={onPrimaryAction}>
          Content body
        </AlertDialog>
      </Provider>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    await user.keyboard('{Escape}');
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);
  });

  describe('within a DialogTrigger', function () {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      simulateDesktop();
    });

    afterEach(() => {
      act(() => jest.runAllTimers());
    });

    afterAll(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    it('fires onCancel once and closes the dialog when the Escape key is pressed', async function () {
      let user = userEvent.setup({delay: null, pointerMap});
      let onCancelSpy = jest.fn();
      let {getByRole} = render(
        <Provider theme={theme}>
          <DialogTrigger>
            <ActionButton>Trigger</ActionButton>
            <AlertDialog
              variant="confirmation"
              title="the title"
              primaryActionLabel="confirm"
              cancelLabel="cancel"
              onCancel={onCancelSpy}>
              Content body
            </AlertDialog>
          </DialogTrigger>
        </Provider>
      );

      let button = getByRole('button');
      await user.click(button);
      act(() => {
        jest.runAllTimers();
      });

      let dialog = getByRole('alertdialog');

      await user.keyboard('{Escape}');
      act(() => {
        jest.runAllTimers();
      });
      expect(dialog).not.toBeInTheDocument();
      expect(onCancelSpy).toHaveBeenCalledTimes(1);
    });

    it('fires onCancel once when the cancel button is pressed', async function () {
      let user = userEvent.setup({delay: null, pointerMap});
      let onCancelSpy = jest.fn();
      let {getByRole, getByText} = render(
        <Provider theme={theme}>
          <DialogTrigger>
            <ActionButton>Trigger</ActionButton>
            <AlertDialog
              variant="confirmation"
              title="the title"
              primaryActionLabel="confirm"
              cancelLabel="cancel"
              onCancel={onCancelSpy}>
              Content body
            </AlertDialog>
          </DialogTrigger>
        </Provider>
      );

      let button = getByRole('button');
      await user.click(button);
      act(() => {
        jest.runAllTimers();
      });

      let dialog = getByRole('alertdialog');

      await user.click(getByText('cancel'));
      act(() => {
        jest.runAllTimers();
      });
      expect(dialog).not.toBeInTheDocument();
      expect(onCancelSpy).toHaveBeenCalledTimes(1);
    });
  });
});
