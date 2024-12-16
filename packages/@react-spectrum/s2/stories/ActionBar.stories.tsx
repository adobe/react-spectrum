/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {ActionBar} from '../src/ActionBar';
import {ActionButton} from '../src/ActionButton';
import {Example as CardViewExample} from './CardView.stories';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof ActionBar> = {
  component: ActionBar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'ActionBar'
};

export default meta;

type Story = StoryObj<typeof ActionBar>;

export const Example: Story = {
  render: (args) => {
    return (
      <ActionBar {...args}>
        <ActionButton>Edit</ActionButton>
        <ActionButton>Copy</ActionButton>
        <ActionButton>Delete</ActionButton>
      </ActionBar>
    );
  },
  args: {
    selectedItemCount: 224
  }
};

export const CardExample: Story = {
  render: args => (
    // @ts-ignore
    <CardViewExample
      selectionMode="multiple"
      renderActionBar={selectedKeys => (
        <ActionBar {...args}>
          <ActionButton onPress={() => action('edit')([...selectedKeys])}>Edit</ActionButton>
          <ActionButton onPress={() => action('copy')([...selectedKeys])}>Copy</ActionButton>
          <ActionButton onPress={() => action('delete')([...selectedKeys])}>Delete</ActionButton>
        </ActionBar>
      )} />
  ),
  parameters: {
    layout: 'fullscreen'
  }
};

let defaultItems = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 9', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 10', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 11', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 12', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 13', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 14', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 15', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 16', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

export const TableExample: Story = {
  render: args => (
    <TableView
      aria-label="Table"
      styles={style({width: 500, height: 300})}
      selectionMode="multiple"
      renderActionBar={selectedKeys => (
        <ActionBar {...args}>
          <ActionButton onPress={() => action('edit')([...selectedKeys])}>Edit</ActionButton>
          <ActionButton onPress={() => action('copy')([...selectedKeys])}>Copy</ActionButton>
          <ActionButton onPress={() => action('delete')([...selectedKeys])}>Delete</ActionButton>
        </ActionBar>
      )}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.key === 'foo'}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={defaultItems}>
        {item => (
          <Row columns={columns} id={item.foo}>
            {col => <Cell>{item[col.key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  )
};
