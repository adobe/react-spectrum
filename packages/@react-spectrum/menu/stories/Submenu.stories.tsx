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
import {ActionButton} from '@react-spectrum/button';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import AnnotatePen from '@spectrum-icons/workflow/AnnotatePen';
import {Content} from '@react-spectrum/view';
import {ContextualHelpTrigger, Item, Menu, MenuTrigger, Section, SubmenuTrigger} from '../';
import defaultConfig, {render as renderMenuTrigger} from './MenuTrigger.stories';
import {Dialog} from '@react-spectrum/dialog';
import {Heading, Keyboard, Text} from '@react-spectrum/text';
import React from 'react';
import TextIndentIncrease from '@spectrum-icons/workflow/TextIndentIncrease';
import TextItalics from '@spectrum-icons/workflow/TextItalic';
import {ToggleButton} from '@adobe/react-spectrum';

export default {
  ...defaultConfig,
  title: 'MenuTrigger/Submenu'
};

export const SubmenuStatic = {
  render: (args) => (
    renderMenuTrigger(
      <Menu onAction={action('lvl 1 menu onAction')} {...args}>
        <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
        <SubmenuTrigger>
          <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
          <Menu onAction={action('lvl 2 menu onAction')} {...args.submenu1Props}>
            <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
            <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
            <SubmenuTrigger>
              <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
              <Menu onAction={action('lvl 3 menu onAction')} {...args.submenu2Props}>
                <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
                <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
                <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </SubmenuTrigger>
        <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
      </Menu>
    , args.menuTriggerProps)
  ),
  name: 'static submenu items'
};

