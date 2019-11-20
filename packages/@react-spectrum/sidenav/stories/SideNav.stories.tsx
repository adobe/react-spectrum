import {action} from '@storybook/addon-actions';
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../';
import {storiesOf} from '@storybook/react';

storiesOf('SideNav', module)
  .add(
    'Static',
    () => (
      <SideNav>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Bob</Item>
        <Item>Alice</Item>
      </SideNav>
    )
  ).add(
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
