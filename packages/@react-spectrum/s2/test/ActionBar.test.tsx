/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ActionBar,
  ActionButton,
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
  Text
} from '../src';
import Copy from '@react-spectrum/s2/icons/Copy';
import Delete from '@react-spectrum/s2/icons/Delete';
import {describe, expect, it} from 'vitest';
import Edit from '@react-spectrum/s2/icons/Edit';
import React from 'react';
import {render} from './utils/render';
import {style} from '../style' with {type: 'macro'};

describe('ActionBar', () => {
  it('renders', async () => {
    let rows = [
      {id: 1, name: 'Charizard', type: 'Fire, Flying', level: '67'},
      {id: 2, name: 'Blastoise', type: 'Water', level: '56'},
      {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: '83'},
      {id: 4, name: 'Pikachu', type: 'Electric', level: '100'}
    ];

    const screen = await render(
      <TableView
        aria-label="Table with action bar"
        selectionMode="multiple"
        defaultSelectedKeys={[2]}
        styles={style({width: 'full', height: 250})}
        renderActionBar={() => (
          <ActionBar>
            <ActionButton onPress={() => alert('Edit action')}>
              <Edit />
              <Text>Edit</Text>
            </ActionButton>
            <ActionButton onPress={() => alert('Copy action')}>
              <Copy />
              <Text>Copy</Text>
            </ActionButton>
            <ActionButton onPress={() => alert('Delete action')}>
              <Delete />
              <Text>Delete</Text>
            </ActionButton>
          </ActionBar>
        )}>
        <TableHeader>
          <Column key="name" isRowHeader>Name</Column>
          <Column key="type">Type</Column>
          <Column key="level">Level</Column>
        </TableHeader>
        <TableBody items={rows}>
          {item => (
            <Row>
              <Cell key="name">{item.name}</Cell>
              <Cell key="type">{item.type}</Cell>
              <Cell key="level">{item.level}</Cell>
            </Row>
              )}
        </TableBody>
      </TableView>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
