import {action} from '@storybook/addon-actions';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Flex, Keyboard, Text} from '@react-spectrum/layout';
import {Item, Menu, Section} from '../';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';

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
  {name: 'Section 1', children: [
    {name: 'Copy', icon: 'Copy', shortcut: '⌘C'},
    {name: 'Cut', icon: 'Cut', shortcut: '⌘X'},
    {name: 'Paste', icon: 'Paste', shortcut: '⌘V'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Puppy', icon: 'AlignLeft', shortcut: '⌘P'},
    {name: 'Doggo', icon: 'AlignCenter', shortcut: '⌘D'},
    {name: 'Floof', icon: 'AlignRight', shortcut: '⌘F'},
    {name: 'hasChildren', children: [
        {name: 'Thailand', icon: 'Blower', shortcut: '⌘T'},
        {name: 'Germany', icon: 'Book', shortcut: '⌘G'}
    ]}
  ]}
];

storiesOf('Menu', module)
  .add(
    'Default Menu',
    () => (
      <Menu onSelect={action('onSelect')} items={flatMenu} itemKey="name">
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
            <Text>Copy</Text>
            <Flex slot="tools">
              <Switch />
              <Keyboard slot="detail">⌘C</Keyboard>
            </Flex>
          </Item>
          <Item>
            <Cut size="S" />
            <Text>Cut</Text>
            <Flex slot="tools">
              <Switch />
              <Keyboard slot="detail">⌘X</Keyboard>
            </Flex>
          </Item>
          <Item>
            <Paste size="S" />
            <Text>Paste</Text>
            <Flex slot="tools">
              <Switch />
              <Keyboard slot="detail">⌘V</Keyboard>
            </Flex>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item>
            <AlignLeft size="S" />
            <Text>Puppy</Text>
            <Flex slot="tools">
              <Keyboard slot="detail">⌘P</Keyboard>
            </Flex>
          </Item>
          <Item>
            <AlignCenter size="S" />
            <Text>Doggo</Text>
            <Flex slot="tools">
              <Keyboard slot="detail">⌘D</Keyboard>
            </Flex>
          </Item>
          <Item>
            <AlignRight size="S" />
            <Text>Floof</Text>
            <Flex slot="tools">
              <Keyboard slot="detail">⌘F</Keyboard>
            </Flex>
          </Item>
          <Item title="hasChildren">
            <Item>
              <Blower size="S" />
              <Text>Thailand</Text>
              <Flex slot="tools">
                <Switch />
                <Keyboard slot="detail">⌘T</Keyboard>
              </Flex>
            </Item>
            <Item>
              <Book size="S" />
              <Text>Germany</Text>
              <Flex slot="tools">
                <Switch />
                <Keyboard slot="detail">⌘G</Keyboard>
              </Flex>
            </Item>
          </Item>
        </Section>
      </Menu>
    )
  );

/*
TODO: How should this work?? i want it to render the same as the static story but in the programmatic way
 */
/*
  .add(
    'Hardmode programmatic w/ sections',
    () => (
      <Menu items={hardModeProgrammatic} itemKey="name" onSelect={action('onSelect')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {customMenuItem}
          </Section>
        )}
      </Menu>
    )
  );

let customMenuItem = item => {
  let Icon = iconMap[item.icon];
  return (
    <Item childItems={item.children}>
      <Icon size="S" />
      <Text>{item.name}</Text>
      <Flex slot="tools">
        <Switch />
        <Keyboard>{item.shortcut}</Keyboard>
      </Flex>
    </Item>
  );
};
*/
