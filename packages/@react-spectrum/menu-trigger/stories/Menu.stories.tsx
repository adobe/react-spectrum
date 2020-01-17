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
        <Menu onSelectionChange={action('onSelectionChange')}>
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
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
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
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
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
            <Item>One</Item>
            <Item>Two</Item>
            <Item>Three</Item>
          </Section>
        </Menu>
      </Popover>
    )
  );
