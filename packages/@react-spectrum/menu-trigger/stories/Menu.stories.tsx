import {action} from '@storybook/addon-actions';
import {Item, Menu, Section} from '../';
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
    'Multiselect menu',
    () => (
      <Menu items={withSection} itemKey="name" onSelect={action('onSelect')} selectionMode="multiple">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'Multiselect menu, static',
    () => (
      <Menu onSelect={action('onSelect')} selectionMode="multiple">
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
    'No selection allowed menu',
    () => (
      <Menu items={withSection} itemKey="name" onSelect={action('onSelect')} selectionMode="none">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'No selection allowed menu, static',
    () => (
      <Menu onSelect={action('onSelect')} selectionMode="none">
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
    'Menu with role="listbox"',
    () => (
      <Menu items={withSection} itemKey="name" onSelect={action('onSelect')} role="listbox">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Menu>
    )
  )
  .add(
    'Menu with role="listbox", static',
    () => (
      <Menu onSelect={action('onSelect')} role="listbox">
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
  );
