/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {ActionButton} from '@react-spectrum/button';
import {Cell, Column, Row, SpectrumTableProps, TableBody, TableHeader, TableView} from '../';
import {chain} from '@react-aria/utils';
import defaultConfig, {columns, EmptyStateTable, TableStory} from './Table.stories';
import {enableTableNestedRows} from '@react-stately/flags';
import {Flex} from '@react-spectrum/layout';
import {Key} from '@react-types/shared';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX, useState} from 'react';

enableTableNestedRows();

export default {
  ...defaultConfig,
  title: 'TableView/Expandable rows',
  excludeStories: [
    'StaticExpandableRowsRender',
    'DynamicExpandableRowsStoryRender',
    'UserSetRowHeaderRender',
    'ManyExpandableRowsStoryRender',
    'EmptyTreeGridStoryRender',
    'LoadingTreeGridStoryRender'
  ]
} as Meta<typeof TableView>;

export const StaticExpandableRowsRender = (args: Omit<SpectrumTableProps<unknown>, 'children'>): JSX.Element => (
  <TableView aria-label="TableView with static expandable rows" width={500} height={200} UNSTABLE_defaultExpandedKeys={['row 1']} UNSTABLE_allowsExpandableRows UNSTABLE_onExpandedChange={action('onExpandedChange')} {...args}>
    <TableHeader>
      <Column key="foo">Foo</Column>
      <Column key="bar">Bar</Column>
      <Column key="baz">Baz</Column>
    </TableHeader>
    <TableBody>
      <Row key="row 1">
        <Cell>Lvl 1 Foo 1</Cell>
        <Cell>Lvl 1 Bar 1</Cell>
        <Cell> Lvl 1 Baz 1</Cell>
        <Row key="child row 1 level 2">
          <Cell>Lvl 2 Foo 1</Cell>
          <Cell>Lvl 2 Bar 1</Cell>
          <Cell>Lvl 2 Baz 1</Cell>
          <Row key="child row 1 level 3">
            <Cell>Lvl 3 Foo 1</Cell>
            <Cell>Lvl 3 Bar 1</Cell>
            <Cell>Lvl 3 Baz 1</Cell>
          </Row>
        </Row>
        <Row key="child row 2 level 2">
          <Cell>Lvl 2 Foo 2</Cell>
          <Cell>Lvl 2 Bar 2</Cell>
          <Cell>Lvl 2 Baz 2</Cell>
        </Row>
      </Row>
    </TableBody>
  </TableView>
);
// Known accessibility issue that will be caught by aXe: https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives#tableview
export const StaticExpandableRows: TableStory = {
  args: {
    'aria-label': 'TableView with static expandable rows',
    width: 500,
    height: 200
  },
  render: (args) => <StaticExpandableRowsRender {...args} />,
  name: 'static with expandable rows'
};

let nestedItems = [
  {foo: 'Lvl 1 Foo 1', bar: 'Lvl 1 Bar 1', baz: 'Lvl 1 Baz 1', childRows: [
    {foo: 'Lvl 2 Foo 1', bar: 'Lvl 2 Bar 1', baz: 'Lvl 2 Baz 1', childRows: [
      {foo: 'Lvl 3 Foo 1', bar: 'Lvl 3 Bar 1', baz: 'Lvl 3 Baz 1'}
    ]},
    {foo: 'Lvl 2 Foo 2', bar: 'Lvl 2 Bar 2', baz: 'Lvl 2 Baz 2'}
  ]}
];

function DynamicExpandableRows(props: Omit<SpectrumTableProps<unknown>, 'children'>) {
  let [expandedKeys, setExpandedKeys] = useState<'all' | Set<Key>>('all');

  return (
    <Flex direction="column">
      <ActionButton onPress={() => setExpandedKeys('all')}>Expand all</ActionButton>
      <ActionButton onPress={() => setExpandedKeys(new Set([]))}>Collapse all</ActionButton>
      <ActionButton onPress={() => setExpandedKeys(new Set(['Lvl 1 Foo 1']))}>Set expanded to Lvl 1 Foo 1</ActionButton>
      <TableView UNSTABLE_expandedKeys={expandedKeys} UNSTABLE_onExpandedChange={chain(setExpandedKeys, action('onExpandedChange'))} UNSTABLE_allowsExpandableRows {...props}>
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={nestedItems}>
          {item =>
            (<Row key={item.foo} UNSTABLE_childItems={item.childRows}>
              {(key) => {
                // Note: The "item" here will reflect the child Row's values from nestedItems
                return <Cell>{item[key]}</Cell>;
              }}
            </Row>)
          }
        </TableBody>
      </TableView>
    </Flex>
  );
}

