import {action} from '@storybook/addon-actions';
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../';
import snStyles from './SideNav.css';
import {storiesOf} from '@storybook/react';

let flatItems = [
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
    {name: 'Ross'}
  ]}
];

storiesOf('SideNav', module)
  .add(
    'Default',
    () => (
      <SideNav items={flatItems} itemKey="name" UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelectionChange')}>
        {item => <Item>{item.name}</Item>}
      </SideNav>
    )
  )
  .add(
    'with default selected item',
    () => (
      <SideNav defaultSelectedKeys={['Kangaroo']} items={flatItems} itemKey="name" UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelectionChange')}>
        {item => <Item>{item.name}</Item>}
      </SideNav>
    )
  )
  .add(
    'with selected item (controlled)',
    () => (
      <SideNav selectedKeys={['Kangaroo']} items={flatItems} itemKey="name" UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelectionChange')}>
        {item => <Item>{item.name}</Item>}
      </SideNav>
    )
  )
  .add(
    'with disabled items',
    () => (
      <SideNav disabledKeys={['Kangaroo']} UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelectionChange')} items={flatItems} itemKey="name">
        {item => <Item>{item.name}</Item>}
      </SideNav>
    )
  )
  .add(
    'Default with sections',
    () => (
      <SideNav UNSAFE_className={snStyles['storybook-SideNav']} items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </SideNav>
    )
  )
  .add(
    'Static',
    () => (
      <SideNav UNSAFE_className={snStyles['storybook-SideNav']} onSelectionChange={action('onSelectionChange')}>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Bob</Item>
        <Item>Alice</Item>
      </SideNav>
    )
  )
  .add(
    'Static with sections',
    () => (
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
    )
);
