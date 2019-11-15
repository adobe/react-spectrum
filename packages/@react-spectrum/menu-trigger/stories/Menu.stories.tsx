import {action} from '@storybook/addon-actions';
// import {Button} from '@react-spectrum/button';
import {Item, Menu, Section, V3Menu, V2MenuDivider, V2MenuHeading, V2MenuItem} from '../';
// import {MenuTrigger} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

let flatMenu = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'}
]

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
    'using old menu, delete after, test story',
    () => (
      <Menu>
        <V2MenuHeading>Heading 1</V2MenuHeading>
        <V2MenuItem>blah</V2MenuItem>
        <V2MenuItem>blah1</V2MenuItem>
        <V2MenuItem>blah2</V2MenuItem>
        <V2MenuDivider />
        <V2MenuHeading>Heading 2</V2MenuHeading>
        <V2MenuItem>heh</V2MenuItem>
        <V2MenuItem>heh1</V2MenuItem>
        <V2MenuItem>heh2</V2MenuItem>
        <V2MenuDivider />
      </Menu>
    )
  )
  .add(
    'Default Menu',
    () => (
      <V3Menu aria-labelledby="me" aria-label="hi" items={flatMenu} itemKey="name">
        {item => <Item childItems={item.children}>{item.name}</Item>}
      </V3Menu>
    )
  )
  .add(
    'Menu w/ sections',
    () => (
      <V3Menu items={withSection} itemKey="name">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </V3Menu>
    )
  )
  .add(
    'Static',
    () => (
      <V3Menu>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </V3Menu>
    )
  )
  .add(
    'Static with sections',
    () => (
      <V3Menu>
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
      </V3Menu>
    )
  )
  .add(
    'with default selected menu items',
    () => (
      <V3Menu items={withSection} itemKey="name" defaultSelectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </V3Menu>
    )
  )
  .add(
    'static with default selected menu items',
    () => (
      <V3Menu>
        <Section title="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section title="Section 2">
          <Item isSelected>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
      </V3Menu>
    )
  )
  .add(
    'with selected menu items (controlled)',
    () => (
      <V3Menu items={withSection} itemKey="name" selectedKeys={['Kangaroo']}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </V3Menu>
    )
  )
  .add(
    'static with selected menu items (controlled)',
    () => (
      <V3Menu>
        <Section title="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section title="Section 2">
          <Item isSelected>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
      </V3Menu>
    )
  );
  // .add(
  // Not available in useTreeState?
  //   'with disabled menu items',
  //   () => (

  //   )
  // )
  // .add(
  //   'static with disabled menu items',
  //   () => (
      
  //   )
  // )
  // .add(
  //   'with submenus, OUT OF SCOPE',
  //   () => ()
  // )
  // .add(
  //   'static with submenus, OUT OF SCOPE',
  //   () => ()
  // );
  
function render(props = {}, menuProps = {}) {
  return (
    <div>filler</div>
  );
}