let dynamicSubmenu = [
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

let manyItemsSubmenu = [
  {name: 'Lvl 1 Item 1'},
  {name: 'Lvl 1 Item 2', children: [
    ...[...Array(30)].map((_, i) => ({name: `Lvl 2 Item ${i + 1}`})),
    {name: 'Lvl 2 Item 31', children: [
      {name: 'Lvl 3 Item 1'},
      {name: 'Lvl 3 Item 2'},
      {name: 'Lvl 3 Item 3'}
    ]}
  ]},
  ...[...Array(30)].map((_, i) => ({name: `Lvl 1 Item ${i + 3}`}))
];

// TODO: is this really the only way to define the dynamic render func? Kinda annoying that we have
// to define this func separately and recursively call it, but I don't think we can do the same approach as
// collapsible rows tableview since Menu isn't a collection component nor are we making the parent Menu tree collection
// track the full "tree" of menu items (we aren't making Item take other items/sections as children and are relying on each submenu having its own
// tree state + collection tracking its own level of items).
let dynamicRenderFunc = (item) => {
  if (item.children) {
    return (
      <SubmenuTrigger>
        <Item key={item.name}>{item.name}</Item>
        <Menu items={item.children} onAction={action(`${item.name} onAction`)}>
          {(item) => dynamicRenderFunc(item)}
        </Menu>
      </SubmenuTrigger>
    );
  } else {
    return <Item key={item.name}>{item.name}</Item>;
  }
};

export const SubmenuDynamic = {
  render: (args) => (
    renderMenuTrigger(
      <Menu items={dynamicSubmenu} onAction={action('onAction')} {...args}>
        {(item) => dynamicRenderFunc(item)}
      </Menu>
    )
  ),
  name: 'dynamic submenu items'
};

export const SubmenuManyItems = {
  render: (args) => (
    renderMenuTrigger(
      <Menu items={manyItemsSubmenu} onAction={action('onAction')} {...args}>
        {(item) => dynamicRenderFunc(item)}
      </Menu>
    )
  ),
  name: 'dynamic submenu with many items'
};

export const SubmenuStaticSections = {
  render: () => (
    renderMenuTrigger(
      <Menu onAction={action('onAction')}>
        <Section title="Section 1">
          <Item key="Sec 1 Lvl 1 Item 1">Sec 1 Lvl 1 Item 1</Item>
          <SubmenuTrigger>
            <Item key="Sec 1 Lvl 1 Item 2">Sec 1 Lvl 1 Item 2</Item>
            <Menu onAction={action('Sec 1 Lvl 2 menu onAction')}>
              <Section title="Sub Section 1">
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 1">Sec 1 SubSec 1 Lvl 2 Item 1</Item>
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 2">Sec 1 SubSec 1 Lvl 2 Item 2</Item>
                <Item key="Sec 1 SubSec 1 Lvl 2 Item 3">Sec 1 SubSec 1 Lvl 2 Item 3</Item>
              </Section>
            </Menu>
          </SubmenuTrigger>
          <Item key="Sec 1 Lvl 1 Item 3">Sec 1 Lvl 1 Item 3</Item>
        </Section>
        <Section title="Section 2">
          <Item key="Sec 2 Lvl 1 Item 1">Sec 2 Lvl 1 Item 1</Item>
          <SubmenuTrigger>
            <Item key="Sec 2 Lvl 1 Item 2">Sec 2 Lvl 1 Item 2</Item>
            <Menu onAction={action('Sec 2 Lvl 2 menu onAction')}>
              <Section title="Sub Section 1">
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 1">Sec 2 SubSec 1 Lvl 2 Item 1</Item>
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 2">Sec 2 SubSec 1 Lvl 2 Item 2</Item>
                <Item key="Sec 2 SubSec 1 Lvl 2 Item 3">Sec 2 SubSec 1 Lvl 2 Item 3</Item>
              </Section>
            </Menu>
          </SubmenuTrigger>
          <Item key="Sec 2 Lvl 1 Item 3">Sec 2 Lvl 1 Item 3</Item>
        </Section>
      </Menu>
    )
  ),
  name: 'static submenu items with sections'
};

let dynamicSubmenuSections = [
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
  <SubmenuTrigger>
    <Item key={item.name} textValue={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
    </Item>
    <Menu items={item.children} onAction={action(`${item.name} onAction`)}>
      {(item) => dynamicRenderFuncSections(item)}
    </Menu>
  </SubmenuTrigger>
);

let dynamicRenderItem = (item, Icon) => (
  <Item key={item.name} textValue={item.name}>
    {item.icon && <Icon size="S" />}
    <Text>{item.name}</Text>
    {item.shortcut && <Keyboard>{item.shortcut}</Keyboard>}
  </Item>
);

let dynamicRenderFuncSections = (item: ItemNode) => {
  let Icon = iconMap[item.icon!];
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

export const SubmenuDynamicSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={dynamicSubmenuSections} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic submenu items with sections'
};

let submenuNoSection = [
  {name: 'Section 1', isSection: true, children: [
    {name: 'Sec 1 Lvl 1 Item 1', children: [
      {name: 'Sec 1 Lvl 2.1 Item 1'},
      {name: 'Sec 1 Lvl 2.1 Item 2'},
      {name: 'Sec 1 Lvl 2.1 Item 3'}
    ]},
    {name: 'Sec 1 Lvl 1 Item 2', children: [
      {name: 'Sec 1 Lvl 2.2 Item 1'},
      {name: 'Sec 1 Lvl 2.2 Item 2'},
      {name: 'Sec 1 Lvl 2.2 Item 3', children: [
        {name: 'Sec 1 Lvl 3.2 Item 1'},
        {name: 'Sec 1 Lvl 3.2 Item 2'},
        {name: 'Sec 1 Lvl 3.2 Item 3'}
      ]}
    ]},
    {name: 'Sec 1 Lvl 1 Item 3'}
  ]}
];

export const MainSectionsSubNoSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={submenuNoSection} onAction={action('onAction')}>
        {(item) => dynamicRenderFuncSections(item)}
      </Menu>
    )
  ),
  name: 'dynamic, main menu w/ sections, sub menu no sections'
};

