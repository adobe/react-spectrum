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

import {AsyncPickerStory, ContextualHelpExample, CustomWidth, Dynamic, Example, Sections, WithIcons} from '../stories/Picker.stories';
import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {Picker} from '../src';
import {userEvent, waitFor, within} from '@storybook/testing-library';

const meta: Meta<typeof Picker<any>> = {
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true},
    chromatic: {ignoreSelectors: ['[role="progressbar"]']}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Picker'
};

export default meta;

export const Default = {
  ...Example,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('listbox');
  }
} as StoryObj;

export const WithSections = {
  ...Sections,
  play: async (context) => await Default.play!(context)
};

export const DynamicExample = {
  ...Dynamic,
  name: 'Dynamic',
  play: async (context) => await Default.play!(context)
} as StoryObj;

export const Icons = {
  ...WithIcons,
  name: 'With Icons',
  play: async (context) => await Default.play!(context)
} as StoryObj;

export const WithCustomWidth = {
  ...CustomWidth,
  play: async (context) => await Default.play!(context)
} as StoryObj;

export const ContextualHelp = {
  ...ContextualHelpExample,
  play: async ({canvasElement}) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    let body = canvasElement.ownerDocument.body;
    await within(body).findByRole('dialog');
  }
};

export const EmptyAndLoading = {
  render: () => (
    <Picker label="loading" loadingState="loading">
      {[]}
    </Picker>
  ),
  play: async ({canvasElement}) => {
    let body = canvasElement.ownerDocument.body;
    await waitFor(() => {
      expect(within(body).getByRole('progressbar', {hidden: true})).toBeInTheDocument();
    }, {timeout: 5000});
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(within(body).queryByRole('listbox')).toBeFalsy();
  }
};

export const AsyncResults = {
  ...AsyncPickerStory,
  args: {
    ...AsyncPickerStory.args,
    delay: 2000
  },
  play: async ({canvasElement}) => {
    let body = canvasElement.ownerDocument.body;
    await waitFor(() => {
      expect(within(body).getByRole('progressbar', {hidden: true})).toBeInTheDocument();
    }, {timeout: 5000});
    await userEvent.tab();

    await waitFor(() => {
      expect(within(body).queryByRole('progressbar', {hidden: true})).toBeFalsy();
    }, {timeout: 5000});

    await userEvent.keyboard('{ArrowDown}');
    let listbox = await within(body).findByRole('listbox');
    await waitFor(() => {
      expect(within(listbox).getByText('Luke', {exact: false})).toBeInTheDocument();
    }, {timeout: 5000});

    await waitFor(() => {
      expect(within(listbox).getByRole('progressbar', {hidden: true})).toBeInTheDocument();
    }, {timeout: 5000});

    await waitFor(() => {
      expect(within(listbox).queryByRole('progressbar', {hidden: true})).toBeFalsy();
    }, {timeout: 5000});

    await userEvent.keyboard('{PageDown}');

    await waitFor(() => {
      expect(within(listbox).getByText('Greedo', {exact: false})).toBeInTheDocument();
    }, {timeout: 5000});
  }
};
