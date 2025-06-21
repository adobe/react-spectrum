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

import {Link} from '../';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {SpectrumLinkProps} from '@react-types/link';

const meta: Meta<SpectrumLinkProps> = {
  title: 'Link',
  component: Link
} as Meta<SpectrumLinkProps>;

export default meta;

export type LinkStory = StoryObj<SpectrumLinkProps>;

export const Default: LinkStory = {
  render: (args) => <Link {...args}>This is a React Spectrum Link</Link>
};

export const Secondary: LinkStory = {
  render: (args) => <Link {...args}>This is a React Spectrum Link</Link>,
  args: {variant: 'secondary'}
};

export const Quiet: LinkStory = {
  render: (args) => <Link {...args}>This is a React Spectrum Link</Link>,
  args: {isQuiet: true}
};

export const QuietSecondary: LinkStory = {
  render: (args) => <Link {...args}>This is a React Spectrum Link</Link>,
  args: {...Secondary.args, ...Quiet.args}
};
