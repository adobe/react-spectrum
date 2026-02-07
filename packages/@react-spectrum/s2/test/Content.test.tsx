/*
 * Copyright 2026 Adobe. All rights reserved.
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
import {ActionButton, ActionMenu, Button, ButtonGroup, Checkbox, Content, Dialog, DialogTrigger, Footer, Header, Heading, Keyboard, MenuItem, Text} from '../src';
import React from 'react';
import SaveFloppy from '../s2wf-icons/S2_Icon_SaveFloppy_20_N.svg';
import userEvent from '@testing-library/user-event';

const getStyleWarning = (componentName: string) => `${componentName} is being used outside of a component that provides automatic styling. ` +
  'Consider using a standard HTML element instead (e.g., <h1>, <div>, <p>, etc.), ' +
  'and use the \'styles\' prop from the style macro to provide custom styles: https://react-spectrum.adobe.com/styling';

describe('Content components', () => {
  let warn: jest.SpyInstance;
  let user;

  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn').mockImplementation();
  });

  afterEach(() => {
    warn.mockRestore();
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each`
    Name                    | Component
    ${'Heading'}             | ${Heading}
    ${'Header'}              | ${Header}
    ${'Content'}             | ${Content}
    ${'Text'}                | ${Text}
    ${'Keyboard'}            | ${Keyboard}
    ${'Footer'}              | ${Footer}
  `('should warn when $Name is used standalone', ({Name, Component}) => {
    render(<Component>Test {Name}</Component>);
    expect(warn).toHaveBeenCalledWith(getStyleWarning(Name));
  });

  it('should not warn when content components are used correctly', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <ActionButton>Open dialog</ActionButton>
        <Dialog>
          {({close}) => (
            <>
              <Heading slot="title">Dialog title</Heading>
              <Header>Header text</Header>
              <Content>
                <p>This is the main content of the dialog.</p>
                <ActionMenu>
                  <MenuItem
                    textValue="Copy"
                    onAction={() => alert('copy')}>
                    <Text slot="label">Copy</Text>
                    <Text slot="description">Copy the selected text</Text>
                    <Keyboard>⌘C</Keyboard>
                  </MenuItem>
                </ActionMenu>
              </Content>
              <Footer><Checkbox>Don't show this again</Checkbox></Footer>
              <ButtonGroup>
                <Button onPress={close} variant="secondary">Cancel</Button>
                <Button onPress={close} variant="accent">
                  <SaveFloppy />
                  <Text>Save</Text>
                </Button>
              </ButtonGroup>
            </>
          )}
        </Dialog>
      </DialogTrigger>
    );

    // Open the dialog to render all content components
    let trigger = getByRole('button');
    await user.click(trigger);
    act(() => {jest.runAllTimers();});

    // Should not show warnings
    expect(warn).not.toHaveBeenCalled();
  });
});
