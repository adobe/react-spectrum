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
import {
  ActionButton,
  Cell,
  Column,
  ColumnProps,
  Content,
  EditableCell,
  Heading,
  IllustratedMessage,
  Link,
  MenuItem,
  MenuSection,
  Picker,
  PickerItem,
  Row,
  StatusLight,
  TableBody,
  TableHeader,
  TableView,
  TableViewProps,
  Text,
  TextField
} from '../src';
import {categorizeArgTypes, getActionArgs} from './utils';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import Filter from '../s2wf-icons/S2_Icon_Filter_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import {Key} from '@react-types/shared';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useCallback, useEffect, useRef, useState} from 'react';
import {SortDescriptor} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useAsyncList, useListData} from '@react-stately/data';
import {useEffectEvent} from '@react-aria/utils';
import User from '../s2wf-icons/S2_Icon_User_20_N.svg';

let onActionFunc = action('onAction');
let noOnAction = null;
const onActionOptions = {onActionFunc, noOnAction};

const events = ['onResizeStart', 'onResize', 'onResizeEnd', 'onSelectionChange', 'onSortChange'];

const meta: Meta<typeof TableView> = {
  component: TableView,
  parameters: {
    layout: 'centered',
    controls: {exclude: ['onResize']}
  },
  tags: ['autodocs'],
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', ['onAction', 'onLoadMore', 'onResizeStart', 'onResize', 'onResizeEnd', 'onSelectionChange', 'onSortChange']),
    children: {table: {disable: true}},
    onAction: {
      options: Object.keys(onActionOptions), // An array of serializable values
      mapping: onActionOptions, // Maps serializable option values to complex arg values
      control: {
        type: 'select', // Type 'select' is automatically inferred when 'options' is defined
        labels: {
          // 'labels' maps option values to string labels
          onActionFunc: 'onAction enabled',
          noOnAction: 'onAction disabled'
        }
      },
      table: {category: 'Events'}
    }
  }
};

export default meta;

const StaticTable = (args: any) => (
  <TableView aria-label="Files" {...args} styles={style({width: 320, height: 320})}>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
      <Column>Date Modified</Column>
      <Column>Size</Column>
      <Column>B</Column>
    </TableHeader>
    <TableBody>
      <Row id="1">
        <Cell>Games</Cell>
        <Cell>File folder</Cell>
        <Cell>6/7/2020</Cell>
        <Cell>74 GB</Cell>
        <Cell>Long long long long long long long cell</Cell>
      </Row>
      <Row id="2">
        <Cell>Program Files</Cell>
        <Cell>File folder</Cell>
        <Cell>4/7/2021</Cell>
        <Cell>1.2 GB</Cell>
        <Cell>Long long long long long long long cell</Cell>
      </Row>
      <Row id="3">
        <Cell>bootmgr</Cell>
        <Cell>System file</Cell>
        <Cell>11/20/2010</Cell>
        <Cell>0.2 GB</Cell>
        <Cell>Long long long long long long long cell</Cell>
      </Row>
    </TableBody>
  </TableView>
);

export const Example: StoryObj<typeof StaticTable> = {
  render: StaticTable,
  args: {
    selectionMode: 'multiple',
    onResize: undefined,
    onResizeStart: undefined,
    onResizeEnd: undefined,
    onLoadMore: undefined
  }
};

export const DisabledRows: StoryObj<typeof StaticTable> = {
  ...Example,
  args: {
    ...Example.args,
    disabledKeys: ['2']
  }
};

let columns = [
  {name: 'Foo', id: 'foo', isRowHeader: true},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz'},
  {name: 'Yah', id: 'yah'}
];

let items = [
  {id: 1, foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1', yah: 'Yah long long long 1'},
  {id: 2, foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2', yah: 'Yah long long long 2'},
  {id: 3, foo: 'Foo 3', bar: 'Bar 3', baz: 'Baz 3', yah: 'Yah long long long 3'},
  {id: 4, foo: 'Foo 4', bar: 'Bar 4', baz: 'Baz 4', yah: 'Yah long long long 4'},
  {id: 5, foo: 'Foo 5', bar: 'Bar 5', baz: 'Baz 5', yah: 'Yah long long long 5'},
  {id: 6, foo: 'Foo 6', bar: 'Bar 6', baz: 'Baz 6', yah: 'Yah long long long 6'},
  {id: 7, foo: 'Foo 7', bar: 'Bar 7', baz: 'Baz 7', yah: 'Yah long long long 7'},
  {id: 8, foo: 'Foo 8', bar: 'Bar 8', baz: 'Baz 8', yah: 'Yah long long long 8'},
  {id: 9, foo: 'Foo 9', bar: 'Bar 9', baz: 'Baz 9', yah: 'Yah long long long 9'},
  {id: 10, foo: 'Foo 10', bar: 'Bar 10', baz: 'Baz 10', yah: 'Yah long long long 10'}
];

const DynamicTable = (args: TableViewProps): ReactElement => (
  <TableView aria-label="Dynamic table" {...args} styles={style({width: 320, height: 208})}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column width={150} minWidth={150} isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={columns}>
          {(column) => {
            return <Cell>{item[column.id]}</Cell>;
          }}
        </Row>
      )}
    </TableBody>
  </TableView>
);