export const DynamicExpandableRowsStoryRender = (args: Omit<SpectrumTableProps<unknown>, 'children'>): JSX.Element => (
  <DynamicExpandableRows aria-label="TableView with dynamic expandable rows" width={500} height={400} {...args} />
);

export const DynamicExpandableRowsStory: TableStory = {
  args: {
    'aria-label': 'TableView with dynamic expandable rows',
    width: 500,
    height: 400
  },
  render: (args) => <DynamicExpandableRowsStoryRender {...args} />,
  name: 'dynamic with expandable rows'
};

export const UserSetRowHeaderRender = (args: Omit<SpectrumTableProps<unknown>, 'children'>): JSX.Element => (
  <TableView
    UNSTABLE_allowsExpandableRows
    UNSTABLE_onExpandedChange={action('onExpandedChange')}
    aria-label="TableView with expandable rows and multiple row headers"
    width={500}
    height={400}
    {...args}>
    <TableHeader>
      <Column key="foo" allowsResizing>Foo</Column>
      <Column isRowHeader allowsResizing key="bar">Bar</Column>
      <Column isRowHeader key="baz" allowsResizing>Baz</Column>
    </TableHeader>
    <TableBody>
      <Row key="test">
        <Cell>Lvl 1 Foo 1</Cell>
        <Cell>Lvl 1 Bar 1</Cell>
        <Cell>Lvl 1 Baz 1</Cell>
        <Row>
          <Cell>Lvl 2 Foo 1</Cell>
          <Cell>Lvl 2 Bar 1</Cell>
          <Cell>Lvl 2 Baz 1</Cell>
          <Row>
            <Cell>Lvl 3 Foo 1</Cell>
            <Cell>Lvl 3 Bar 1</Cell>
            <Cell>Lvl 3 Baz 1</Cell>
          </Row>
        </Row>
        <Row>
          <Cell>Lvl 2 Foo 2</Cell>
          <Cell>Lvl 2 Bar 2</Cell>
          <Cell>Lvl 2 Baz 2</Cell>
        </Row>
      </Row>
    </TableBody>
  </TableView>
);

export const UserSetRowHeader: TableStory = {
  args: {
    'aria-label': 'TableView with expandable rows and multiple row headers',
    width: 500,
    height: 400
  },
  render: (args) => <UserSetRowHeaderRender {...args} />,
  name: 'multiple user set row headers',
  parameters: {
    description: {
      data: 'Row headers are Bar and Baz column cells, chevron'
    }
  }
};

function generateRow(lvlIndex, lvlLimit, rowIndex) {
  let row = {key: `Row ${rowIndex} Lvl ${lvlIndex}`};
  for (let col of columns) {
    row[col.key] = `Row ${rowIndex}, Lvl ${lvlIndex}, ${col.name}`;
  }

  if (lvlIndex < lvlLimit) {
    row['childRows'] = [generateRow(++lvlIndex, lvlLimit, rowIndex)];
  }
  return row;
}

function generateRows(count = 5) {
  let manyRows: Record<typeof columns[number]['key'], string>[] = [];
  for (let i = 1; i <= count; i++) {
    let row = generateRow(1, 3, i);
    manyRows.push(row);
  }
  return manyRows;
}

interface ManyExpandableRowsProps extends Omit<SpectrumTableProps<unknown>, 'children'> {
  allowsResizing?: boolean,
  showDivider?: boolean,
  rowCount?: number
}

export const ManyExpandableRowsStoryRender = (args: ManyExpandableRowsProps): JSX.Element => (
  <ManyExpandableRows aria-label="TableView with many dynamic expandable rows" width={500} height={400} rowCount={5} {...args} />
);

