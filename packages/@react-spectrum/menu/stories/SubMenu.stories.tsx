/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';
import defaultConfig, {render as renderMenuTrigger} from './MenuTrigger.stories';
import {Item, Menu, Section, SubMenuTrigger} from '../';
import {Keyboard, Text} from '@react-spectrum/text';
import React from 'react';
import TextIndentIncrease from '@spectrum-icons/workflow/TextIndentIncrease';
import TextItalics from '@spectrum-icons/workflow/TextItalic';

export default {
  ...defaultConfig,
  title: 'MenuTrigger/SubMenu'
};

// TODO: add chromatic stories
// TODO: test without any keys defined
export const SubMenuStatic = {
  render: (args) => (
    renderMenuTrigger(
      <Menu onAction={action('lvl 1 menu onAction')} {...args}>
        <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
        <SubMenuTrigger>
          <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
          <Menu onAction={action('lvl 2 menu onAction')} {...args.subMenu1Props}>
            <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
            <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
            <SubMenuTrigger>
              <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
              <Menu onAction={action('lvl 3 menu onAction')} {...args.subMenu2Props}>
                <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
                <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
                <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
              </Menu>
            </SubMenuTrigger>
          </Menu>
        </SubMenuTrigger>
        <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
      </Menu>
    , args.menuTriggerProps)
  ),
  name: 'static submenu items'
};

let dynamicSubMenu = [
  {name: 'Lvl 1 Item 1'},
  {name: 'Lvl 1 Item 2', children: [
    {name: 'Lvl 2 Item 1'},
    {name: 'Lvl 2 Item 2'},
    {name: 'Lvl 2 Item 3', children: [
      {name: 'Lvl 3 Item 1'},
      {name: 'Lvl 3 Item 2'},
      {name: 'Lvl 3 Item 3'}
    ]}
  ]},
  {name: 'Lvl 1 Item 3'}
];

// TODO: is this really the only way to define the dynamic render func? Kinda annoying that we have
// to define this func separately and recursively call it, but I don't think we can do the same approach as
// collapsible rows tableview since Menu isn't a collection component nor are we making the parent Menu tree collection
// track the full "tree" of menu items (we aren't making Item take other items/sections as children and are relying on each submenu having its own
// tree state + collection tracking its own level of items).
let dynamicRenderFunc = (item) => {
  if (item.children) {
    return (
      <SubMenuTrigger>
        <Item key={item.name}>{item.name}</Item>
        <Menu items={item.children} onAction={action(`${item.name} onAction`)}>
          {(item) => dynamicRenderFunc(item)}
        </Menu>
      </SubMenuTrigger>
    );
  } else {
    return <Item key={item.name}>{item.name}</Item>;
  }
};

export const SubMenuDynamic = {
  render: (args) => (
    renderMenuTrigger(
      <Menu items={dynamicSubMenu} onAction={action('onAction')} {...args}>
        {(item) => dynamicRenderFunc(item)}
      </Menu>
    )
  ),
  name: 'dynamic submenu items'
};

// TODO: TreeState might be too much/not a good fit since expandedKeys should only support one (can't have multiple sub menus at a time), something to keep in mind

