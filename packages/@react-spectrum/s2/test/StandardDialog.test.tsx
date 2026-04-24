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
import {Content, Footer, Header, Heading} from '../src/Content';
import {DialogTrigger} from '../src/DialogTrigger';
import React from 'react';
import {Dialog} from '../src/Dialog';
import userEvent from '@testing-library/user-event';
import { Button } from '../src/Button';
import { ButtonGroup } from '../src/ButtonGroup';
import { Checkbox } from '../src/Checkbox';

describe('StandardDialog', () => {
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

  it('does not automatically add aria-describedby', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <Dialog>
          {({close}) => (
            <>
              <Heading slot="title">Dialog title</Heading>
              <Header>Header</Header>
              <Content>
                This is the content of the dialog.
              </Content>
              <Footer><Checkbox>Don't show this again</Checkbox></Footer>
              <ButtonGroup>
                <Button onPress={close} variant="secondary">Cancel</Button>
                <Button onPress={close} variant="accent">Save</Button>
              </ButtonGroup>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    );

    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});
    let dialog = getByRole('dialog');  
    expect(dialog).toBeVisible();
    let description = dialog.getAttribute('aria-describedby');
    expect(description).toBeNull();
  });

  it('accepts custom aria-describedby', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <Dialog aria-describedby="content-id">
          {({close}) => (
            <>
              <Heading slot="title">Dialog title</Heading>
              <Header>Header</Header>
              <Content>
                <p id="content-id">This is the content of the dialog.</p>
                <p>Extra content</p>
              </Content>
              <Footer><Checkbox>Don't show this again</Checkbox></Footer>
              <ButtonGroup>
                <Button onPress={close} variant="secondary">Cancel</Button>
                <Button onPress={close} variant="accent">Save</Button>
              </ButtonGroup>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    );

    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});
    let dialog = getByRole('dialog');  
    expect(dialog).toBeVisible();
    let description = dialog.getAttribute('aria-describedby');
    expect(description).toBeDefined();
    let content = document.getElementById(description!);
    expect(content).toHaveTextContent('This is the content of the dialog.');
  });
});