function ManyExpandableRows(props: ManyExpandableRowsProps): JSX.Element {
  let {allowsResizing, showDivider, ...otherProps} = props;
  let [expandedKeys, setExpandedKeys] = useState<'all' | Set<Key>>('all');
  let manyRows = generateRows(props.rowCount ?? 5);

  return (
    <Flex direction="column">
      <ActionButton onPress={() => setExpandedKeys('all')}>Expand all</ActionButton>
      <ActionButton onPress={() => setExpandedKeys(new Set([]))}>Collapse all</ActionButton>
      <TableView UNSTABLE_expandedKeys={expandedKeys} UNSTABLE_onExpandedChange={chain(setExpandedKeys, action('onExpandedChange'))} UNSTABLE_allowsExpandableRows disabledKeys={['Row 1 Lvl 2']} {...otherProps}>
        <TableHeader columns={columns}>
          {column => <Column showDivider={showDivider} allowsResizing={allowsResizing}>{column.name}</Column>}
        </TableHeader>
        <TableBody items={manyRows}>
          {item =>
            (<Row key={item.key} UNSTABLE_childItems={item.childRows}>
              {(key) => {
                return <Cell>{item[key]}</Cell>;
              }}
            </Row>)
          }
        </TableBody>
      </TableView>
    </Flex>
  );
}

export const ManyExpandableRowsStory: StoryObj<typeof ManyExpandableRows> = {
  args: {
    'aria-label': 'TableView with many dynamic expandable rows',
    width: 500,
    height: 400,
    rowCount: 5
  },
  render: (args) => (
    <ManyExpandableRowsStoryRender {...args} />
  ),
  name: 'many expandable rows'
};

export const EmptyTreeGridStoryRender = (args: Omit<SpectrumTableProps<unknown>, 'children'>): JSX.Element => (
  <EmptyStateTable UNSTABLE_allowsExpandableRows selectionMode="none" columns={columns} items={generateRows()} allowsSorting={false} width={500} height={400} {...args} />
);

export const EmptyTreeGridStory: TableStory = {
  args: {
    'aria-label': 'TableView with empty state',
    width: 500,
    height: 400
  },
  render: (args) => <EmptyTreeGridStoryRender {...args} />,
  name: 'empty state'
};

function LoadingStateTable(props) {
  let [show, setShow] = useState(false);

  return (
    <Flex direction="column">
      <ActionButton width="100px" onPress={() => setShow(show => !show)}>Toggle items</ActionButton>
      <TableView UNSTABLE_allowsExpandableRows aria-label="TableView with empty state" {...props}>
        <TableHeader columns={columns}>
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={show ? generateRows() : []} loadingState="loadingMore">
          {item =>
            (<Row key={item.key} UNSTABLE_childItems={item.childRows}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </TableView>
    </Flex>
  );
}

export const LoadingTreeGridStoryRender = (args: Omit<SpectrumTableProps<unknown>, 'children'>): JSX.Element => (
  <LoadingStateTable aria-label="TableView with loading" width={500} height={400} {...args} />
);

export const LoadingTreeGridStory: TableStory = {
  args: {
    'aria-label': 'TableView with loading',
    width: 500,
    height: 400
  },
  render: (args) => <LoadingTreeGridStoryRender {...args} />,
  name: 'isLoading'
};

export const NestedColumnsStory: TableStory = {
  args: {
    'aria-label': 'TableView with nested columns',
    width: 500,
    height: 400
  },
  render: (args) => (
    <TableView UNSTABLE_allowsExpandableRows {...args}>
      <TableHeader>
        <Column title="Blah">
          <Column title="Group 1">
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </Column>
          <Column title="Group 2">
            <Column key="baz">Baz</Column>
          </Column>
        </Column>
      </TableHeader>
      <TableBody>
        <Row key="row 1">
          <Cell>Lvl 1 Foo 1</Cell>
          <Cell>Lvl 1 Bar 1</Cell>
          <Cell> Lvl 1 Baz 1</Cell>
          <Row key="child row 1 level 2">
            <Cell>Lvl 2 Foo 1</Cell>
            <Cell>Lvl 2 Bar 1</Cell>
            <Cell>Lvl 2 Baz 1</Cell>
            <Row key="child row 1 level 3">
              <Cell>Lvl 3 Foo 1</Cell>
              <Cell>Lvl 3 Bar 1</Cell>
              <Cell>Lvl 3 Baz 1</Cell>
            </Row>
          </Row>
          <Row key="child row 2 level 2">
            <Cell>Lvl 2 Foo 2</Cell>
            <Cell>Lvl 2 Bar 2</Cell>
            <Cell>Lvl 2 Baz 2</Cell>
          </Row>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'with nested columns'
};

export const ResizableColumnsStory: TableStory = {
  args: {
    'aria-label': 'TableView with many dynamic expandable rows and resizable columns',
    width: 500,
    height: 400
  },
  render: (args) => (
    <ManyExpandableRows allowsResizing showDivider {...args} />
  ),
  name: 'resizable columns'
};
