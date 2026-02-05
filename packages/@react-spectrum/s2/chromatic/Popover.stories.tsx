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

import {AccountMenu, AutocompletePopover, CustomTrigger, HelpCenter, MenuTrigger} from '../stories/Popover.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {Popover} from '../src';
import {userEvent} from '@storybook/test';

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true},
    chromatic: {ignoreSelectors: ['[role="progressbar"]']}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Popover'
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  ...HelpCenter,
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
  }
};

export const AccountMenuExample: Story = {
  ...AccountMenu,
  name: 'Account Menu',
  play: Default.play
};

export const Autocomplete: Story = {
  ...AutocompletePopover,
  name: 'Autocomplete Popover',
  play: Default.play
};

export const Custom: Story = {
  ...CustomTrigger,
  name: 'Custom Trigger',
  play: Default.play
};

export const MenuTriggerExample: Story = {
  ...MenuTrigger,
  name: 'MenuTrigger',
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
  }
};
