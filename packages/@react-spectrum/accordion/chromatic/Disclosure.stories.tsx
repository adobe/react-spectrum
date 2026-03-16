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

import {Disclosure, DisclosurePanel, DisclosureTitle, SpectrumDisclosureProps} from '../';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';

const meta: Meta = {
  title: 'Disclosure',
  component: Disclosure,
  excludeStories: ['Template']
};

export default meta;

export type DisclosureStory = StoryObj<SpectrumDisclosureProps>;

export const Template = (args: SpectrumDisclosureProps): JSX.Element => (
  <Disclosure {...args}>
    <DisclosureTitle>
      Your files
    </DisclosureTitle>
    <DisclosurePanel>
      files
    </DisclosurePanel>
  </Disclosure>
);

export const Default: DisclosureStory = {
  render: (args) => <Template {...args} />
};

export const Disabled: DisclosureStory = {
  render: (args) => <Template {...args} />,
  args: {isDisabled: true}
};

export const Quiet: DisclosureStory = {
  render: (args) => <Template {...args} />,
  args: {isQuiet: true}
};

export const WrappingTitle: DisclosureStory = {
  render: (args) => (
    <Disclosure maxWidth="size-3000" {...args}>
      <DisclosureTitle>
        Long long long long long long long long long long long long long  long long long wrapping title
      </DisclosureTitle>
      <DisclosurePanel>
        Files content
      </DisclosurePanel>
    </Disclosure>
  )
};
