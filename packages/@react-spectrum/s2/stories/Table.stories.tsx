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

import {Column, Row, Table, TableHeader, Cell, TableBody} from '../src/Table';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Table> = {
  component: Table,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

// TODO: i assume the api for S2 Table would involve the users
// not needing to pass TableHeader and TableBody?

export const Example = (args: any) => (
  <Table aria-label="Files" {...args}>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
      <Column>Date Modified</Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>Games</Cell>
        <Cell>File folder</Cell>
        <Cell>6/7/2020</Cell>
      </Row>
      <Row>
        <Cell>Program Files</Cell>
        <Cell>File folder</Cell>
        <Cell>4/7/2021</Cell>
      </Row>
      <Row>
        <Cell>bootmgr</Cell>
        <Cell>System file</Cell>
        <Cell>11/20/2010</Cell>
      </Row>
    </TableBody>
  </Table>
);

Example.args = {
  onRowAction: null,
  onCellAction: null,
  selectionMode: 'multiple'
};


// TODO: stories to add
// DnD
// highlight selection
// resizing
// disabled rows
// sorting
// empty state
// densitiy
// many items
