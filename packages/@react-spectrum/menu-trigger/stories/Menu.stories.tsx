import {action} from '@storybook/addon-actions';
import {Detail, Flex, Label} from "@react-spectrum/layout";
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import Paste from '@spectrum-icons/workflow/Paste';
import {Item, Menu, Section} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';

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

let hardModeProgrammatic = [
  {name: 'Section 1', isSection: true, children: [
    {name: 'Copy', icon: 'Copy', shortcut: '⌘C'},
    {name: 'Cut', icon: 'Cut', shortcut: '⌘X'},
    {name: 'Paste', icon: 'Paste', shortcut: '⌘V'}
  ]},
  {name: 'Section 2', isSection: true, children: [
    {name: 'Puppy', icon: 'AlignLeft', shortcut: '⌘P'},
    {name: 'Doggo', icon: 'AlignCenter', shortcut: '⌘D'},
    {name: 'Floof', icon: 'AlignRight', shortcut: '⌘F'}
  ]},
  {name: 'hasChildren', children: [
      {name: 'Thailand', icon: 'Blower', shortcut: '⌘T'},
      {name: 'Germany', icon: 'Book', shortcut: '⌘G'}
  ]}
];

storiesOf('Menu', module)
  .add(
    'Default Menu',
    () => (
      <Menu aria-labelledby="me" aria-label="hi" onSelect={action('onSelect')} items={flatMenu} itemKey="name">
        {item => <Item>{item.name}</Item>}
      </Menu>
    )
  )
  .add(
    'Menu w/ sections',
    () => (
      <Menu items={withSection} itemKey="name" onSelect={action('onSelect')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'Static',
    () => (
      <Menu onSelect={action('onSelect')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Menu>
    )
  )
  .add(
    'Static with sections',
    () => (
      <Menu onSelect={action('onSelect')}>
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
    )
  )
  .add(
    'with default selected menu items',
    () => (
      <Menu onSelect={action('onSelect')} items={withSection} itemKey="name" defaultSelectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'static with default selected menu items',
    () => (
      <Menu onSelect={action('onSelect')}>
        <Section title="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section title="Section 2">
          <Item>One</Item>
          <Item title="blah">
            <Item>gawegkawe</Item>
            <Item>fwaegawkjgbakw</Item>
          </Item>
          <Item>Three</Item>
        </Section>
      </Menu>
    )
  )
  .add(
    'with selected menu items (controlled)',
    () => (
      <Menu onSelect={action('onSelect')} items={withSection} itemKey="name" selectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'static with selected menu items (controlled)',
    () => (
      <Menu onSelect={action('onSelect')}>
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
    )
  )
  .add(
    'with disabled menu items',
    () => (
      <Menu onSelect={action('onSelect')} items={withSection} itemKey="name" disabledKeys={['Kangaroo', 'Ross']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'static with disabled menu items',
    () => (
      <Menu onSelect={action('onSelect')}>
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
    )
  )
  .add(
    'static hard mode layout',
    () => (
      <Menu onSelect={action('onSelect')}>
        <Section title="Section 1">
          <Item>
            <Copy size="S" />
            <Label>Copy</Label>
            <Flex slot="tools">
              <Switch />
              <Detail>⌘C</Detail>
            </Flex>
          </Item>
          <Item>
            <Cut size="S" />
            <Label>Cut</Label>
            <Flex slot="tools">
              <Switch />
              <Detail>⌘X</Detail>
            </Flex>
          </Item>
          <Item>
            <Paste size="S" />
            <Label>Paste</Label>
            <Flex slot="tools">
              <Switch />
              <Detail>⌘V</Detail>
            </Flex>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item>
            <AlignLeft size="S" />
            <Label>Puppy</Label>
            <Flex slot="tools">
              <Detail>⌘P</Detail>
            </Flex>
          </Item>
          <Item>
            <AlignCenter size="S" />
            <Label>Doggo</Label>
            <Flex slot="tools">
              <Detail>⌘D</Detail>
            </Flex>
          </Item>
          <Item>
            <AlignRight size="S" />
            <Label>Floof</Label>
            <Flex slot="tools">
              <Detail>⌘F</Detail>
            </Flex>
          </Item>
        </Section>
        <Item title="hasChildren">
          <Item>
            <Blower size="S" />
            <Label>Thailand</Label>
            <Flex slot="tools">
              <Detail>⌘T</Detail>
            </Flex>
          </Item>
          <Item>
            <Book size="S" />
            <Label>Germany</Label>
            <Flex slot="tools">
              <Detail>⌘G</Detail>
            </Flex>
          </Item>
        </Item>
      </Menu>
    )
  )
  /*.add(
    'Hardmode programmatic w/ sections',
    () => (
      <Menu items={withSection} itemKey="name" onSelect={action('onSelect')}>
        {item => {
          if (item.isSection) {
            return (
              <Section items={item.children} title={item.name}>
                {item => <Item childItems={item.children}>{item.name}</Item>}
              </Section>
            );
          }
          return <Item childItems={item.children}>{item.name}</Item>;
        }}
      </Menu>
    )
  )*/;
