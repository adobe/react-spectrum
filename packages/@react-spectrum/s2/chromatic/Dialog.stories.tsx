/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Avatar} from '../src/Avatar';
import {Button} from '../src/Button';
import {ButtonGroup} from '../src/ButtonGroup';
import {ComboBox, ComboBoxItem} from '../src/ComboBox';
import {Content, Heading, Text} from '../src/Content';
import {Dialog} from '../src/Dialog';
import {
  DialogContainerExample,
  DialogTriggerExample,
  Example,
  ExampleStoryType
} from '../stories/Dialog.stories';
import {DialogTrigger} from '../src/DialogTrigger';
import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {Picker, PickerItem} from '../src/Picker';
import {userEvent, waitFor, within} from 'storybook/test';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    }
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Dialog'
};

export default meta;
type Story = StoryObj<ExampleStoryType>;

export const Default: Story = {
  ...Example,
  // TODO: maybe render dialogs with different args instead (showHero/showHeader, etc)
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
  }
};

export const WithDialogTrigger: Story = {
  ...DialogTriggerExample,
  play: async context => await Default.play!(context)
};

export const DialogContainer: Story = {
  ...DialogContainerExample,
  play: async context => await Default.play!(context)
};

export const ComboBoxAvatarInDialog: Story = {
  name: 'Combobox avatar in Dialog',
  render: () => (
    <DialogTrigger>
      <Button variant="primary">Open dialog</Button>
      <Dialog>
        <Heading slot="title">Share with people</Heading>
        <Content>
          <ComboBox label="Add people">
            <ComboBoxItem textValue="User One">
              <Avatar slot="avatar" src="https://i.imgur.com/xIe7Wlb.png" />
              <Text slot="label">User One</Text>
              <Text slot="description">user.one@example.com</Text>
            </ComboBoxItem>
          </ComboBox>
        </Content>
        <ButtonGroup>
          <Button variant="secondary">Cancel</Button>
          <Button variant="accent">Share</Button>
        </ButtonGroup>
      </Dialog>
    </DialogTrigger>
  ),
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await new Promise(resolve => setTimeout(resolve, 1000));
    let combobox = within(body).getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.keyboard('{ArrowDown}');
    let listbox = await within(body).findByRole('listbox');
    await waitFor(
      () => {
        expect(within(listbox).getByText('User One', {exact: false})).toBeInTheDocument();
      },
      {timeout: 5000}
    );
  }
};

export const PickerAvatarInDialog: Story = {
  name: 'Picker avatar in Dialog',
  render: () => (
    <DialogTrigger>
      <Button variant="primary">Open dialog</Button>
      <Dialog>
        <Heading slot="title">Share with people</Heading>
        <Content>
          <Picker label="Owner">
            <PickerItem textValue="User One">
              <Avatar slot="avatar" src="https://i.imgur.com/xIe7Wlb.png" />
              <Text>User One</Text>
            </PickerItem>
          </Picker>
        </Content>
        <ButtonGroup>
          <Button variant="secondary">Cancel</Button>
          <Button variant="accent">Share</Button>
        </ButtonGroup>
      </Dialog>
    </DialogTrigger>
  ),
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
    await new Promise(resolve => setTimeout(resolve, 1000));
    let picker = within(body).getByRole('button', {name: /Owner/i});
    await userEvent.click(picker);
    let listbox = await within(body).findByRole('listbox');
    await waitFor(
      () => {
        expect(within(listbox).getByText('User One', {exact: false})).toBeInTheDocument();
      },
      {timeout: 5000}
    );
  }
};
