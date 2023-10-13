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

import {Accordion, Item} from '../';
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumAccordionProps} from '@react-types/accordion';

const meta: Meta<SpectrumAccordionProps<object>> = {
  title: 'Accordion',
  component: Accordion
};

export default meta;

const Template = (args) => (
  <Accordion {...args}>
    <Item key="files" title="Your files">
      files
    </Item>
    <Item key="shared" title="Shared with you">
      shared
    </Item>
    <Item key="last" title="Last item">
      last
    </Item>
  </Accordion>
);

export const Default = {
  render: Template
};

export const ExpandedKeys = {
  render: Template,
  args: {defaultExpandedKeys: ['shared']}
};

export const DisabledKeys = {
  render: Template,
  args: {disabledKeys: ['shared']}
};
