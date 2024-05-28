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
import {Column, Row, Table, TableHeader, Cell, TableBody, useDragAndDrop} from '../src/Table';
import {Content, Heading, IllustratedMessage, Illustration, Link} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useState} from 'react';
import {SortDescriptor} from 'react-aria-components';
import {useListData} from '@react-stately/data';

const meta: Meta<typeof Table> = {
  component: Table,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onResize: {
      table: {
        disable: true
      }
    },
    onResizeStart: {
      table: {
        disable: true
      }
    },
    onResizeEnd: {
      table: {
        disable: true
      }
    }
  }
};

export default meta;

const StaticTable = (args: any) => (
  <Table aria-label="Files" {...args}>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
      <Column>Date Modified</Column>
    </TableHeader>
    <TableBody>
      <Row id="1">
        <Cell>Games</Cell>
        <Cell>File folder</Cell>
        <Cell>6/7/2020</Cell>
      </Row>
      <Row id="2">
        <Cell>Program Files</Cell>
        <Cell>File folder</Cell>
        <Cell>4/7/2021</Cell>
      </Row>
      <Row id="3">
        <Cell>bootmgr</Cell>
        <Cell>System file</Cell>
        <Cell>11/20/2010</Cell>
      </Row>
    </TableBody>
  </Table>
);

let columns = [
  {name: 'Foo', id: 'foo', isRowHeader: true},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz'}
];

let items = [
  {id: 1, foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1'},
  {id: 2, foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2'},
  {id: 3, foo: 'Foo 3', bar: 'Bar 3', baz: 'Baz 3'},
  {id: 4, foo: 'Foo 4', bar: 'Bar 4', baz: 'Baz 4'},
  {id: 5, foo: 'Foo 5', bar: 'Bar 5', baz: 'Baz 5'},
  {id: 6, foo: 'Foo 6', bar: 'Bar 6', baz: 'Baz 6'},
  {id: 7, foo: 'Foo 7', bar: 'Bar 7', baz: 'Baz 7'},
  {id: 8, foo: 'Foo 8', bar: 'Bar 8', baz: 'Baz 8'},
  {id: 9, foo: 'Foo 9', bar: 'Bar 9', baz: 'Baz 9'},
  {id: 10, foo: 'Foo 10', bar: 'Bar 10', baz: 'Baz 10'}
];

const DynamicTable = (args: any) => (
  <Table aria-label="Dynamic table" {...args}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={columns}>
          {(column) => {
            // @ts-ignore figure out later
            return <Cell>{item[column.id]}</Cell>;
          }}
        </Row>
      )}
    </TableBody>
  </Table>
);

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <Illustration>
        <svg width="150" height="103" viewBox="0 0 150 103">
          <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
        </svg>
      </Illustration>
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link onPress={action('linkPress')}>here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

const EmptyStateTable = (args: any) => (
  <Table aria-label="Empty state" {...args} styles={style({height: '[400px]', width: '[400px]'})}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={[]} renderEmptyState={renderEmptyState}>
      {[]}
    </TableBody>
  </Table>
);


let sortcolumns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight'}
];

let sortitems = [
  {id: 1, name: 'A', height: '1', weight: '3'},
  {id: 2, name: 'B', height: '2', weight: '1'},
  {id: 3, name: 'C', height: '3', weight: '4'},
  {id: 4, name: 'D', height: '4', weight: '2'}
];

const SortableTable = (args: any) => {
  let [items, setItems] = useState(sortitems);
  let [sortDescriptor, setSortDescriptor] = useState({});
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
      // @ts-ignore todo double check later
      let cmp = a[column] < b[column] ? -1 : 1;
      if (direction === 'descending') {
        cmp *= -1;
      }
      return cmp;
    });

    setItems(sorted);
    setSortDescriptor(sortDescriptor);
  };

  return (
    <Table aria-label="sortable table" {...args} sortDescriptor={sortDescriptor} onSortChange={onSortChange}>
      <TableHeader columns={sortcolumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader} allowsSorting>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={sortcolumns}>
            {(column) => {
              // @ts-ignore figure out later
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

const ReorderableTable = (args: any) => {
  let list = useListData({
    initialItems: items
  });


  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => ({
      'text/plain': list.getItem(key).foo
    })),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <Table aria-label="reorderable table" {...args} dragAndDropHooks={dragAndDropHooks}>
      <TableHeader columns={sortcolumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              // @ts-ignore figure out later
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

let sortResizeColumns = [
  {name: 'Name', id: 'name', isRowHeader: true, isResizable: true},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight', isResizable: true}
];

const SortableResizableTable = (args: any) => {
  let [items, setItems] = useState(sortitems);
  let [sortDescriptor, setSortDescriptor] = useState({});
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
      // @ts-ignore todo double check later
      let cmp = a[column] < b[column] ? -1 : 1;
      if (direction === 'descending') {
        cmp *= -1;
      }
      return cmp;
    });

    setItems(sorted);
    setSortDescriptor(sortDescriptor);
  };

  return (
    <Table aria-label="sortable table" {...args} sortDescriptor={sortDescriptor} onSortChange={onSortChange}>
      <TableHeader columns={sortResizeColumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader} allowsSorting isResizable={column.isResizable}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={sortcolumns}>
            {(column) => {
              // @ts-ignore figure out later
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </Table>
  );
};

export const Example = {
  render: StaticTable,
  args: {
    onRowAction: null,
    onCellAction: null,
    selectionMode: 'multiple',
    onResize: null,
    onResizeStart: null,
    onResizeEnd: null,
    dragAndDropHooks: null
  }
};

export const DisabledRows = {
  ...Example,
  args: {
    ...Example.args,
    disabledKeys: ['2']
  }
};

export const Dynamic = {
  render: DynamicTable,
  args: {
    ...Example.args,
    disabledKeys: ['Foo 5']
  }
};

export const EmptyState = {
  render: EmptyStateTable
};

// TODO: As it is right now, a empty table that is in a loading state will render the empty state always.
// The user need to manually swap out what they provide to renderEmptyState, alternating between the ProgressCircle and the empty state svg (maybe that is fine)
// Do we need an api for the user to provide renderLoading state?
export const LoadingStateNoItems = {
  render: EmptyStateTable,
  args: {
    ...Example.args,
    isLoading: true
  },
  name: 'loading state, no items'
};

// TODO: similar to above, do we need to provide the user with a way to pass in what they'd want their
// load more spinner to look like? We need to be able to wrap it in a row and append it to the end of their items
export const LoadingStateWithItems = {
  render: DynamicTable,
  args: {
    ...Example.args,
    isLoading: true
  },
  name: 'loading state, has items'
};

export const Sorting = {
  ...Example,
  render: SortableTable,
  name: 'sortable'
};

export const ReorderDnD = {
  ...Example,
  render: ReorderableTable,
  name: 'reorderable table'
};

export const ResizingTable = {
  render: SortableResizableTable,
  args: {
    onResize: action('resize')
    // TODO: add rest of resize stuff
  }
};

// TODO make controlled resizing story without sorting

// TODO: stories to add
// show divider
// overflow: wrap

// TODO: The below I will work on perhaps after virtualization is done
// Height/Width can kinda be done via "display: block" on the tbody and theader elements + overflow
// but the alignment becomes a bit scuffed. Alternatively, we could wrap the table in a div with overflow
// (much like is done for RAC resizing) but this maybe moot when virtualiztion happens
// many items
// resizing
