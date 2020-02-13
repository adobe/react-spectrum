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
import {action} from '@storybook/addon-actions';
import {Item, Menu, Section} from '../';
import {Popover} from '@react-spectrum/overlays';
import React from 'react';
import {storiesOf} from '@storybook/react';

let flatMenu = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'}
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
    {name: 'Ross', children: [
      {name: 'Tests'}
    ]}
  ]}
];

storiesOf('Menu', module)
  .add(
    'Default Menu',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} items={flatMenu} itemKey="name">
          {item => <Item>{item.name}</Item>}
        </Menu>
      </Popover>
    )
  )
  .add(
    'Menu w/ sections',
    () => (
      <Popover isOpen hideArrow>
        <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'Static',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Menu>
      </Popover>
    )
  )
  .add(
    'Static with sections',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')}>
          <Section title="Section 1">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
          <Section title="Section 2">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'with default selected menu items',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" defaultSelectedKeys={['Kangaroo']}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'static with default selected menu items',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} defaultSelectedKeys={['2']}>
          <Section key="section1" title="Section 1">
            <Item key="1">
              One
            </Item>
            <Item key="2">
              Two
            </Item>
            <Item key="3">
              Three
            </Item>
          </Section>
          <Section key="section2" title="Section 2">
            <Item key="4">
              Four
            </Item>
            <Item key="5">
              Five
            </Item>
            <Item key="6">
              Six
            </Item>
            <Item key="7">
              Seven
            </Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'with selected menu items (controlled)',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" selectedKeys={['Kangaroo']}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'static with selected menu items (controlled)',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} selectedKeys={['2']}>
          <Section key="sec1" title="Section 1">
            <Item key="1">
              One
            </Item>
            <Item key="2">
              Two
            </Item>
            <Item key="3">
              Three
            </Item>
          </Section>
          <Section key="sec2" title="Section 2">
            <Item key="4">
              Four
            </Item>
            <Item key="5">
              Five
            </Item>
            <Item key="6">
              Six
            </Item>
            <Item key="7">
              Seven
            </Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'with disabled menu items',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" disabledKeys={['Kangaroo', 'Ross']}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'static with disabled menu items',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} disabledKeys={['3', '5']}>
          <Section key="sec1" title="Section 1">
            <Item key="1">
              One
            </Item>
            <Item key="2">
              Two
            </Item>
            <Item key="3">
              Three
            </Item>
          </Section>
          <Section key="sec2" title="Section 2">
            <Item key="4">
              Four
            </Item>
            <Item key="5">
              Five
            </Item>
            <Item key="6">
              Six
            </Item>
            <Item key="7">
              Seven
            </Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'Multiselect menu',
    () => (
      <Popover isOpen hideArrow>
        <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} selectionMode="multiple">
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'Multiselect menu, static',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} selectionMode="multiple">
          <Section title="Section 1">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
          <Section title="Section 2">
            <Item>Four</Item>
            <Item>Five</Item>
            <Item>Six</Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'No selection allowed menu',
    () => (
      <Popover isOpen hideArrow>
        <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} selectionMode="none">
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'No selection allowed menu, static',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} selectionMode="none">
          <Section title="Section 1">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
          <Section title="Section 2">
            <Item>Four</Item>
            <Item>Five</Item>
            <Item>Six</Item>
          </Section>
        </Menu>
      </Popover>
    )
  )
  .add(
    'Menu with role="listbox"',
    () => (
      <Popover isOpen hideArrow>
        <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} role="listbox">
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </Popover>
    )
  )
  .add(
    'Menu with role="listbox", static',
    () => (
      <Popover isOpen hideArrow>
        <Menu onSelectionChange={action('onSelectionChange')} role="listbox">
          <Section title="Section 1">
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
          <Section title="Section 2">
            <Item>Four</Item>
            <Item>Five</Item>
            <Item>Six</Item>
          </Section>
        </Menu>
      </Popover>
    )
  );
