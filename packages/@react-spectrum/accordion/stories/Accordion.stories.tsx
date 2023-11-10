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

import {Accordion, Item} from '../src';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Key} from '@react-types/shared';
import React, {useState} from 'react';
import {SpectrumAccordionProps} from '@react-types/accordion';

type ItemType = {
  key: Key,
  title: string
};

export default {
  title: 'Accordion',
  component: Accordion,
  argTypes: {}
} as ComponentMeta<typeof Accordion>;

export type AccordionStory = ComponentStoryObj<typeof Accordion>;

export const Default: AccordionStory = {
  args: {
    items: [
      {key: 'files', title: 'Your files'},
      {key: 'shared', title: 'Shared with you'},
      {key: 'last', title: 'Last item'}
    ]
  },
  render: (args) => (
    <Accordion {...args}>
      {(item) => <Item key={(item as ItemType).key} title={(item as ItemType).title}>{(item as ItemType).key}</Item>}
    </Accordion>
  )
};

export const DefaultExpandedKeys: AccordionStory = {
  args: {...Default.args, defaultExpandedKeys: ['files']},
  render: Default.render,
  name: 'defaultExpandedKeys: files'
};

export const DisabledKeys: AccordionStory = {
  args: {...Default.args, disabledKeys: ['files', 'shared']},
  render: Default.render,
  name: 'disabledKeys: files, shared'
};

export const DisabledDefaultExpandedKeys: AccordionStory = {
  args: {...Default.args, defaultExpandedKeys: ['files'], disabledKeys: ['files', 'shared']},
  render: Default.render,
  name: 'defaultExpandedKeys: files, disabledKeys: files, shared'
};

export const ControlledExpandedKeys: AccordionStory = {
  args: {...Default.args, defaultExpandedKeys: ['files']},
  render: (args) => <ControlledAccordion {...args} />,
  name: 'controlled ExpandedKeys'
};


function ControlledAccordion<T>(props: SpectrumAccordionProps<T>) {
  let [openKeys, setOpenKeys] = useState<Set<Key>>(new Set(['files']));
  return (
    <Accordion {...props} expandedKeys={openKeys} onExpandedChange={setOpenKeys} >
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
}
