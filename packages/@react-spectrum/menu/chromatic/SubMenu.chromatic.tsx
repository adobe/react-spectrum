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

import {ActionButton} from '@react-spectrum/button';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';
import {ComponentStoryObj, Meta} from '@storybook/react';
import {Item, Menu, MenuTrigger, Section, SubMenuTrigger} from '../';
import {Keyboard, Text} from '@react-spectrum/text';
import React from 'react';
import {SpectrumMenuTriggerProps} from '@react-types/menu';
import TextIndentIncrease from '@spectrum-icons/workflow/TextIndentIncrease';
import TextItalics from '@spectrum-icons/workflow/TextItalic';
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<SpectrumMenuTriggerProps> = {
  title: 'SubMenuTrigger',
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true, express: false},
    // chromatic needs a bit more time than disableAnimations allows
    chromatic: {pauseAnimationAtEnd: true}
  },
  decorators: [Story => <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}><Story /></div>]
};

export default meta;

let complex = [
  {name: 'Font', icon: 'AnnotatePen', children: [
    {textValue: 'Font styles', isSection: true, children: [
      {name: 'Show Fonts', shortcut: '⌘T'},
      {name: 'Bold', shortcut: '⌘B'},
      {name: 'Italics', shortcut: '⌘I'},
      {name: 'Underline', shortcut: '⌘U'},
      {name: 'Strikethrough'}
    ]},
    {textValue: 'Font size', isSection: true, children: [
      {name: 'Bigger', shortcut: '⌘+'},
      {name: 'Smaller', shortcut: '⌘-'}
    ]},
    {textValue: 'Baseline section', isSection: true, children: [
      {name: 'Baseline', children: [
        {name: 'Use default'},
        {name: 'Superscript'},
        {name: 'Subscript'}
      ]}
    ]}
  ]},
  {name: 'Text', icon: 'TextItalics', children: [
    {name: 'Align Left', icon: 'AlignLeft', shortcut: '⌘{'},
    {name: 'Center', icon: 'AlignCenter', shortcut: '⌘|'},
    {name: 'Justify'},
    {name: 'Align Right', icon: 'AlignRight', shortcut: '⌘}'}
  ]},
  {name: 'Indentation', icon: 'TextIndentIncrease', children: [
    {name: 'Increase', shortcut: '⌘]'},
    {name: 'Decrease', shortcut: '⌘['}
  ]}
];

interface ItemNode {
  name?: string,
  icon?: string,
  shortcut?: string,
  textValue?: string,
  isSection?: boolean,
  children?: ItemNode[]
}

let iconMap = {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AnnotatePen,
  TextIndentIncrease,
  TextItalics
};

let dynamicRenderTrigger = (item: ItemNode, Icon) => (
  <SubMenuTrigger>
    <Item key={item.name} textValue={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
    </Item>
    <Menu items={item.children}>
      {(item) => dynamicRenderFuncSections(item)}
    </Menu>
  </SubMenuTrigger>
);

let dynamicRenderItem = (item, Icon) => (
  <Item key={item.name} textValue={item.name}>
    {item.icon && <Icon size="S" />}
    <Text>{item.name}</Text>
    {item.shortcut && <Keyboard>{item.shortcut}</Keyboard>}
  </Item>
);

let dynamicRenderFuncSections = (item: ItemNode) => {
  let Icon = iconMap[item.icon];
  if (item.children) {
    if (item.isSection) {
      let key = item.name ?? item.textValue;
      return (
        <Section key={key} title={item?.name} aria-label={item?.textValue} items={item.children}>
          {(item) => {
            if (item.children) {
              return dynamicRenderTrigger(item, Icon);
            } else {
              return dynamicRenderItem(item, Icon);
            }
          }}
        </Section>
      );
    } else {
      return dynamicRenderTrigger(item, Icon);
    }
  } else {
    return dynamicRenderItem(item, Icon);
  }
};

export type DefaultStory = ComponentStoryObj<typeof DefaultSubMenu>;

export const Default: DefaultStory = {
  render: () => <DefaultSubMenu />,
  name: 'sub menu expanded'
};

Default.play = async ({canvasElement}) => {
  let body = canvasElement.ownerDocument.body;
  let menu = await within(body).getByRole('menu');
  let menuItems = within(menu).getAllByRole('menuitem');
  await userEvent.hover(menuItems[0]);
  let subMenuTrigger = await within(body).findByText('Baseline');
  await userEvent.hover(subMenuTrigger);
};

function DefaultSubMenu(props) {
  return (
    <MenuTrigger {...props} isOpen>
      <ActionButton>
        Menu Button
      </ActionButton>
      <Menu items={complex}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    </MenuTrigger>
  );
}
