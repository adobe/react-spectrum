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

import {Story as _Story, Meta} from '@storybook/react';
import {Accordion, Item} from '../src';
import React from 'react';
import {SpectrumAccordionProps} from '@react-types/accordion';

type ItemType = {
  key: React.Key,
  title: string
};

/**
 * Helper type so `bind` returns the actual Story type.
 */
interface Story<T> extends _Story<T> {
  bind: (this: ThisParameterType<typeof Function.bind>, thisArg: Parameters<typeof Function.bind>[0], ...argArray: Parameters<typeof Function.bind>[1][]) => _Story<T>
}

export default {
  title: 'Accordion',
  component: Accordion
} as Meta<SpectrumAccordionProps<ItemType>>;

const AccordionRenderPropsTemplate: Story<SpectrumAccordionProps<ItemType>> = (args) => (
  <Accordion {...args}>
    {item => <Item key={item.key} title={item.title}>{item.key}</Item>}
  </Accordion>
);

export const Default = AccordionRenderPropsTemplate.bind({});
Default.storyName = 'default';
Default.args = {
  items: [
    {key: 'files', title: 'Your files'},
    {key: 'shared', title: 'Shared with you'},
    {key: 'last', title: 'Last item'}
  ]
};

const AccordionTemplate: Story<SpectrumAccordionProps<ItemType>> = (args) => (
  <Accordion {...args} >
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

export const DefaultExpandedKeys = AccordionTemplate.bind({});
DefaultExpandedKeys.storyName = 'defaultExpandedKeys: files';
DefaultExpandedKeys.args = {defaultExpandedKeys: ['files']};

export const DisabledKeys = AccordionTemplate.bind({});
DisabledKeys.storyName = 'disabledKeys: files, shared';
DisabledKeys.args = {disabledKeys: ['files', 'shared']};

export const DisabledDefaultExpandedKeys =  AccordionTemplate.bind({});
DisabledDefaultExpandedKeys.storyName = 'defaultExpandedKeys: files, disabledKeys: files, shared';
DisabledDefaultExpandedKeys.args = {
  defaultExpandedKeys: ['files'],
  disabledKeys: ['files', 'shared']
};
