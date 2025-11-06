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

import {AsyncComboBoxStory, AsyncComboBoxStoryType, ContextualHelpExample, CustomWidth, Dynamic, EmptyCombobox, Example, Sections, WithAvatars, WithIcons} from '../stories/ComboBox.stories';
import {ComboBox} from '../src';
import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, waitFor, within} from '@storybook/test';

const meta: Meta<typeof ComboBox<any>> = {
  component: ComboBox,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true},
    chromatic: {ignoreSelectors: ['[role="progressbar"]']}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/ComboBox'
};

export default meta;
type Story = StoryObj<typeof ComboBox<any>>;

export const Static: Story = {
  ...Example,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('listbox');
  }
} as StoryObj;

export const WithSections: Story = {
  ...Sections,
  name: 'Sections',
  play: Static.play
};

export const WithDynamic: Story = {
  ...Dynamic,
  name: 'Dynamic',
  args: {...Dynamic.args, selectedKey: 'chocolate'},
  play: Static.play
};

export const Icons: Story = {
  ...WithIcons,
  name: 'With Icons',
  play: Static.play
};

export const Avatars: Story = {
  ...WithAvatars,
  name: 'With Avatars',
  play: Static.play
};

export const ContextualHelp: Story = {
  ...ContextualHelpExample,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
  }
};

export const WithCustomWidth: Story = {
  ...CustomWidth,
  play: Static.play
};

export const WithEmptyState: Story = {
  ...EmptyCombobox,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let listbox = await within(body).findByRole('listbox');
    await within(listbox).findByText('No results');
  }
};

export const WithInitialLoading: Story = {
  ...EmptyCombobox,
  args: {
    loadingState: 'loading',
    label: 'Initial loading'
  },
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let listbox = await within(body).findByRole('listbox');
    await within(listbox).findByText('Loading', {exact: false});
  }
};

export const WithLoadMore: Story = {
  ...Example,
  args: {
    loadingState: 'loadingMore',
    label: 'Loading more'
  },
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let listbox = await within(body).findByRole('listbox');
    await within(listbox).findByRole('progressbar');
  }
};

export const AsyncResults: StoryObj<AsyncComboBoxStoryType> = {
  ...AsyncComboBoxStory,
  args: {
    ...AsyncComboBoxStory.args,
    delay: 2000
  },
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let listbox = await within(body).findByRole('listbox');
    await waitFor(() => {
      expect(within(listbox).getByText('Luke', {exact: false})).toBeInTheDocument();
    }, {timeout: 5000});
  }
};

export const Filtering: StoryObj<AsyncComboBoxStoryType> = {
  ...AsyncComboBoxStory,
  args: {
    ...AsyncComboBoxStory.args,
    delay: 2000
  },
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    let listbox = await within(body).findByRole('listbox');
    await waitFor(() => {
      expect(within(listbox).getByText('Luke', {exact: false})).toBeInTheDocument();
    }, {timeout: 5000});

    let combobox = await within(body).findByRole('combobox');
    await userEvent.type(combobox, 'R2');

    await waitFor(() => {
      expect(within(body).getByRole('progressbar', {hidden: true})).toBeInTheDocument();
    }, {timeout: 5000});

    await waitFor(() => {
      expect(within(listbox).queryByRole('progressbar', {hidden: true})).toBeFalsy();
    }, {timeout: 5000});
  }
};
