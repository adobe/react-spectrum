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

import {AlertDialog} from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {testSlotsAPI, triggerPress} from '@react-spectrum/test-utils';


describe('AlertDialog', function () {
  afterEach(cleanup);

  it('uses slots api', () => {
    testSlotsAPI(AlertDialog, {targetChild: 1});
  });

  it('renders alert dialog with onConfirm', function () {
    let onConfirmSpy = jest.fn();
    let {getByRole} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" onConfirm={onConfirmSpy}>
        Content body
      </AlertDialog>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let button = getByRole('button');
    triggerPress(button);
    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenCalledWith('primary');
  });

  it('renders 2 button alert dialog with onConfirm / onCancel', function () {
    let onCancelSpy = jest.fn();
    let onConfirmSpy = jest.fn();
    let {getByRole, getByText} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" cancelLabel="cancel" onConfirm={onConfirmSpy} onCancel={onCancelSpy}>
        Content body
      </AlertDialog>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let cancelButton = getByText('cancel');
    triggerPress(cancelButton);
    expect(onConfirmSpy).toHaveBeenCalledTimes(0);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith();

    let confirmButton = getByText('confirm');
    triggerPress(confirmButton);
    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenCalledWith('primary');
  });

  it('renders a 3 button alert dialog with onConfirm / onCancel', function () {
    let onCancelSpy = jest.fn();
    let onConfirmSpy = jest.fn();
    let {getByRole, getByText} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" cancelLabel="cancel" secondaryLabel="secondary" onConfirm={onConfirmSpy} onCancel={onCancelSpy}>
        Content body
      </AlertDialog>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let confirmButton = getByText('confirm');
    let secondaryButton = getByText('secondary');
    let cancelButton = getByText('cancel');
    triggerPress(secondaryButton);
    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenLastCalledWith('secondary');
    expect(onCancelSpy).toHaveBeenCalledTimes(0);

    triggerPress(confirmButton);
    expect(onConfirmSpy).toHaveBeenCalledTimes(2);
    expect(onConfirmSpy).toHaveBeenLastCalledWith('primary');
    expect(onCancelSpy).toHaveBeenCalledTimes(0);

    triggerPress(cancelButton);
    expect(onConfirmSpy).toHaveBeenCalledTimes(2);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenLastCalledWith();
  });

  it('disable its confirm button', function () {
    let onConfirmSpy = jest.fn();
    let {getByRole, getByText} = render(
      <AlertDialog variant="confirmation" isConfirmDisabled title="the title" primaryLabel="confirm" onConfirm={onConfirmSpy}>
        Content body
      </AlertDialog>
    );

    let dialog = getByRole('alertdialog');
    expect(document.activeElement).toBe(dialog);

    let button = getByText('confirm');
    triggerPress(button);
    expect(onConfirmSpy).toHaveBeenCalledTimes(0);
  });

  it('autofocus its confirm button', function () {
    let {getByText} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" autoFocusButton="primary">
        Content body
      </AlertDialog>
    );

    let button = getByText('confirm').closest('button');
    expect(document.activeElement).toBe(button);
  });

  it('autofocus its cancel button', function () {
    let {getByText} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" cancelLabel="cancel" autoFocusButton="cancel" >
        Content body
      </AlertDialog>
    );

    let button = getByText('cancel').closest('button');
    expect(document.activeElement).toBe(button);
  });

  it('autofocus its secondary button', function () {
    let {getByText} = render(
      <AlertDialog variant="confirmation" title="the title" primaryLabel="confirm" secondaryLabel="secondary" autoFocusButton="secondary">
        Content body
      </AlertDialog>
    );

    let button = getByText('secondary').closest('button');
    expect(document.activeElement).toBe(button);
  });
});
