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
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../';
import snStyles from './SideNav.css';

let flatItems = [{name: 'Aardvark'}, {name: 'Kangaroo'}, {name: 'Snake'}];

let withSection = [
  {name: 'Animals', children: [{name: 'Aardvark'}, {name: 'Kangaroo'}, {name: 'Snake'}]},
  {name: 'People', children: [{name: 'Danni'}, {name: 'Devon'}, {name: 'Ross'}]}
];

export default {
  title: 'SideNav'
};

export const Default = () => (
  <SideNav
    items={flatItems}
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </SideNav>
);

export const WithDefaultSelectedItem = () => (
  <SideNav
    selectionMode="single"
    defaultSelectedKeys={['Kangaroo']}
    items={flatItems}
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </SideNav>
);

WithDefaultSelectedItem.story = {
  name: 'with default selected item'
};

export const WithSelectedItemControlled = () => (
  <SideNav
    selectionMode="single"
    selectedKeys={['Kangaroo']}
    items={flatItems}
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </SideNav>
);

WithSelectedItemControlled.story = {
  name: 'with selected item (controlled)'
};

export const WithDisabledItems = () => (
  <SideNav
    selectionMode="single"
    disabledKeys={['Kangaroo']}
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}
    items={flatItems}>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </SideNav>
);

WithDisabledItems.story = {
  name: 'with disabled items'
};

export const WithKeyboardSelectionWrapping = () => (
  <SideNav
    selectionMode="single"
    items={flatItems}
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}
    shouldFocusWrap>
    {(item) => <Item key={item.name}>{item.name}</Item>}
  </SideNav>
);

WithKeyboardSelectionWrapping.story = {
  name: 'with keyboard selection wrapping'
};

export const DefaultWithSections = () => (
  <SideNav
    UNSAFE_className={snStyles['storybook-SideNav']}
    items={withSection}
    onSelectionChange={action('onSelectionChange')}>
    {(item) => (
      <Section key={item.name} items={item.children} title={item.name}>
        {(item) => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </SideNav>
);

DefaultWithSections.story = {
  name: 'Default with sections'
};

export const Static = () => (
  <SideNav
    UNSAFE_className={snStyles['storybook-SideNav']}
    onSelectionChange={action('onSelectionChange')}>
    <Item>Foo</Item>
    <Item>Bar</Item>
    <Item>Bob</Item>
    <Item>Alice</Item>
  </SideNav>
);

export const StaticWithSections = () => (
  <SideNav UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelect')}>
    <Section title="Section 1">
      <Item>Foo 1</Item>
      <Item>Bar 1</Item>
    </Section>
    <Section title="Section 2">
      <Item>Foo 2</Item>
      <Item>Bar 2</Item>
    </Section>
  </SideNav>
);

StaticWithSections.story = {
  name: 'Static with sections'
};