export const SubMenuStaticSections = {
  render: () => (
    renderMenuTrigger(
      <Menu onAction={action('onAction')}>
        <Section title="Section 1">
          <Item key="Sec 1 Lvl 1 Item 1">Sec 1 Lvl 1 Item 1</Item>
          <SubMenuTrigger>
            <Item key="Sec 1 Lvl 1 Item 2">Sec 1 Lvl 1 Item 2</Item>
            <Menu onAction={action('Sec 1 Lvl 2 menu onAction')}>
              <Section title="Sub Section 1">
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 1">Sec 1 SubSec 1 Lvl 2 Item 1</Item>
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 2">Sec 1 SubSec 1 Lvl 2 Item 2</Item>
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 3">Sec 1 SubSec 1 Lvl 2 Item 3</Item>
              </Section>
            </Menu>
          </SubMenuTrigger>
          <Item key="Sec 1 Lvl 1 Item 3">Sec 1 Lvl 1 Item 3</Item>
        </Section>
        <Section title="Section 2">
          <Item key="Sec 2 Lvl 1 Item 1">Sec 2 Lvl 1 Item 1</Item>
          <SubMenuTrigger>
            <Item key="Sec 2 Lvl 1 Item 2">Sec 2 Lvl 1 Item 2</Item>
            <Menu onAction={action('Sec 2 Lvl 2 menu onAction')}>
              <Section title="Sub Section 1">
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 1">Sec 2 SubSec 1 Lvl 2 Item 1</Item>
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 2">Sec 2 SubSec 1 Lvl 2 Item 2</Item>
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 3">Sec 2 SubSec 1 Lvl 2 Item 3</Item>
              </Section>
            </Menu>
          </SubMenuTrigger>
          <Item key="Sec 2 Lvl 1 Item 3">Sec 2 Lvl 1 Item 3</Item>
        </Section>
      </Menu>
    )
  ),
  name: 'static submenu items with sections'
};

let dynamicSubMenuSections = [
  {name: 'Section 1', isSection: true,  children: [
    {name: 'Sec 1 Lvl 1 Item 1'},
    {name: 'Sec 1 Lvl 1 Item 2', children: [
      {name: 'Sub Section 1', isSection: true, children: [
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 1'},
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 2'},
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 3', children: [
          {name: 'Sub Section 1.1', isSection: true,  children: [
            {name: 'Sec 1 SubSec 1.1 Lvl 3 Item 1'},
            {name: 'Sec 1 SubSec 1.1 Lvl 3 Item 2'},
            {name: 'Sec 1 SubSec 1.1 Lvl 3 Item 3'}
          ]}
        ]}
      ]}
    ]},
    {name: 'Sec 1 Lvl 1 Item 3'}
  ]},
  {name: 'Section 2', isSection: true, children: [
    {name: 'Sec 2 Lvl 1 Item 1'},
    {name: 'Sec 2 Lvl 1 Item 2', children: [
      {name: 'Sub Section 1', isSection: true, children: [
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 1'},
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 2'},
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 3'}
      ]}
    ]},
    {name: 'Sec 2 Lvl 1 Item 3'}
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
    <Menu items={item.children} onAction={action(`${item.name} onAction`)}>
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

export const SubMenuDynamicSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={dynamicSubMenuSections} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic submenu items with sections'
};

let subMenuNoSection = [
  {name: 'Section 1', isSection: true, children: [
    {name: 'Sec 1 Lvl 1 Item 1'},
    {name: 'Sec 1 Lvl 1 Item 2', children: [
      {name: 'Sec 1 Lvl 2 Item 1'},
      {name: 'Sec 1 Lvl 2 Item 2'},
      {name: 'Sec 1 Lvl 2 Item 3', children: [
        {name: 'Sec 1 Lvl 3 Item 1'},
        {name: 'Sec 1 Lvl 3 Item 2'},
        {name: 'Sec 1 Lvl 3 Item 3'}
      ]}
    ]},
    {name: 'Sec 1 Lvl 1 Item 3'}
  ]}
];

export const MainSectionsSubNoSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={subMenuNoSection} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic, main menu w/ sections, sub menu no sections'
};

let subMenuSections = [
  {name: 'Lvl 1 Item 1'},
  {name: 'Lvl 1 Item 2', children: [
    {name: 'Section 1', isSection: true, children: [
      {name: 'Sec 1 Lvl 2 Item 1'},
      {name: 'Sec 1 Lvl 2 Item 2'},
      {name: 'Sec 1 Lvl 2 Item 3', children: [
        {name: 'Section 1.1', isSection: true, children: [
          {name: 'Sec 1.1 Lvl 3 Item 1'},
          {name: 'Sec 1.1 Lvl 3 Item 2'},
          {name: 'Sec 1.1 Lvl 3 Item 3'}
        ]}
      ]}
    ]}
  ]},
  {name: 'Lvl 1 Item 3'}
];

