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
import {Table, TableProps} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Item, Cell} from '@react-stately/collections';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let items = [
  {foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1'},
  {foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2'},
];

storiesOf('Table', module)
  .add(
    'static',
    () => (
      <Table columns={columns} onSelectionChange={s => onSelectionChange([...s])}>
        <Item>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Item>
        <Item>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Item>
      </Table>
    )
  )
  .add(
    'dynamic',
    () => (
      <Table items={items} itemKey="foo" columns={columns} onSelectionChange={s => onSelectionChange([...s])}>
        {item =>
          <Item>
            {column => <Cell>{item[column.key]}</Cell>}
          </Item>
        }
      </Table>
    )
  );

let onSelectionChange = action('onSelectionChange');
function render(props:TableProps = {}) {
  return (
    <Table {...props} columns={columns} onSelectionChange={s => onSelectionChange([...s])}>
      <Item>
        <Cell>One</Cell>
        <Cell>Two</Cell>
        <Cell>Three</Cell>
      </Item>
      <Item>
        <Cell>One</Cell>
        <Cell>Two</Cell>
        <Cell>Three</Cell>
      </Item>
    </Table>
  );
}