export const DynamicColumns: StoryObj<typeof DynamicTable> = {
  render: function DynamicColumnsExample(args) {
    let [cols, setColumns] = useState(columns);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <ActionButton onPress={() => setColumns((prev) => prev.length > 3 ? [columns[0]].concat(columns.slice(2, 4)) : columns)}>Toggle columns</ActionButton>
        <TableView aria-label="Dynamic table" {...args} styles={style({width: 320, height: 208})}>
          <TableHeader columns={cols}>
            {(column) => (
              <Column width={150} minWidth={150} isRowHeader={column.isRowHeader}>{column.name}</Column>
            )}
          </TableHeader>
          <TableBody items={items} dependencies={[cols]}>
            {item => (
              <Row id={item.id} columns={cols}>
                {(col) => {
                  return <Cell>{item[col.id]}</Cell>;
                }}
              </Row>
            )}
          </TableBody>
        </TableView>
      </div>
    );
  },
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};

const DynamicTableWithCustomMenus = (args: TableViewProps): ReactElement => (
  <TableView aria-label="Dynamic table" {...args} styles={style({width: 320, height: 208})}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column
          width={150}
          minWidth={150}
          isRowHeader={column.isRowHeader}
          menuItems={
            <>
              <MenuSection>
                <MenuItem onAction={action('filter')}><Filter /><Text slot="label">Filter</Text></MenuItem>
              </MenuSection>
              <MenuSection>
                <MenuItem onAction={action('hide column')}><Text slot="label">Hide column</Text></MenuItem>
                <MenuItem onAction={action('manage columns')}><Text slot="label">Manage columns</Text></MenuItem>
              </MenuSection>
            </>
          }>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={columns}>
          {(column) => {
            return <Cell>{item[column.id]}</Cell>;
          }}
        </Row>
      )}
    </TableBody>
  </TableView>
);