let submenuSections = [
  {name: 'Lvl 1 Item 1', children: [
    {name: 'Section 1', isSection: true, children: [
      {name: 'Sec 1 Lvl 2.1 Item 1'},
      {name: 'Sec 1 Lvl 2.1 Item 2'},
      {name: 'Sec 1 Lvl 2.1 Item 3'}
    ]}
  ]},
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
      <Menu items={submenuSections} onAction={action('onAction')}>
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

export const SubmenuActions = {
  render: (args) => renderMenuTrigger(
    <Menu onAction={action('onAction lvl 1 menu')} onClose={action('onClose lvl 1 menu')} {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubmenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onAction={action('onAction lvl 2 menu')} onClose={action('onClose menu 2')}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
          <SubmenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onAction={action('onAction lvl 3 menu')} onClose={action('onClose menu 3')}>
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </SubmenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'submenu onAction and onClose',
  parameters: {description: {data: 'Each menu has its own onAction and onClose that are triggered only if its direct menu option was acted upon.'}}
};

export const SubmenuSelection = {
  render: (args) => renderMenuTrigger(
    <Menu onSelectionChange={action('onSelectionChange lvl 1 menu')} selectionMode="multiple" defaultSelectedKeys="all" {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubmenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onSelectionChange={action('onSelectionChange lvl 2 menu')} selectionMode="single" defaultSelectedKeys={['Lvl 2 Item 3']}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
          <SubmenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onSelectionChange={action('onSelectionChange lvl 3 menu')} selectionMode="multiple">
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </SubmenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'submenu selectionMode and onSelectionChange',
  parameters: {description: {data: 'Lvl 1 and Lvl 3 menus have multiple selection, Lvl 2 menu has single selection'}}
};

export const DisabledSubmenuTrigger = {
  render: (args) => renderMenuTrigger(
    <Menu onSelectionChange={action('onSelectionChange lvl 1 menu')} selectionMode="multiple" {...args}>
      <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
      <SubmenuTrigger>
        <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
        <Menu onSelectionChange={action('onSelectionChange lvl 2 menu')} selectionMode="single" disabledKeys={['Lvl 2 Item 3']}>
          <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
          <Item key="Lvl 1 Item 2">Lvl 2 Item 2</Item>
          <SubmenuTrigger>
            <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
            <Menu onSelectionChange={action('onSelectionChange lvl 3 menu')} selectionMode="multiple">
              <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
              <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
              <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </SubmenuTrigger>
      <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
    </Menu>
  ),
  name: 'disabled submenu trigger',
  parameters: {description: {data: 'Lvl 2 submenu trigger is disabled'}}
};

export const NoKeysProvided = {
  render: (args) => (
    renderMenuTrigger(
      <Menu onAction={action('lvl 1 menu onAction')} {...args}>
        <Item>Lvl 1 Item 1</Item>
        <SubmenuTrigger>
          <Item>Lvl 1 Item 2</Item>
          <Menu onAction={action('lvl 2 menu onAction')} {...args.submenu1Props}>
            <Item>Lvl 2 Item 1</Item>
            <Item>Lvl 2 Item 2</Item>
            <SubmenuTrigger>
              <Item>Lvl 2 Item 3</Item>
              <Menu onAction={action('lvl 3 menu onAction')} {...args.submenu2Props}>
                <Item>Lvl 3 Item 1</Item>
                <Item>Lvl 3 Item 2</Item>
                <Item>Lvl 3 Item 3</Item>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </SubmenuTrigger>
        <Item>Lvl 1 Item 3</Item>
      </Menu>
    , args.menuTriggerProps)
  ),
  name: 'no keys provided',
  parameters: {description: {data: 'No keys are provided so they should be autogenerated. It should allow for duplicated menu item keys across each submenu level, reflected in onAction'}}
};

export const ConditionalSubmenu = {
  render: (args) => <ConditionalSubmenuExample {...args} />,
  name: 'conditional submenu'
};

function ConditionalSubmenuExample(props) {
  let [disabled, setDisabled] = React.useState(false);

  return (
    <>
      <ToggleButton isSelected={disabled} onChange={setDisabled}>Toggle item 2 unavailable</ToggleButton>
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
          <ActionButton>
            Menu Button
          </ActionButton>
          <Menu onAction={action('onAction')}>
            <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
            {disabled ? (
              <ContextualHelpTrigger isUnavailable>
                <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
                <Dialog>
                  <Heading>SubmenuTrigger disabled</Heading>
                  <Content>You don't have permissions for this submenu</Content>
                </Dialog>
              </ContextualHelpTrigger>
            ) : (
              <SubmenuTrigger>
                <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
                <Menu>
                  <Item key="Lvl 2 Item 1">Lvl 2 Item 1</Item>
                  <Item key="Lvl 2 Item 2">Lvl 2 Item 2</Item>
                  <Item key="Lvl 2 Item 3">Lvl 2 Item 3</Item>
                </Menu>
              </SubmenuTrigger>
            )}
            <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
          </Menu>
        </MenuTrigger>
      </div>
    </>
  );
}

export const UnavailableWithSubmenu = {
  render: (args) => (
    renderMenuTrigger(
      <Menu onAction={action('lvl 1 menu onAction')} {...args}>
        <Item key="Lvl 1 Item 1">Lvl 1 Item 1</Item>
        <SubmenuTrigger>
          <Item key="Lvl 1 Item 2">Lvl 1 Item 2</Item>
          <Menu onAction={action('lvl 2.2 menu onAction')} {...args.submenu1Props}>
            <ContextualHelpTrigger isUnavailable>
              <Item key="Lvl 2 Item 1">Lvl 2.2 Item 1</Item>
              <Dialog>
                <Heading>another one</Heading>
                <Content>try hovering on other items</Content>
              </Dialog>
            </ContextualHelpTrigger>
            <Item key="Lvl 2 Item 2">Lvl 2.2 Item 2</Item>
            <SubmenuTrigger>
              <Item key="Lvl 2 Item 3">Lvl 2.2 Item 3</Item>
              <Menu onAction={action('lvl 3 menu onAction')} {...args.submenu2Props}>
                <Item key="Lvl 3 Item 1">Lvl 3 Item 1</Item>
                <Item key="Lvl 3 Item 2">Lvl 3 Item 2</Item>
                <Item key="Lvl 3 Item 3">Lvl 3 Item 3</Item>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </SubmenuTrigger>
        <ContextualHelpTrigger isUnavailable>
          <Item key="Lvl 1 Item 3">Lvl 1 Item 3</Item>
          <Dialog>
            <Heading>hello</Heading>
            <Content>Is it me you're looking for?</Content>
          </Dialog>
        </ContextualHelpTrigger>
        <SubmenuTrigger>
          <Item key="Lvl 1 Item 4">Lvl 1 Item 4</Item>
          <Menu onAction={action('lvl 2.4 menu onAction')} {...args.submenu1Props}>
            <Item key="Lvl 2.4 Item 1">Lvl 2.4 Item 1</Item>
            <Item key="Lvl 2.4 Item 2">Lvl 2.4 Item 2</Item>
            <Item key="Lvl 2.4 Item 3">Lvl 2.4 Item 3</Item>
          </Menu>
        </SubmenuTrigger>
      </Menu>
    )
  ),
  name: 'with unavailable menu item'
};

export const TabBehaviorStory = {
  render: () => (
    <>
      <input data-testid="inputleft" />
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')}>
          <ActionButton>
            Menu Button
          </ActionButton>
          <Menu items={dynamicSubmenu} onAction={action('onAction')}>
            {(item) => dynamicRenderFunc(item)}
          </Menu>
        </MenuTrigger>
      </div>
      <input data-testid="inputright" />
    </>
  ),
  name: 'tab behavior',
  parameters: {description: {data: 'Test tabbing and shift tabbing from within a submenu'}}
};
