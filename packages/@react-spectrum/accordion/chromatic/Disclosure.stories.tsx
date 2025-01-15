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

import {Disclosure, DisclosurePanel, DisclosureTitle} from '../';
import {Meta} from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Disclosure',
  component: Disclosure,
  excludeStories: ['Template']
};

export default meta;

export const Template = (args) => (
  <Disclosure {...args}>
    <DisclosureTitle>
      Your files
    </DisclosureTitle>
    <DisclosurePanel>
      files
    </DisclosurePanel>
  </Disclosure>
);

export const Default = {
  render: Template
};

export const Disabled = {
  render: Template,
  args: {isDisabled: true}
};

export const Quiet = {
  render: Template,
  args: {isQuiet: true}
};
