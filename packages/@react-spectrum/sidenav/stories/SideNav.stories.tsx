import {action} from '@storybook/addon-actions';
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../';
import {storiesOf} from '@storybook/react';

let styles = {
  height: '400px'
};
const HeightDecorator = storyFn => <div style={styles}>{storyFn()}</div>;

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
.addDecorator(HeightDecorator)
  .add(
    'Default',
    () => (
      <SideNav onSelectionChange={action('onSelectionChange')} items={flatItems} itemKey="name">
        {item => <Item>{item.name}</Item>}
      </SideNav>
    )
  )
  .add(
    'With sections',
    () => (
      <SideNav items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
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
      <SideNav onSelectionChange={action('onSelectionChange')}>
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
      <SideNav onSelectionChange={action('onSelect')}>
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
