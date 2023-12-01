import {Cell, Column, Row, Table, TableHeader} from '../src/Table';
import {TableBody} from 'react-aria-components';

import type {Meta} from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof Table> = {
  component: Table,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => {
  let [sortDescriptor, setSortDescriptor] = useState({
    column: 'name',
    direction: 'ascending'
  });

  return (
    <Table aria-label="Files" {...args} sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
      <TableHeader>
        <Column id="name" isRowHeader allowsSorting>Name</Column>
        <Column id="type" allowsSorting>Type</Column>
        <Column id="date" allowsSorting>Date Modified</Column>
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
}

Example.args = {
  onRowAction: null,
  onCellAction: null,
  selectionMode: 'multiple'
};