let sortItems = items;
const DynamicSortableTableWithCustomMenus = (args: TableViewProps): ReactElement => {
  let [items, setItems] = useState(sortItems);
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(undefined);
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
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
    <TableView aria-label="Dynamic table" {...args} sortDescriptor={sortDescriptor} onSortChange={onSortChange} styles={style({width: 320, height: 208})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column
            allowsSorting
            width={150}
            minWidth={150}
            isRowHeader={column.isRowHeader}
            menuItems={
              <>
                <MenuSection>
                  <MenuItem onAction={action('filter')}><Filter /><Text slot="label">Filter</Text></MenuItem>
                </MenuSection>
                <MenuSection>
                  <MenuItem onAction={action('hide column')}><Text slot="label">Hide column</Text></MenuItem>
                  <MenuItem onAction={action('manage columns')}><Text slot="label">Manage columns</Text></MenuItem>
                </MenuSection>
              </>
            }>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const Dynamic: StoryObj<typeof DynamicTable> = {
  render: DynamicTable,
  args: {
    ...Example.args,
    disabledKeys: ['Foo 5']
  }
};

export const DynamicCustomMenus: StoryObj<typeof DynamicTableWithCustomMenus> = {
  render: DynamicTableWithCustomMenus,
  args: {
    ...Example.args,
    disabledKeys: ['Foo 5']
  }
};

export const DynamicSortableCustomMenus: StoryObj<typeof DynamicSortableTableWithCustomMenus> = {
  render: DynamicSortableTableWithCustomMenus,
  args: {
    ...Example.args,
    disabledKeys: ['Foo 5']
  }
};

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link href="https://adobe.com" onPress={action('linkPress')}>here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

const EmptyStateTable = (args: TableViewProps): ReactElement => (
  <TableView aria-label="Empty state" {...args} styles={style({height: 320, width: 320})}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column minWidth={200} width={200} isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={[]} renderEmptyState={renderEmptyState}>
      {[]}
    </TableBody>
  </TableView>
);

export const EmptyState: StoryObj<typeof EmptyStateTable> = {
  render: EmptyStateTable,
  args: {
    ...Example.args
  }
};

export const LoadingStateNoItems: StoryObj<typeof EmptyStateTable> = {
  render: EmptyStateTable,
  args: {
    ...Example.args,
    loadingState: 'loading'
  },
  name: 'loading state, no items',
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const LoadingStateWithItems: StoryObj<typeof DynamicTable> = {
  render: DynamicTable,
  args: {
    ...Example.args,
    loadingState: 'loadingMore'
  },
  name: 'loading state, has items',
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const LoadingStateWithItemsStatic: StoryObj<typeof StaticTable> = {
  render: StaticTable,
  args: {
    ...Example.args,
    loadingState: 'loadingMore'
  },
  name: 'loading state, static items',
  parameters: {
    docs: {
      disable: true
    }
  }
};

let dividerColumns = [
  {name: 'Foo', id: 'foo', isRowHeader: true, showDivider: true},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz', showDivider: true},
  {name: 'Yah', id: 'yah'}
];

const ShowDividers = (args: TableViewProps): ReactElement => {
  return (
    <TableView aria-label="Show Dividers table" {...args} styles={style({width: 320, height: 208})}>
      <TableHeader columns={dividerColumns}>
        {(column) => (
          <Column width={150} minWidth={150} isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={dividerColumns}>
            {(column) => {
              return <Cell showDivider={column.showDivider}>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const ShowDividersStory: StoryObj<typeof ShowDividers> = {
  render: ShowDividers,
  args: {
    ...Example.args
  },
  name: 'show dividers'
};

let alignColumns = [
  {name: 'Foo', id: 'foo', isRowHeader: true},
  {name: 'Bar', id: 'bar', align: 'center'},
  {name: 'Baz', id: 'baz', align: 'end'},
  {name: 'Yah', id: 'yah', align: 'end'}
];

const TextAlign = (args: TableViewProps): ReactElement => {
  let [items, setItems] = useState(sortItems);
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(undefined);
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
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
    <TableView aria-label="Show Dividers table" {...args} sortDescriptor={sortDescriptor} onSortChange={onSortChange} styles={style({width: 320, height: 208})}>
      <TableHeader columns={alignColumns}>
        {(column) => (
          <Column allowsSorting width={150} minWidth={150} isRowHeader={column.isRowHeader} align={column?.align as 'start' | 'center' | 'end'}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={alignColumns}>
            {(column) => {
              return <Cell showDivider align={column?.align as 'start' | 'center' | 'end'}>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const TextAlignStory: StoryObj<typeof TextAlign> = {
  render: TextAlign,
  args: {
    ...Example.args
  },
  name: 'text align'
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const OnLoadMoreTable = (args: TableViewProps & {delay: number}): ReactElement => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <TableView {...args} aria-label="Load more table" loadingState={list.loadingState} onLoadMore={list.loadMore} styles={style({width: 320, height: 320})}>
      <TableHeader>
        <Column id="name" isRowHeader>Name</Column>
        <Column id="height">Height</Column>
        <Column id="mass">Mass</Column>
        <Column id="birth_year">Birth Year</Column>
      </TableHeader>
      <TableBody
        items={list.items}>
        {(item) => (
          <Row id={item.name}>
            <Cell>{item.name}</Cell>
            <Cell>{item.height}</Cell>
            <Cell>{item.mass}</Cell>
            <Cell>{item.birth_year}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const OnLoadMoreTableStory: StoryObj<typeof OnLoadMoreTable> = {
  render: OnLoadMoreTable,
  args: {
    ...Example.args,
    delay: 50
  },
  name: 'async loading table'
};

let sortcolumns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight'}
];

let sortitems = [
  {id: 1, name: 'A', height: '1', weight: '3'},
  {id: 2, name: 'B', height: '2', weight: '1'},
  {id: 3, name: 'C', height: '3', weight: '4'},
  {id: 4, name: 'D', height: '4', weight: '2'},
  {id: 5, name: 'E', height: '5', weight: '3'},
  {id: 6, name: 'F', height: '6', weight: '1'},
  {id: 7, name: 'G', height: '7', weight: '4'},
  {id: 8, name: 'H', height: '8', weight: '2'},
  {id: 9, name: 'I', height: '9', weight: '3'},
  {id: 10, name: 'J', height: '10', weight: '1'},
  {id: 11, name: 'K', height: '11', weight: '4'},
  {id: 12, name: 'L', height: '12', weight: '2'},
  {id: 13, name: 'M', height: '13', weight: '3'},
  {id: 14, name: 'N', height: '14', weight: '1'},
  {id: 15, name: 'O', height: '15', weight: '4'},
  {id: 16, name: 'P', height: '16', weight: '2'},
  {id: 17, name: 'Q', height: '17', weight: '3'},
  {id: 18, name: 'R', height: '18', weight: '1'},
  {id: 19, name: 'S', height: '19', weight: '4'},
  {id: 20, name: 'T', height: '20', weight: '2'}
];

const SortableTable = (args: TableViewProps): ReactElement => {
  let [items, setItems] = useState(sortitems);
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(undefined);
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
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
    <TableView aria-label="sortable table" {...args} sortDescriptor={sortDescriptor} onSortChange={onSortChange} styles={style({height: 320})}>
      <TableHeader columns={sortcolumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader} allowsSorting>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={sortcolumns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const Sorting: StoryObj<typeof SortableTable> = {
  ...Example,
  render: SortableTable,
  name: 'sortable'
};

type ResizeColumn = Array<{
  name: string,
  id: string,
  isRowHeader?: boolean,
  allowsResizing?: boolean,
  showDivider: boolean,
  align: 'start' | 'center' | 'end',
  allowsSorting?: boolean
}>;

let resizeColumn = [
  {name: 'Name', id: 'name', isRowHeader: true, allowsResizing: true, showDivider: true, align: 'end'},
  {name: 'Height', id: 'height', align: 'center'},
  {name: 'Weight', id: 'weight', allowsResizing: true, align: 'center'}
] as ResizeColumn;

let sortResizeColumns = [
  {name: 'Name', id: 'name', isRowHeader: true, allowsResizing: true, showDivider: true, allowsSorting: true},
  {name: 'Height', id: 'height', allowsSorting: true},
  {name: 'Weight', id: 'weight', allowsResizing: true, allowsSorting: true}
] as ResizeColumn;

const SortableResizableTable = (args: TableViewProps & {isSortable: boolean, columns: ResizeColumn}): ReactElement => {
  let {isSortable} = args;
  let [items, setItems] = useState(sortitems);
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(undefined);
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
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
    <TableView aria-label="sortable table" {...args} sortDescriptor={isSortable ? sortDescriptor : undefined} onSortChange={isSortable ? onSortChange : undefined} styles={style({width: 384, height: 320})}>
      <TableHeader columns={args.columns}>
        {(column: any) => (
          <Column {...column}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={args.columns}>
            {(column: any) => {
              return <Cell showDivider={column.showDivider} align={column.align}>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};

export const ResizingTable: StoryObj<typeof SortableResizableTable> = {
  render: SortableResizableTable,
  args: {
    onResizeStart: action('onResizeStart'),
    onResizeEnd: action('onResizeEnd'),
    columns: resizeColumn,
    isSortable: false
  },
  name: 'resizing only table'
};

export const ResizingSortableTable: StoryObj<typeof SortableResizableTable> = {
  render: SortableResizableTable,
  args: {
    onResizeStart: action('onResizeStart'),
    onResizeEnd: action('onResizeEnd'),
    columns: sortResizeColumns,
    isSortable: true
  },
  name: 'resizing and sortable table'
};

function AsyncLoadingExample(props: TableViewProps): ReactElement {
  interface Item {
    data: {
      id: string,
      url: string,
      title: string
    }
  }

  let columns = [
    {name: 'Score', id: 'score', defaultWidth: 100, allowsResizing: true, allowsSorting: true},
    {name: 'Title', id: 'title', allowsResizing: true, allowsSorting: true, isRowHeader: true},
    {name: 'Author', id: 'author', defaultWidth: 200, allowsResizing: true, allowsSorting: true},
    {name: 'Comments', id: 'num_comments', defaultWidth: 100, allowsResizing: true, allowsSorting: true}
  ];

  let list = useAsyncList<Item>({
    getKey: (item) => item.data.id,
    async load({signal, cursor}) {
      let url = new URL('https://www.reddit.com/r/upliftingnews.json');
      if (cursor) {
        url.searchParams.append('after', cursor);
      }
      let res = await fetch(url.toString(), {signal});
      let json = await res.json();
      return {items: json.data.children, cursor: json.data.after};
    },
    sort({items, sortDescriptor}) {
      return {
        items: items.length > 0 ? items.slice().sort((a, b) => {
          if (sortDescriptor.column != null) {
            let cmp = a.data[sortDescriptor.column] < b.data[sortDescriptor.column] ? -1 : 1;
            if (sortDescriptor.direction === 'descending') {
              cmp *= -1;
            }
            return cmp;
          } else {
            return 1;
          }
        }) : []
      };
    }
  });

  return (
    <div>
      <ActionButton styles={style({marginBottom: 8})} onPress={() => list.remove(list.items[0].data.id)}>Remove first item</ActionButton>
      <TableView {...props} aria-label="Reddit table" sortDescriptor={list.sortDescriptor} onSortChange={list.sort} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys} loadingState={list.loadingState} onLoadMore={list.loadMore} styles={style({width: 1000, height: 400})}>
        <TableHeader columns={columns}>
          {(column) => (
            <Column {...column}>
              {column.name}
            </Column>
          )}
        </TableHeader>
        <TableBody items={list.items}>
          {item =>
            (<Row id={item.data.id} columns={columns}>
              {(column) => {
                return column.id === 'title'
                  ? <Cell textValue={item.data.title}><Link href={item.data.url} target="_blank" isQuiet>{item.data.title}</Link></Cell>
                  : <Cell>{item.data[column.id]}</Cell>;
              }}
            </Row>)
          }
        </TableBody>
      </TableView>
    </div>
  );
}

export const ResizingUncontrolledSortableColumns: StoryObj<typeof AsyncLoadingExample> = {
  render: (args) => <AsyncLoadingExample {...args} />,
  args: {
    ...Example.args,
    onResizeStart: action('onResizeStart'),
    onResizeEnd: action('onResizeEnd')
  },
  name: 'resizable, sortable, reddit example',
  parameters: {
    docs: {
      disable: true
    }
  }
};

let manyColumns = [] as {name: string, id: string}[];
for (let i = 0; i < 100; i++) {
  manyColumns.push({name: 'Column ' + i, id: 'C' + i});
}

let manyRows = [] as {id: string}[];
for (let i = 0; i < 1000; i++) {
  let row = {id: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = `${i}, ${j}`;
  }

  manyRows.push(row);
}

export const ManyItems: StoryObj<typeof TableView> = {
  render: (args) => (
    <TableView aria-label="Many items table" {...args} styles={style({width: 800, height: 400})}>
      <TableHeader columns={manyColumns}>
        {(column) => (
          <Column width={100} minWidth={100} isRowHeader={column.name === 'Column 1'}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={manyRows}>
        {item => (
          <Row id={item.id} columns={manyColumns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  ),
  args: {
    ...Example.args
  },
  name: 'many items table',
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const FlexHeight: StoryObj<typeof TableView> = {
  render: (args) => (
    <div className={style({display: 'flex', width: 400, height: 400, alignItems: 'stretch', flexDirection: 'column'})}>
      <div className={style({backgroundColor: 'blue-200'})}>Flex child 1</div>
      <TableView aria-label="Many items table" {...args}>
        <TableHeader columns={manyColumns}>
          {(column) => (
            <Column width={100} minWidth={100} isRowHeader={column.name === 'Column 1'}>{column.name}</Column>
          )}
        </TableHeader>
        <TableBody items={manyRows}>
          {item => (
            <Row id={item.id} columns={manyColumns}>
              {(column) => {
                return <Cell>{item[column.id]}</Cell>;
              }}
            </Row>
          )}
        </TableBody>
      </TableView>
      <div className={style({backgroundColor: 'blue-200'})}>Flex child 2</div>
    </div>
  ),
  args: {
    ...Example.args
  },
  parameters: {
    docs: {
      disable: true
    }
  },
  name: 'flex calculated height, flex direction column'
};


export const FlexWidth: StoryObj<typeof TableView> = {
  render: (args) => (
    <div className={style({display: 'flex', width: 400, height: 400, alignItems: 'stretch'})}>
      <div className={style({backgroundColor: 'blue-200'})}>Flex child 1</div>
      <TableView aria-label="Many items table" {...args}>
        <TableHeader columns={manyColumns}>
          {(column) => (
            <Column width={100} minWidth={100} isRowHeader={column.name === 'Column 1'}>{column.name}</Column>
          )}
        </TableHeader>
        <TableBody items={manyRows}>
          {item => (
            <Row id={item.id} columns={manyColumns}>
              {(column) => {
                return <Cell>{item[column.id]}</Cell>;
              }}
            </Row>
          )}
        </TableBody>
      </TableView>
      <div className={style({backgroundColor: 'blue-200'})}>Flex child 2</div>
    </div>
  ),
  args: {
    ...Example.args
  },
  parameters: {
    docs: {
      disable: true
    }
  },
  name: 'flex calculated height, flex direction row'
};


function ColSpanExample(args: TableViewProps): ReactElement {
  let [hide, setHide] = useState(false);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <ActionButton onPress={() => setHide(!hide)}>{hide ? 'Show' : 'Hide'}</ActionButton>
      <TableView aria-label="Files" {...args} styles={style({width: 320, height: 320})}>
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          {!hide && <Column>Date Modified</Column>}
          <Column>Size</Column>
        </TableHeader>
        <TableBody>
          <Row id="1">
            <Cell>Games</Cell>
            <Cell>File folder</Cell>
            {!hide && <Cell>6/7/2020</Cell>}
            <Cell>74 GB</Cell>
          </Row>
          <Row id="2">
            <Cell>Program Files</Cell>
            <Cell>File folder</Cell>
            {!hide && <Cell>4/7/2021</Cell>}
            <Cell>1.2 GB</Cell>
          </Row>
          <Row id="3">
            <Cell>bootmgr</Cell>
            <Cell>System file</Cell>
            {!hide && <Cell>11/20/2010</Cell>}
            <Cell>0.2 GB</Cell>
          </Row>
          <Row id="4">
            <Cell colSpan={hide ? 3 : 4}>Total size: 75.4 GB</Cell>
          </Row>
        </TableBody>
      </TableView>
    </div>
  );
}


export const ColSpan: StoryObj<typeof ColSpanExample> = {
  render: (args) => (
    <ColSpanExample {...args} />
  ),
  parameters: {
    docs: {
      disable: true
    }
  },
  argTypes: {
    selectionMode: {
      control: false
    }
  }
};

Example.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
<TableView aria-label="Files" styles={style({width: 320, height: 320})}>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
    <Column>Size</Column>
    <Column>B</Column>
  </TableHeader>
  <TableBody>
    <Row id="1">
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
      <Cell>74 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
    <Row id="2">
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
      <Cell>1.2 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
    <Row id="3">
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
      <Cell>0.2 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
  </TableBody>
</TableView>
        `;
      }
    }
  }
};

DisabledRows.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
<TableView aria-label="Files" styles={style({width: 320, height: 320})} disabledKeys={['2']}>
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Type</Column>
    <Column>Date Modified</Column>
    <Column>Size</Column>
    <Column>B</Column>
  </TableHeader>
  <TableBody>
    <Row id="1">
      <Cell>Games</Cell>
      <Cell>File folder</Cell>
      <Cell>6/7/2020</Cell>
      <Cell>74 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
    <Row id="2">
      <Cell>Program Files</Cell>
      <Cell>File folder</Cell>
      <Cell>4/7/2021</Cell>
      <Cell>1.2 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
    <Row id="3">
      <Cell>bootmgr</Cell>
      <Cell>System file</Cell>
      <Cell>11/20/2010</Cell>
      <Cell>0.2 GB</Cell>
      <Cell>Long long long long long long long cell</Cell>
    </Row>
  </TableBody>
</TableView>
        `;
      }
    }
  }
};

Dynamic.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let columns = [
  {name: 'Foo', id: 'foo', isRowHeader: true},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz'},
  {name: 'Yah', id: 'yah'}
];

let items = [
  {id: 1, foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1', yah: 'Yah long long long 1'},
  {id: 2, foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2', yah: 'Yah long long long 2'},
  {id: 3, foo: 'Foo 3', bar: 'Bar 3', baz: 'Baz 3', yah: 'Yah long long long 3'},
  {id: 4, foo: 'Foo 4', bar: 'Bar 4', baz: 'Baz 4', yah: 'Yah long long long 4'},
  {id: 5, foo: 'Foo 5', bar: 'Bar 5', baz: 'Baz 5', yah: 'Yah long long long 5'},
  {id: 6, foo: 'Foo 6', bar: 'Bar 6', baz: 'Baz 6', yah: 'Yah long long long 6'},
  {id: 7, foo: 'Foo 7', bar: 'Bar 7', baz: 'Baz 7', yah: 'Yah long long long 7'},
  {id: 8, foo: 'Foo 8', bar: 'Bar 8', baz: 'Baz 8', yah: 'Yah long long long 8'},
  {id: 9, foo: 'Foo 9', bar: 'Bar 9', baz: 'Baz 9', yah: 'Yah long long long 9'},
  {id: 10, foo: 'Foo 10', bar: 'Bar 10', baz: 'Baz 10', yah: 'Yah long long long 10'}
];

const DynamicTable = () => {
  return (
    <TableView aria-label="Dynamic table" styles={style({width: 320, height: 208})}>
      <TableHeader columns={columns}>
        {(column) => (
          <Column width={150} minWidth={150} isRowHeader={column.isRowHeader}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={columns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
        `;
      }
    }
  }
};

DynamicCustomMenus.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
<TableView aria-label="Dynamic table" styles={style({width: 320, height: 208})}>
  <TableHeader columns={columns}>
  {(column) => (
    <Column
      width={150}
      minWidth={150}
      isRowHeader={column.isRowHeader}
      menuItems={
        <>
          <MenuSection>
            <MenuItem onAction={action('filter')}><Filter /><Text slot="label">Filter</Text></MenuItem>
          </MenuSection>
          <MenuSection>
            <MenuItem onAction={action('hide column')}><Text slot="label">Hide column</Text></MenuItem>
            <MenuItem onAction={action('manage columns')}><Text slot="label">Manage columns</Text></MenuItem>
          </MenuSection>
        </>
      }>{column.name}</Column>
  )}
  </TableHeader>
  <TableBody items={items}>
  {item => (
    <Row id={item.id} columns={columns}>
      {(column) => {
        return <Cell>{item[column.id]}</Cell>;
      }}
    </Row>
  )}
  </TableBody>
</TableView>
      `;
      }
    }
  }
};

EmptyState.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
function renderEmptyState() {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link href="https://adobe.com" onPress={action('linkPress')}>here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

const EmptyState = () => {
  <TableView aria-label="Empty state" styles={style({height: 320, width: 320})}>
    <TableHeader columns={columns}>
      {(column) => (
        <Column minWidth={200} width={200} isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={[]} renderEmptyState={renderEmptyState}>
      {[]}
    </TableBody>
  </TableView>
}`;
      }
    }
  }
};

ShowDividersStory.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let dividerColumns = [
  {name: 'Foo', id: 'foo', isRowHeader: true, showDivider: true},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz', showDivider: true},
  {name: 'Yah', id: 'yah'}
];

const ShowDividers = () => {
  <TableView aria-label="Show Dividers table" styles={style({width: 320, height: 208})}>
    <TableHeader columns={dividerColumns}>
      {(column) => (
        <Column width={150} minWidth={150} isRowHeader={column.isRowHeader}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={dividerColumns}>
          {(column) => {
            return <Cell showDivider={column.showDivider}>{item[column.id]}</Cell>;
          }}
        </Row>
      )}
    </TableBody>
  </TableView>
}`;
      }
    }
  }
};

TextAlignStory.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let alignColumns = [
  {name: 'Foo', id: 'foo', isRowHeader: true},
  {name: 'Bar', id: 'bar', align: 'center'},
  {name: 'Baz', id: 'baz', align: 'end'},
  {name: 'Yah', id: 'yah', align: 'end'}
];

const TableDividers = () => {
  <TableView aria-label="Show Dividers table" styles={style({width: 320, height: 208})}>
    <TableHeader columns={alignColumns}>
      {(column) => (
        <Column width={150} minWidth={150} isRowHeader={column.isRowHeader} align={column?.align as 'start' | 'center' | 'end'}>{column.name}</Column>
      )}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={alignColumns}>
          {(column) => {
            return <Cell showDivider align={column?.align as 'start' | 'center' | 'end'}>{item[column.id]}</Cell>;
          }}
        </Row>
      )}
    </TableBody>
  </TableView>
}
        `;
      }
    }
  }
};

OnLoadMoreTableStory.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const OnLoadMoreTable = () => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        // eslint-disable-next-line no-useless-escape
        cursor = cursor.replace(/^http:///i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <TableView aria-label="Load more table" loadingState={list.loadingState} onLoadMore={list.loadMore} styles={style({width: 320, height: 320})}>
      <TableHeader>
        <Column id="name" isRowHeader>Name</Column>
        <Column id="height">Height</Column>
        <Column id="mass">Mass</Column>
        <Column id="birth_year">Birth Year</Column>
      </TableHeader>
      <TableBody
        items={list.items}>
        {(item) => (
          <Row id={item.name}>
            <Cell>{item.name}</Cell>
            <Cell>{item.height}</Cell>
            <Cell>{item.mass}</Cell>
            <Cell>{item.birth_year}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};
      `;
      }
    }
  }
};

Sorting.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let sortcolumns = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight'}
];

let sortitems = [
  {id: 1, name: 'A', height: '1', weight: '3'},
  {id: 2, name: 'B', height: '2', weight: '1'},
  {id: 3, name: 'C', height: '3', weight: '4'},
  {id: 4, name: 'D', height: '4', weight: '2'},
  {id: 5, name: 'E', height: '5', weight: '3'},
  {id: 6, name: 'F', height: '6', weight: '1'},
  {id: 7, name: 'G', height: '7', weight: '4'},
  {id: 8, name: 'H', height: '8', weight: '2'},
  {id: 9, name: 'I', height: '9', weight: '3'},
  {id: 10, name: 'J', height: '10', weight: '1'},
  {id: 11, name: 'K', height: '11', weight: '4'},
  {id: 12, name: 'L', height: '12', weight: '2'},
  {id: 13, name: 'M', height: '13', weight: '3'},
  {id: 14, name: 'N', height: '14', weight: '1'},
  {id: 15, name: 'O', height: '15', weight: '4'},
  {id: 16, name: 'P', height: '16', weight: '2'},
  {id: 17, name: 'Q', height: '17', weight: '3'},
  {id: 18, name: 'R', height: '18', weight: '1'},
  {id: 19, name: 'S', height: '19', weight: '4'},
  {id: 20, name: 'T', height: '20', weight: '2'}
];

const SortableTable = (args: any) => {
  let [items, setItems] = useState(sortitems);
  let [sortDescriptor, setSortDescriptor] = useState({});
  let onSortChange = (sortDescriptor: SortDescriptor) => {
    let {direction = 'ascending', column = 'name'} = sortDescriptor;

    let sorted = items.slice().sort((a, b) => {
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
    <TableView aria-label="sortable table" sortDescriptor={sortDescriptor} onSortChange={onSortChange} styles={style({height: 320})}>
      <TableHeader columns={sortcolumns}>
        {(column) => (
          <Column isRowHeader={column.isRowHeader} allowsSorting>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={sortcolumns}>
            {(column) => {
              return <Cell>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};
        `;
      }
    }
  }
};

ResizingTable.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let column = [
  {name: 'Name', id: 'name', isRowHeader: true, allowsResizing: true, showDivider: true, align: 'end'},
  {name: 'Height', id: 'height', align: 'center'},
  {name: 'Weight', id: 'weight', allowsResizing: true, align: 'center'}
];

const ResizableTable = () => {
  return (
    <TableView aria-label="resizing table" styles={style({width: 384, height: 320})}>
      <TableHeader columns={args.columns}>
        {(column: any) => (
          <Column {...column}>{column.name}</Column>
        )}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row id={item.id} columns={args.columns}>
            {(column: any) => {
              return <Cell showDivider={column.showDivider} align={column.align}>{item[column.id]}</Cell>;
            }}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
};
        `;
      }
    }
  }
};

let defaultItems = [
  {id: 1,
    fruits: 'Apples', task: 'Collect', status: 'Pending', farmer: 'Eva',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 2,
    fruits: 'Oranges', task: 'Collect', status: 'Pending', farmer: 'Steven',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 3,
    fruits: 'Pears', task: 'Collect', status: 'Pending', farmer: 'Michael',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 4,
    fruits: 'Cherries', task: 'Collect', status: 'Pending', farmer: 'Sara',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 5,
    fruits: 'Dates', task: 'Collect', status: 'Pending', farmer: 'Karina',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 6,
    fruits: 'Bananas', task: 'Collect', status: 'Pending', farmer: 'Otto',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 7,
    fruits: 'Melons', task: 'Collect', status: 'Pending', farmer: 'Matt',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 8,
    fruits: 'Figs', task: 'Collect', status: 'Pending', farmer: 'Emily',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 9,
    fruits: 'Blueberries', task: 'Collect', status: 'Pending', farmer: 'Amelia',
    isSaving: {},
    intermediateValue: {}
  },
  {id: 10,
    fruits: 'Blackberries', task: 'Collect', status: 'Pending', farmer: 'Isla',
    isSaving: {},
    intermediateValue: {}
  }
];

let editableColumns: Array<Omit<ColumnProps, 'children'> & {name: string}> = [
  {name: 'Fruits', id: 'fruits', isRowHeader: true, width: '6fr', minWidth: 300},
  {name: 'Task', id: 'task', width: '2fr', minWidth: 100},
  {name: 'Status', id: 'status', width: '2fr', showDivider: true, minWidth: 100},
  {name: 'Farmer', id: 'farmer', width: '2fr', minWidth: 150}
];

interface EditableTableProps extends TableViewProps {}

export const EditableTable: StoryObj<EditableTableProps> = {
  render: function EditableTable(props) {
    let columns = editableColumns;
    let data = useListData({initialItems: defaultItems});

    let onChange = useCallback((id: Key, columnId: Key, values: any) => {
      let value = values[columnId];
      if (value === null) {
        return;
      }
      data.update(id, (prevItem) => ({...prevItem, [columnId]: value}));
    }, [data]);

    return (
      <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
        <TableView aria-label="Dynamic table" {...props} styles={style({width: 800, maxWidth: 'calc(100vw - 2rem)', height: 208})}>
          <TableHeader columns={columns}>
            {(column) => (
              <Column {...column}>{column.name}</Column>
            )}
          </TableHeader>
          <TableBody items={data.items}>
            {item => (
              <Row id={item.id} columns={columns}>
                {(column) => {
                  if (column.id === 'fruits') {
                    return (
                      <EditableCell
                        aria-label={`Edit ${item[column.id]} in ${column.name}`}
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <TextField
                            name={column.id! as string}
                            aria-label="Fruit name edit field"
                            autoFocus
                            validate={value => value.length > 0 ? null : 'Fruit name is required'}
                            styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                            defaultValue={item[column.id!]} />
                        )}>
                        <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>
                          {item[column.id]}
                          <ActionButton slot="edit" aria-label="Edit fruit">
                            <Edit />
                          </ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'farmer') {
                    return (
                      <EditableCell
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <Picker
                            aria-label="Edit farmer"
                            autoFocus
                            styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                            defaultValue={item[column.id!]}
                            name={column.id! as string}>
                            <PickerItem textValue="Eva" id="Eva"><User /><Text>Eva</Text></PickerItem>
                            <PickerItem textValue="Steven" id="Steven"><User /><Text>Steven</Text></PickerItem>
                            <PickerItem textValue="Michael" id="Michael"><User /><Text>Michael</Text></PickerItem>
                            <PickerItem textValue="Sara" id="Sara"><User /><Text>Sara</Text></PickerItem>
                            <PickerItem textValue="Karina" id="Karina"><User /><Text>Karina</Text></PickerItem>
                            <PickerItem textValue="Otto" id="Otto"><User /><Text>Otto</Text></PickerItem>
                            <PickerItem textValue="Matt" id="Matt"><User /><Text>Matt</Text></PickerItem>
                            <PickerItem textValue="Emily" id="Emily"><User /><Text>Emily</Text></PickerItem>
                            <PickerItem textValue="Amelia" id="Amelia"><User /><Text>Amelia</Text></PickerItem>
                            <PickerItem textValue="Isla" id="Isla"><User /><Text>Isla</Text></PickerItem>
                          </Picker>
                        )}>
                        <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>{item[column.id]}<ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'status') {
                    return (
                      <Cell align={column.align} showDivider={column.showDivider}>
                        <StatusLight variant="informative">{item[column.id]}</StatusLight>
                      </Cell>
                    );
                  }
                  return <Cell align={column.align} showDivider={column.showDivider}>{item[column.id!]}</Cell>;
                }}
              </Row>
            )}
          </TableBody>
        </TableView>
      </div>
    );
  }
};

export const EditableTableWithAsyncSaving: StoryObj<EditableTableProps> = {
  render: function EditableTable(props) {
    let delay = 5000;
    let columns = editableColumns;
    let data = useListData({initialItems: defaultItems});

    let saveItem = useEffectEvent((id: Key, columnId: Key) => {
      let prevItem = data.getItem(id)!;
      data.update(id, {...prevItem, isSaving: {...prevItem.isSaving, [columnId]: false}});
      currentRequests.current.delete(id);
    });
    let currentRequests = useRef<Map<Key, {request: ReturnType<typeof setTimeout>}>>(new Map());
    let onChange = useCallback((id: Key, columnId: Key, values: any) => {
      let value = values[columnId];
      if (value === null) {
        return;
      }
      let alreadySaving = currentRequests.current.get(id);
      if (alreadySaving) {
        // remove and cancel the previous request
        currentRequests.current.delete(id);
        clearTimeout(alreadySaving.request);
      }
      let prevItem = data.getItem(id)!;
      data.update(id, {...prevItem, [columnId]: value, isSaving: {...prevItem.isSaving, [columnId]: true}});
    }, [data]);

    useEffect(() => {
      // if any item is saving and we don't have a request for it, start a timer to commit it
      for (const item of data.items) {
        for (const columnId in item.isSaving) {
          if (item.isSaving[columnId] && !currentRequests.current.has(item.id)) {
            let timeout = setTimeout(() => {
              saveItem(item.id, columnId);
            }, delay);
            currentRequests.current.set(item.id, {request: timeout});
          }
        }
      }
    }, [data, delay]);

    return (
      <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
        <TableView aria-label="Dynamic table" {...props} styles={style({width: 800, height: 208})}>
          <TableHeader columns={columns}>
            {(column) => (
              <Column {...column}>{column.name}</Column>
            )}
          </TableHeader>
          <TableBody items={data.items}>
            {item => (
              <Row id={item.id} columns={columns}>
                {(column) => {
                  if (column.id === 'fruits') {
                    return (
                      <EditableCell
                        aria-label={`Edit ${item[column.id]} in ${column.name}`}
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <TextField
                            aria-label="Edit fruit"
                            autoFocus
                            validate={value => value.length > 0 ? null : 'Fruit name is required'}
                            styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                            defaultValue={item[column.id!]}
                            name={column.id! as string} />
                        )}>
                        <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>{item[column.id]}<ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'farmer') {
                    return (
                      <EditableCell
                        align={column.align}
                        showDivider={column.showDivider}
                        onSubmit={(e) => {
                          e.preventDefault();
                          let formData = new FormData(e.target as HTMLFormElement);
                          let values = Object.fromEntries(formData.entries());
                          onChange(item.id, column.id!, values);
                        }}
                        isSaving={item.isSaving[column.id!]}
                        renderEditing={() => (
                          <Picker
                            aria-label="Edit farmer"
                            autoFocus
                            styles={style({flexGrow: 1, flexShrink: 1, minWidth: 0})}
                            defaultValue={item[column.id!]}
                            name={column.id! as string}>
                            <PickerItem textValue="Eva" id="Eva"><User /><Text>Eva</Text></PickerItem>
                            <PickerItem textValue="Steven" id="Steven"><User /><Text>Steven</Text></PickerItem>
                            <PickerItem textValue="Michael" id="Michael"><User /><Text>Michael</Text></PickerItem>
                            <PickerItem textValue="Sara" id="Sara"><User /><Text>Sara</Text></PickerItem>
                            <PickerItem textValue="Karina" id="Karina"><User /><Text>Karina</Text></PickerItem>
                            <PickerItem textValue="Otto" id="Otto"><User /><Text>Otto</Text></PickerItem>
                            <PickerItem textValue="Matt" id="Matt"><User /><Text>Matt</Text></PickerItem>
                            <PickerItem textValue="Emily" id="Emily"><User /><Text>Emily</Text></PickerItem>
                            <PickerItem textValue="Amelia" id="Amelia"><User /><Text>Amelia</Text></PickerItem>
                            <PickerItem textValue="Isla" id="Isla"><User /><Text>Isla</Text></PickerItem>
                          </Picker>
                        )}>
                        <div className={style({display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between'})}>{item[column.id]}<ActionButton slot="edit" aria-label="Edit fruit"><Edit /></ActionButton></div>
                      </EditableCell>
                    );
                  }
                  if (column.id === 'status') {
                    return (
                      <Cell align={column.align} showDivider={column.showDivider}>
                        <StatusLight variant="informative">{item[column.id]}</StatusLight>
                      </Cell>
                    );
                  }
                  return <Cell align={column.align} showDivider={column.showDivider}>{item[column.id!]}</Cell>;
                }}
              </Row>
            )}
          </TableBody>
        </TableView>
      </div>
    );
  }
};
