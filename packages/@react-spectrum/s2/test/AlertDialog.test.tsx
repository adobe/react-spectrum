/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ActionButton} from '../src/ActionButton';
import {AlertDialog} from '../src/AlertDialog';
import {Content} from '../src/Content';
import {DialogTrigger} from '../src/DialogTrigger';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('AlertDialog', () => {
  let user;
  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('automatically links to the content with aria-describedby', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <AlertDialog title="Test" primaryActionLabel="Test">
          Test content
        </AlertDialog>
      </DialogTrigger>
    );

    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});
    let dialog = getByRole('alertdialog');  
    expect(dialog).toBeVisible();
    let description = dialog.getAttribute('aria-describedby');
    expect(description).toBeDefined();
    let content = document.getElementById(description!);
    expect(content).toHaveTextContent('Test content');
  });

  it('accepts custom aria-describedby', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <AlertDialog aria-describedby="content-id" title="Test" primaryActionLabel="Test">
          <Content><p id="content-id">Test content</p><p>Extra content</p></Content>
        </AlertDialog>
      </DialogTrigger>
    );

    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});
    let dialog = getByRole('alertdialog');  
    expect(dialog).toBeVisible();
    let description = dialog.getAttribute('aria-describedby');
    expect(description).toBeDefined();
    let content = document.getElementById(description!);
    expect(content).toHaveTextContent('Test content');
  });
});
