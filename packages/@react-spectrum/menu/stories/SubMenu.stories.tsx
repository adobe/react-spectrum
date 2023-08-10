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
import defaultConfig, {render as renderMenuTrigger} from './MenuTrigger.stories';
import {Item, Menu, Section} from '../';
import React from 'react';


export default {
  ...defaultConfig,
  title: 'MenuTrigger/SubMenu'
};

export const SubMenuStatic = {
  render: () => (
    renderMenuTrigger(
      <Menu onAction={action('onAction')}>
        <Item>Lvl 1 Item 1</Item>
        <Item title="Lvl 1 Item 2">
          <Item>Lvl 2 Item 1</Item>
          <Item>Lvl 2 Item 2</Item>
          <Item title="Lvl 2 Item 3">
            <Item>Lvl 3 Item 1</Item>
            <Item>Lvl 3 Item 2</Item>
            <Item>Lvl 3 Item 3</Item>
          </Item>
        </Item>
        <Item>Lvl 1 Item 3</Item>
      </Menu>
    )
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

export const SubMenuDynamic = {
  render: () => (
    renderMenuTrigger(
      <Menu items={dynamicSubMenu} onAction={action('onAction')}>
        {(item) => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
      </Menu>
    )
  ),
  name: 'dynamic submenu items'
};

export const SubMenuStaticSections = {
  render: () => (
    renderMenuTrigger(
      <Menu onAction={action('onAction')}>
        <Section title="Section 1">
          <Item>Sec 1 Lvl 1 Item 1</Item>
          <Item title="Sec 1 Lvl 1 Item 2">
            <Section title="Sub Section 1">
              <Item>Sec 1 SubSec 1 Lvl 2 Item 1</Item>
              <Item>Sec 1 SubSec 1 Lvl 2 Item 2</Item>
              <Item>Sec 1 SubSec 1 Lvl 2 Item 3</Item>
            </Section>
          </Item>
          <Item>Sec 1 Lvl 1 Item 3</Item>
        </Section>
        <Section title="Section 2">
          <Item>Sec 2 Lvl 1 Item 1</Item>
          <Item title="Sec 2 Lvl 1 Item 2">
            <Section title="Sub Section 1">
              <Item>Sec 2 SubSec 1 Lvl 2 Item 1</Item>
              <Item>Sec 2 SubSec 1 Lvl 2 Item 2</Item>
              <Item>Sec 2 SubSec 1 Lvl 2 Item 3</Item>
            </Section>
          </Item>
          <Item>Sec 2 Lvl 1 Item 3</Item>
        </Section>
      </Menu>
    )
  ),
  name: 'static submenu items with sections'
};

let dynamicSubMenuSections = [
  {name: 'Section 1', children: [
    {name: 'Sec 1 Lvl 1 Item 1'},
    {name: 'Sec 1 Lvl 1 Item 2', children: [
      {name: 'Sub Section 1', children: [
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 1'},
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 2'},
        {name: 'Sec 1 SubSec 1 Lvl 2 Item 3'}
      ]}
    ]},
    {name: 'Sec 1 Lvl 1 Item 3'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Sec 2 Lvl 1 Item 1'},
    {name: 'Sec 2 Lvl 1 Item 2', children: [
      {name: 'Sub Section 1', children: [
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 1'},
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 2'},
        {name: 'Sec 2 SubSec 1 Lvl 2 Item 3'}
      ]}
    ]},
    {name: 'Sec 2 Lvl 1 Item 3'}
  ]}
];

export const SubMenuDynamicSections = {
  render: () => (
    renderMenuTrigger(
      <Menu items={dynamicSubMenuSections} onAction={action('onAction')}>
        {(item) => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item) => <Item key={item.name} childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  ),
  name: 'dynamic submenu items with sections'
};

// TODO add mix of sub menus with sections and without section
