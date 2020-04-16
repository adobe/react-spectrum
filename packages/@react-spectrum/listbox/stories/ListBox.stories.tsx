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
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, ListBox, Section} from '../';
import {Label} from '@react-spectrum/label';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

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
  {name: 'Ross'},
  {name: 'Puppy'},
  {name: 'Doggo'},
  {name: 'Floof'}
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

let lotsOfSections: any[] = [];
for (let i = 0; i < 50; i++) {
  let children = [];
  for (let j = 0; j < 50; j++) {
    children.push({name: `Section ${i}, Item ${j}`});
  }

  lotsOfSections.push({name: 'Section ' + i, children});
}

storiesOf('ListBox', module)
  .addDecorator(story => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">Choose an item</Label>
      <div style={{display: 'flex', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray', maxHeight: 300}}>
        {story()}
      </div>
    </div>
  ))
  .add(
    'Default ListBox',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} items={flatOptions} itemKey="name">
        {item => <Item>{item.name}</Item>}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ sections',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ many sections',
    () => (
      <ListBox width={200} aria-labelledby="label" items={lotsOfSections} itemKey="name" onSelectionChange={action('onSelectionChange')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ sections and no title',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
        {item => (
          <Section items={item.children} aria-label={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'Static',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </ListBox>
    )
  )
  .add(
    'Static with sections',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')}>
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
      </ListBox>
    )
  )
  .add(
    'Static with sections and no title',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')}>
        <Section aria-label="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section aria-label="Section 2">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with default selected options',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" defaultSelectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'static with default selected options',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} defaultSelectedKeys={['2']}>
        <Section title="Section 1">
          <Item uniqueKey="1">
            One
          </Item>
          <Item uniqueKey="2">
            Two
          </Item>
          <Item uniqueKey="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item uniqueKey="4">
            Four
          </Item>
          <Item uniqueKey="5">
            Five
          </Item>
          <Item uniqueKey="6">
            Six
          </Item>
          <Item uniqueKey="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with selected options (controlled)',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" selectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'static with selected options (controlled)',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} selectedKeys={['2']}>
        <Section title="Section 1">
          <Item uniqueKey="1">
            One
          </Item>
          <Item uniqueKey="2">
            Two
          </Item>
          <Item uniqueKey="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item uniqueKey="4">
            Four
          </Item>
          <Item uniqueKey="5">
            Five
          </Item>
          <Item uniqueKey="6">
            Six
          </Item>
          <Item uniqueKey="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with disabled options',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} items={withSection} itemKey="name" disabledKeys={['Kangaroo', 'Ross']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'static with disabled options',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} disabledKeys={['3', '5']}>
        <Section title="Section 1">
          <Item uniqueKey="1">
            One
          </Item>
          <Item uniqueKey="2">
            Two
          </Item>
          <Item uniqueKey="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item uniqueKey="4">
            Four
          </Item>
          <Item uniqueKey="5">
            Five
          </Item>
          <Item uniqueKey="6">
            Six
          </Item>
          <Item uniqueKey="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'Multiple selection',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} selectionMode="multiple" defaultSelectedKeys={['Aardvark', 'Snake']} disabledKeys={['Kangaroo', 'Ross']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'Multiple selection, static',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} selectionMode="multiple" defaultSelectedKeys={['2', '5']} disabledKeys={['1', '3']}>
        <Section title="Section 1">
          <Item uniqueKey="1">
            One
          </Item>
          <Item uniqueKey="2">
            Two
          </Item>
          <Item uniqueKey="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item uniqueKey="4">
            Four
          </Item>
          <Item uniqueKey="5">
            Five
          </Item>
          <Item uniqueKey="6">
            Six
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'No selection allowed',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} selectionMode="none">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'No selection allowed, static',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} selectionMode="none">
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
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus=true',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} autoFocus>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus="first"',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} autoFocus="first">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus="last"',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} autoFocus="last">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with keyboard selection wrapping',
    () => (
      <ListBox width={200} aria-labelledby="label" items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} shouldFocusWrap>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'with semantic elements (static)',
    () => (
      <ListBox width={200} aria-labelledby="label" onSelectionChange={action('onSelectionChange')}>
        <Section title="Section 1">
          <Item textValue="Copy">
            <Copy size="S" />
            <Text>Copy</Text>
          </Item>
          <Item textValue="Cut">
            <Cut size="S" />
            <Text>Cut</Text>
          </Item>
          <Item textValue="Paste">
            <Paste size="S" />
            <Text>Paste</Text>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item textValue="Puppy">
            <AlignLeft size="S" />
            <Text>Puppy</Text>
            <Text slot="description">Puppy description super long as well geez</Text>
          </Item>
          <Item textValue="Doggo with really really really long long long text">
            <AlignCenter size="S" />
            <Text>Doggo with really really really long long long text</Text>
          </Item>
          <Item textValue="Floof">
            <AlignRight size="S" />
            <Text>Floof</Text>
          </Item>
          <Item>
            Basic Item
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with semantic elements (generative)',
    () => (
      <ListBox width={200} aria-labelledby="label"items={hardModeProgrammatic} itemKey="name" onSelectionChange={action('onSelectionChange')} selectionMode="multiple">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => customOption(item)}
          </Section>
        )}
      </ListBox>
    )
  );

let customOption = (item) => {
  let Icon = iconMap[item.icon];
  return (
    <Item textValue={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
    </Item>
  );
};
