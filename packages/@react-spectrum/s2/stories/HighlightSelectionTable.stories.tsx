/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CalendarDate, getLocalTimeZone} from '@internationalized/date';
import {categorizeArgTypes, getActionArgs} from './utils';
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
  TableViewProps,
  TreeView
} from '../src';
import type {Meta} from '@storybook/react';
import React, {ReactElement} from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import UserGroup from '../s2wf-icons/S2_Icon_UserGroup_20_N.svg';

const events = ['onSelectionChange'];

const meta: Meta<typeof TreeView> = {
  title: 'Highlight Selection/TableView',
  component: TableView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  }
};

export default meta;

let columns = [
  {name: 'Name', id: 'name', isRowHeader: true, minWidth: 400},
  {name: 'Sharing', id: 'sharing', minWidth: 200},
  {name: 'Date modified', id: 'date', minWidth: 200}
];

interface Item {
  id: number,
  name: {
    name: string,
    meta: string,
    description?: string
  },
  sharing: string,
  date: CalendarDate
}

let items: Item[] = [
  {id: 1, name: {name: 'Designer resume', meta: 'PDF', description: 'From Molly Holt'}, sharing: 'public', date: new CalendarDate(2020, 7, 6)},
  // eslint-disable-next-line quotes
  {id: 2, name: {name: `Career Management for IC's`, meta: 'PDF'}, sharing: 'public', date: new CalendarDate(2020, 7, 6)},
  {id: 3, name: {name: 'CMP Sessions', meta: 'PDF'}, sharing: 'public', date: new CalendarDate(2020, 7, 6)},
  {id: 4, name: {name: 'Clifton Strength Assessment Info', meta: 'Folder'}, sharing: 'none', date: new CalendarDate(2020, 7, 6)},
  {id: 5, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)},
  {id: 6, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)},
  {id: 7, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)},
  {id: 8, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)},
  {id: 9, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)},
  {id: 10, name: {name: 'Personal Brand', meta: 'Zip'}, sharing: 'private', date: new CalendarDate(2020, 7, 6)}
];

export const DocumentsTable = {
  render: (args: TableViewProps): ReactElement => (
    <TableView aria-label="Dynamic table" {...args} styles={style({width: 700, height: 400})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column {...column}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              if (column.id === 'sharing') {
                let content = item[column.id] === 'public' ? <div className={style({display: 'flex', alignItems: 'center', gap: 4})}><UserGroup /><div>Shared</div></div> : 'Only you';
                if (item[column.id] ===  'none') {
                  content = '-';
                }
                return <Cell>{content}</Cell>;
              }
              if (column.id === 'name') {
                return (
                  <Cell>
                    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})}>
                      <div>{item[column.id].name}</div>
                      <div className={style({display: 'flex', gap: 4, font: 'detail-sm'})}>
                        <div>{item[column.id].meta}</div>
                        {item[column.id].description && <><div>&middot;</div><div>{item[column.id].description}</div></>}
                      </div>
                    </div>
                  </Cell>
                );
              }
              if (column.id === 'date') {
                return <Cell>{item[column.id].toDate(getLocalTimeZone()).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</Cell>;
              }
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  ),
  args: {
    overflowMode: 'wrap',
    selectionStyle: 'highlight',
    selectionMode: 'multiple'
  }
};
