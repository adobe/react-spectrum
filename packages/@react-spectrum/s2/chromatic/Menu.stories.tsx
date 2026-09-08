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

import {
  BlendModes,
  DynamicExample,
  Example,
  KeyboardShortcuts,
  PublishAndExport,
  UnavailableMenuItem
} from '../stories/Menu.stories';
import {Button} from '../src/Button';
import {expect} from '@storybook/jest';
import {Menu, MenuItem, MenuTrigger} from '../src/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {userEvent, within} from 'storybook/test';

const meta: Meta<typeof Menu<any>> = {
  component: Menu,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      backgrounds: ['base'],
      locales: ['en-US'],
      disableAnimations: true
    },
    chromatic: {ignoreSelectors: ['[role="progressbar"]']}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Menu'
};

export default meta;
type Story = StoryObj<typeof Menu<any>>;

export const Default: Story = {
  ...Example,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('menu');
  }
};

export const WithKeyboardShortcuts: Story = {
  ...KeyboardShortcuts,
  play: async context => await Default.play!(context)
};

export const WithIcons: Story = {
  ...PublishAndExport,
  play: async context => await Default.play!(context)
};

export const WithImages: Story = {
  ...BlendModes,
  play: async context => await Default.play!(context)
};

export const Dynamic: Story = {
  ...DynamicExample,
  play: async context => await Default.play!(context)
};

export const WithUnavailableItem: Story = {
  ...UnavailableMenuItem,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('menu');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    let menus = await within(body).findAllByRole('dialog');
    expect(menus).toHaveLength(2);
  }
};

export const WithEmptyState: Story = {
  render: () => (
    <MenuTrigger>
      <Button aria-label="Actions">
        <NewIcon />
      </Button>
      <Menu aria-label="Test" items={[]}>
        {() => <MenuItem>Never rendered</MenuItem>}
      </Menu>
    </MenuTrigger>
  ),
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let menu = await within(body).findByRole('menu');
    await within(menu).findByText('No results');
  }
};

export const WithInitialLoading: Story = {
  render: () => (
    <MenuTrigger>
      <Button aria-label="Actions">
        <NewIcon />
      </Button>
      <Menu aria-label="Test" items={[]} loadingState="loading">
        {() => <MenuItem>Never rendered</MenuItem>}
      </Menu>
    </MenuTrigger>
  ),
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let menu = await within(body).findByRole('menu');
    await within(menu).findByRole('progressbar', {hidden: true});
  }
};

export const WithLoadMore: Story = {
  render: () => (
    <MenuTrigger>
      <Button aria-label="Actions">
        <NewIcon />
      </Button>
      <Menu aria-label="Test" loadingState="loadingMore">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let menu = await within(body).findByRole('menu');
    await within(menu).findByRole('progressbar', {hidden: true});
  }
};
