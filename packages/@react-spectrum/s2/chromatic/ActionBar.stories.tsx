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

import {ActionBar, ActionBarProps} from '../src/ActionBar';
import {ActionButton} from '../src/ActionButton';
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
  TableViewProps
} from '../src/TableView';
import Copy from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import {Key} from '@react-types/shared';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactNode} from 'react';
import {style} from '../style' with {type: 'macro'};
import {Text} from '../src/Content';

const meta: Meta<typeof ActionBar> = {
  component: ActionBar,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ActionBar'
};

export default meta;

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
  {id: 8, foo: 'Foo 8', bar: 'Bar 8', baz: 'Baz 8'}
];

const narrowTable = style({width: 320, height: 240});
const defaultTable = style({width: 500, height: 240});
const wideTable = style({width: 800, height: 240});

const actions = [
  {label: 'Edit', icon: <Edit />},
  {label: 'Copy', icon: <Copy />},
  {label: 'Delete', icon: <Delete />}
];

interface ExampleProps extends Omit<ActionBarProps, 'children'> {
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  tableStyles?: TableViewProps['styles'];
  isIconOnly?: boolean;
}
const Example = ({
  defaultSelectedKeys,
  tableStyles = defaultTable,
  isIconOnly,
  ...actionBarProps
}: ExampleProps): ReactNode => (
  <TableView
    aria-label="Table"
    selectionMode="multiple"
    defaultSelectedKeys={defaultSelectedKeys}
    styles={tableStyles}
    renderActionBar={() => (
      <ActionBar {...actionBarProps}>
        {actions.map(({label, icon}) =>
          isIconOnly ? (
            <ActionButton key={label} aria-label={label}>
              {icon}
            </ActionButton>
          ) : (
            <ActionButton key={label}>
              {icon}
              <Text>{label}</Text>
            </ActionButton>
          )
        )}
      </ActionBar>
    )}>
    <TableHeader columns={columns}>
      {column => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
    </TableHeader>
    <TableBody items={items}>
      {item => (
        <Row id={item.id} columns={columns}>
          {column => <Cell>{item[column.id]}</Cell>}
        </Row>
      )}
    </TableBody>
  </TableView>
);

type Story = StoryObj<typeof Example>;

export const Default: Story = {
  render: args => (
    <div className={style({display: 'flex', gap: 24})}>
      <Example {...args} />
      <Example {...args} defaultSelectedKeys={[1, 2, 3]} />
    </div>
  )
};

export const IsEmphasized: Story = {
  render: args => <Example {...args} />,
  args: {
    isEmphasized: true,
    defaultSelectedKeys: [1, 2, 3]
  }
};

export const LargeWidth: Story = {
  render: args => <Example {...args} />,
  args: {
    defaultSelectedKeys: [1, 2, 3],
    tableStyles: wideTable
  }
};

export const IconOnly: Story = {
  render: args => <Example {...args} />,
  args: {
    defaultSelectedKeys: [1, 2, 3],
    isIconOnly: true,
    tableStyles: narrowTable
  }
};

export const AllSelected: Story = {
  render: args => <Example {...args} />,
  args: {
    isEmphasized: true,
    defaultSelectedKeys: 'all'
  }
};
