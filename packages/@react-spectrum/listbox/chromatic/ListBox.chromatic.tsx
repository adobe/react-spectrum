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

import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, ListBox, Section} from '../';
import {Label} from '@react-spectrum/label';
import {Meta} from '@storybook/react';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {SpectrumListBoxProps} from '@react-types/listbox';
import {Text} from '@react-spectrum/text';

let iconMap = {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blower,
  Book,
  Copy,
  Cut,
  Paste
};

let hardModeProgrammatic = [
  {name: 'Section 1', children: [
    {name: 'Copy', icon: 'Copy'},
    {name: 'Cut', icon: 'Cut'},
    {name: 'Paste', icon: 'Paste'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Puppy', icon: 'AlignLeft'},
    {name: 'Doggo', icon: 'AlignCenter'},
    {name: 'Floof', icon: 'AlignRight'}
  ]}
];

let flatOptions = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'},
  {name: 'Danni'},
  {name: 'Devon'},
  {name: 'Ross'}
];

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross'}
  ]}
];

const meta: Meta<SpectrumListBoxProps<object>> = {
  title: 'ListBox',
  component: ListBox,
  parameters: {
    // noticed a small shifting before final layout, delaying so chromatic doesn't hit that
    chromatic: {delay: 600}
  },
  decorators: [Story => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">Choose an item</Label>
      <div style={{display: 'flex', minWidth: '200px', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray', maxHeight: 600}}>
        <Story />
      </div>
    </div>
  )]
};

export default meta;

const Template = (args: SpectrumListBoxProps<object>) => (
  <ListBox {...args} flexGrow={1} items={flatOptions}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </ListBox>
);

const TemplateWithSections = (args: SpectrumListBoxProps<object>) => (
  <ListBox {...args} flexGrow={1} items={withSection}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

const TemplateNoTitle = (args: SpectrumListBoxProps<object>) => (
  <ListBox {...args} flexGrow={1} items={withSection}>
    {item => (
      <Section key={item.name} items={item.children}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

let customOption = (item) => {
  let Icon = iconMap[item.icon];
  return (
    <Item textValue={item.name} key={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
    </Item>
  );
};

const TemplateComplex = (args: SpectrumListBoxProps<object>) => (
  <ListBox {...args} flexGrow={1} items={hardModeProgrammatic}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => customOption(item)}
      </Section>
    )}
  </ListBox>
);

export const Default = {
  render: Template,
  name: 'flat list with selection',
  args: {selectedKeys: ['Snake', 'Aardvark'], disabledKeys: ['Ross'], selectionMode: 'multiple'}
};

export const Sections = {
  render: TemplateWithSections,
  name: 'with sections',
  args: {selectedKeys: ['Snake', 'Aardvark'], disabledKeys: ['Ross'], selectionMode: 'multiple'}
};

export const SectionsNoTitle = {
  render: TemplateNoTitle,
  name: 'sections without titles',
  args: {selectedKeys: ['Snake', 'Aardvark'], disabledKeys: ['Ross'], selectionMode: 'multiple'}
};

export const ComplexItems = {
  render: TemplateComplex,
  name: 'complex items',
  args: {selectedKeys: ['Puppy', 'Cut'], disabledKeys: ['Paste'], selectionMode: 'multiple'}
};
