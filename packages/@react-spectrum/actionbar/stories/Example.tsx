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

import {ActionBar, ActionBarContainer, Item} from '../';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import Copy from '@spectrum-icons/workflow/Copy';
import DataAdd from '@spectrum-icons/workflow/DataAdd';
import Delete from '@spectrum-icons/workflow/Delete';
import Duplicate from '@spectrum-icons/workflow/Duplicate';
import Edit from '@spectrum-icons/workflow/Edit';
import {mergeProps} from '@react-aria/utils';
import Move from '@spectrum-icons/workflow/Move';
import React, {useRef, useState} from 'react';
import {Selection} from '@react-types/shared';
import {Text} from '@react-spectrum/text';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

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

export function Example(props: any = {}) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(props.defaultSelectedKeys || new Set());
  let [items, setItems] = useState(defaultItems);

  let ref = useRef(null);
  return (
    <ActionBarContainer height={props.containerHeight || 300}>
      <TableView
        ref={ref}
        aria-label="Table"
        isQuiet={props.isQuiet}
        width={props.tableWidth}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onSelectionChange={(keys) => setSelectedKeys(keys)}>
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </TableView>
      <ActionBar
        selectedItemCount={selectedKeys === 'all' ? selectedKeys : selectedKeys.size}
        onClearSelection={() => {
          setSelectedKeys(new Set());
        }}
        {...mergeProps(props, {
          onAction: (key) => {
            if (key === 'delete') {
              let newItems = items;
              if (selectedKeys instanceof Set) {
                newItems = items.filter(item => !selectedKeys.has(item.foo));
              } else if (selectedKeys === 'all') {
                newItems = [];
              }
              setItems(newItems);
              setSelectedKeys(new Set());
            }
          }
        })}>
        <Item key="edit" textValue="Edit">
          <Edit />
          <Text>Edit</Text>
        </Item>
        <Item key="copy" textValue="Copy">
          <Copy />
          <Text>Copy</Text>
        </Item>
        <Item key="delete" textValue="Delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
        <Item key="move" textValue="Move">
          <Move />
          <Text>Move</Text>
        </Item>
        <Item key="duplicate" textValue="Duplicate">
          <Duplicate />
          <Text>Duplicate</Text>
        </Item>
      </ActionBar>
    </ActionBarContainer>
  );
}

export function Example2(props: any = {}) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(props.defaultSelectedKeys || new Set());
  let [items, setItems] = useState(defaultItems);

  let ref = useRef(null);
  return (
    <ActionBarContainer height={props.containerHeight || 300}>
      <TableView
        ref={ref}
        aria-label="Table"
        isQuiet={props.isQuiet}
        width={props.tableWidth}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onSelectionChange={(keys) => setSelectedKeys(keys)}>
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </TableView>
      <ActionBar
        selectedItemCount={selectedKeys === 'all' ? selectedKeys : selectedKeys.size}
        onClearSelection={() => {
          setSelectedKeys(new Set());
        }}
        {...mergeProps(props, {
          onAction: (key) => {
            if (key === 'delete') {
              let newItems = items;
              if (selectedKeys instanceof Set) {
                newItems = items.filter(item => !selectedKeys.has(item.foo));
              } else if (selectedKeys === 'all') {
                newItems = [];
              }
              setItems(newItems);
              setSelectedKeys(new Set());
            }
          }
        })}>
        <Item key="edit" textValue="Edit">
          <Edit size="S" />
          <Text>Bearbeiten</Text>
        </Item>
        <Item key="loschen" textValue="Delete">
          <Delete size="S" />
          <Text>Löschen</Text>
        </Item>
        <Item key="dataadd" textValue="DataAdd">
          <DataAdd size="S" />
          <Text>Datenansicht erstellen</Text>
        </Item>
      </ActionBar>
    </ActionBarContainer>
  );
}