export const MainNoSectionsSubSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={subMenuSections} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic, main menu no sections, sub menu w/ sections'
};

let mixedSectionsAndNonSections = [
  {name: 'Lvl 1 Item 1'},
  {name: 'Lvl 1 Item 2', children: [
    {name: 'Section 1', isSection: true, children: [
      {name: 'Sec 1 Lvl 2 Item 1'},
      {name: 'Sec 1 Lvl 2 Item 2'},
      {name: 'Sec 1 Lvl 2 Item 3', children: [
        {name: 'Sec 1 Lvl 3 Item 1', children: [
          {name: 'Section 1.1', isSection: true, children: [
            {name: 'Sec 1.1 Lvl 4 Item 1'},
            {name: 'Sec 1.1 Lvl 4 Item 2'},
            {name: 'Sec 1.1 Lvl 4 Item 3'}
          ]}
        ]},
        {name: 'Sec 1 Lvl 3 Item 2'},
        {name: 'Sec 1 Lvl 3 Item 3'}
      ]}
    ]}
  ]},
  {name: 'Lvl 1 Item 3'}
];

export const MixedSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={mixedSectionsAndNonSections} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic, mix of menus w/ sections and w/o sections'
};

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

export const Complex = {
  render: () => (
    renderMenuTrigger(
      <Menu items={complex} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'complex'
};

export const SubMenuActions = {
  render: (args) => renderMenuTrigger(
    <Menu onAction={action('onAction lvl 1 menu')} onClose={action('onClose lvl 1 menu')} {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubMenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onAction={action('onAction lvl 2 menu')} onClose={action('onClose menu 2')}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
          <SubMenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onAction={action('onAction lvl 3 menu')} onClose={action('onClose menu 3')}>
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubMenuTrigger>
        </Menu>
      </SubMenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'submenu onAction and onClose',
  parameters: {description: {data: 'Each menu has its own onAction and onClose that are triggered only if its direct menu option was acted upon.'}}
};

export const SubMenuSelection = {
  render: (args) => renderMenuTrigger(
    <Menu onSelectionChange={action('onSelectionChange lvl 1 menu')} selectionMode="multiple" defaultSelectedKeys="all" {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubMenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onSelectionChange={action('onSelectionChange lvl 2 menu')} selectionMode="single" defaultSelectedKeys={['Lvl 2 Item 3']}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 1 Item 2">Lvl 2 Item 2</Item>
          <SubMenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onSelectionChange={action('onSelectionChange lvl 3 menu')} selectionMode="multiple">
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubMenuTrigger>
        </Menu>
      </SubMenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'submenu selectionMode and onSelectionChange',
  parameters: {description: {data: 'Lvl 1 and Lvl 3 menus have multiple selection, Lvl 2 menu has single selection'}}
};

export const DisabledSubMenuTrigger = {
  render: (args) => renderMenuTrigger(
    <Menu onSelectionChange={action('onSelectionChange lvl 1 menu')} selectionMode="multiple" {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubMenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onSelectionChange={action('onSelectionChange lvl 2 menu')} selectionMode="single" disabledKeys={['Lvl 2 Item 3']}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 1 Item 2">Lvl 2 Item 2</Item>
          <SubMenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onSelectionChange={action('onSelectionChange lvl 3 menu')} selectionMode="multiple">
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubMenuTrigger>
        </Menu>
      </SubMenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'disabled submenu trigger',
  parameters: {description: {data: 'Lvl 2 submenu trigger is disabled'}}
};

// TODO: make a story that has a menu item that conditionally becomes a submenu trigger and a contextualHelpTrigger
