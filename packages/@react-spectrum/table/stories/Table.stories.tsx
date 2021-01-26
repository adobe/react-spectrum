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
import {ActionButton} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {Content} from '@react-spectrum/view';
import {CRUDExample} from './CRUDExample';
import Delete from '@spectrum-icons/workflow/Delete';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {HidingColumns} from './HidingColumns';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';
import {useAsyncList} from '@react-stately/data';
import {useFilter} from '@react-aria/i18n';
import {View} from '@react-spectrum/view';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let nestedColumns = [
  {name: 'Test', key: 'test'},
  {name: 'Tiered One Header', key: 'tier1', children: [
    {name: 'Tier Two Header A', key: 'tier2a', children: [
      {name: 'Foo', key: 'foo'},
      {name: 'Bar', key: 'bar'}
    ]},
    {name: 'Yay', key: 'yay'},
    {name: 'Tier Two Header B', key: 'tier2b', children: [
      {name: 'Baz', key: 'baz'}
    ]}
  ]}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

let manyColunns = [];
for (let i = 0; i < 100; i++) {
  manyColunns.push({name: 'Column ' + i, key: 'C' + i});
}

let manyRows = [];
for (let i = 0; i < 1000; i++) {
  let row = {key: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = `${i}, ${j}`;
  }

  manyRows.push(row);
}

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

let onSelectionChange = action('onSelectionChange');
storiesOf('Table', module)
  .add(
    'static',
    () => (
      <Table aria-label="Table with static contents" width={300} height={200}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">Baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'static with selection',
    () => (
      <Table aria-label="Table with static contents" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column key="foo">Foo</Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">Baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'dynamic',
    () => (
      <Table aria-label="Table with dynamic contents" width={300} height={200}>
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
      </Table>
    )
  )
  .add(
    'dynamic with selection',
    () => (
      <Table aria-label="Table with dynamic contents" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      </Table>
    )
  )
  .add(
    'dynamic with single selection',
    () => (
      <Table aria-label="Table with dynamic contents" selectionMode="single" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      </Table>
    )
  )
  .add(
    'dynamic with disabled, single selection',
    () => (
      <Table disabledKeys={['Foo 1', 'Foo 3']} aria-label="Table with dynamic contents" selectionMode="single" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      </Table>
    )
  )
  .add(
    'dynamic with disabled, multiple selection',
    () => (
      <Table disabledKeys={['Foo 1', 'Foo 3']} aria-label="Table with dynamic contents" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      </Table>
    )
  )
  .add(
    'dynamic with disabled, multiple selection, quiet',
    () => (
      <Table isQuiet disabledKeys={['Foo 1', 'Foo 3']} aria-label="Table with dynamic contents" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      </Table>
    )
  )
  .add(
    'static with nested columns',
    () => (
      <Table aria-label="Table with nested columns" selectionMode="multiple" width={500} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column key="test">Test</Column>
          <Column title="Group 1">
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </Column>
          <Column title="Group 2">
            <Column key="baz">Baz</Column>
          </Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Test1</Cell>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>Test2</Cell>
            <Cell>One</Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'dynamic with nested columns',
    () => (
      <Table aria-label="Table with nested columns" selectionMode="multiple" width={700} height={300} overflowMode="wrap" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={nestedColumns}>
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'focusable cells',
    () => (
      <Flex direction="column">
        <input placeholder="Focusable before" />
        <Table aria-label="Table with focusable cells" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
          <TableHeader>
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
            <Column key="baz">baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell><Switch aria-label="Foo" /></Cell>
              <Cell><Link><a href="https://google.com" target="_blank">Google</a></Link></Cell>
              <Cell>Three</Cell>
            </Row>
            <Row>
              <Cell><Switch aria-label="Foo" /></Cell>
              <Cell><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
              <Cell>Three</Cell>
            </Row>
          </TableBody>
        </Table>
        <input placeholder="Focusable after" />
      </Flex>
    )
  )
  .add(
    'many columns and rows',
    () => (
      <Table aria-label="Table with many columns and rows" selectionMode="multiple" width={700} height={500} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    ),
    {chromatic: {disable: true}}
  )
  .add(
    'isQuiet, many columns and rows',
    () => (
      <Table aria-label="Quiet table with many columns and rows" selectionMode="multiple" width={700} height={500} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    ),
    {chromatic: {disable: true}}
  )
  .add(
    'column widths and dividers',
    () => (
      <Table aria-label="Table with column widths and dividers" selectionMode="multiple" width={500} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'isQuiet, column widths and dividers',
    () => (
      <Table aria-label="Quiet table with column widths and dividers" selectionMode="multiple" width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'density="compact"',
    () => (
      <Table aria-label="Table with custom row height" selectionMode="multiple" width={500} height={200} isQuiet density="compact" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'density="spacious"',
    () => (
      <Table aria-label="Table with custom row height" selectionMode="multiple" width={500} height={200} isQuiet density="spacious" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'overflowMode="wrap"',
    () => (
      <Table aria-label="Table with variable row heights" selectionMode="multiple" width={500} height={300} isQuiet overflowMode="wrap" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal with very very very very very very long long long long long filename</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'overflowMode="wrap", density="compact"',
    () => (
      <Table aria-label="Table with variable row heights" selectionMode="multiple" width={500} height={300} isQuiet overflowMode="wrap" density="compact" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal with very very very very very very long long long long long filename</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'overflowMode="wrap", density="spacious"',
    () => (
      <Table aria-label="Table with variable row heights" selectionMode="multiple" width={500} height={300} isQuiet overflowMode="wrap" density="spacious" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column width={250} showDivider>File Name</Column>
          <Column>Type</Column>
          <Column align="end">Size</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal with very very very very very very long long long long long filename</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'custom isRowHeader labeling',
    () => (
      <Table aria-label="Table with custom row header labeling" selectionMode="multiple" width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader>
          <Column isRowHeader>First Name</Column>
          <Column isRowHeader>Last Name</Column>
          <Column>Birthday</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Sam</Cell>
            <Cell>Smith</Cell>
            <Cell>May 3</Cell>
          </Row>
          <Row>
            <Cell>Julia</Cell>
            <Cell>Jones</Cell>
            <Cell>February 10</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'CRUD',
    () => (
      <CRUDExample />
    )
  )
  .add(
    'hiding columns',
    () => (
      <HidingColumns />
    )
  )
  .add(
    'isLoading',
    () => (
      <Table aria-label="Table loading" width={700} height={200}>
        <TableHeader columns={manyColunns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={[]} isLoading>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'isLoading more',
    () => (
      <Table aria-label="Table loading more" width={700} height={200}>
        <TableHeader columns={columns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} isLoading>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'renderEmptyState',
    () => (
      <Table aria-label="Table with empty state" width={700} height={400} isQuiet renderEmptyState={renderEmptyState}>
        <TableHeader columns={manyColunns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody>
          {[]}
        </TableBody>
      </Table>
    )
  )
  .add(
    'async loading',
    () => <AsyncLoadingExample />,
    {chromatic: {disable: true}}
  )
  .add(
    'hideHeader',
    () => (
      <Table
        aria-label="Table with static contents"
        width={350}
        height={200}>
        <TableHeader>
          <Column key="foo">
            Foo
          </Column>
          <Column key="addAction" hideHeader>
            Add Item
          </Column>
          <Column key="deleteAction" hideHeader showDivider>
            Delete Item
          </Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">Baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell>One</Cell>
            <Cell>
              <ActionButton isQuiet>
                <Add />
              </ActionButton>
            </Cell>
            <Cell>
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>Two</Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add('table with textfields and buttons',
    () => (
      <Table aria-label="Table" selectionMode="none">
        <TableHeader>
          <Column isRowHeader minWidth={200}>First Name</Column>
          <Column isRowHeader>Last Name</Column>
          <Column>Birthday</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Sam</Cell>
            <Cell>Smith</Cell>
            <Cell>May 3</Cell>
          </Row>
          <Row>
            <Cell>Julia</Cell>
            <Cell>Jones</Cell>
            <Cell>February 10</Cell>
          </Row>
          <Row>
            <Cell>John</Cell>
            <Cell>Doe</Cell>
            <Cell>December 12</Cell>
          </Row>
          <Row>
            <Cell textValue="Textfield">
              <TextField width={150} aria-label="table textfield" />
            </Cell>
            <Cell textValue="Action Button">
              <ActionButton isQuiet>
                <Delete />
              </ActionButton>
            </Cell>
            <Cell>December 12</Cell>
          </Row>
        </TableBody>
      </Table>
    )
  )
  .add(
    'async client side filter loading',
    () => <ProjectListTable />,
    {chromatic: {disable: true}}
  )
  .add(
    'async server side filter loading',
    () => <AsyncServerFilterTable />,
    {chromatic: {disable: true}}
  );

function AsyncLoadingExample() {
  interface Item {
    data: {
      id: string,
      url: string,
      title: string
    }
  }

  let list = useAsyncList<Item>({
    getKey: (item) => item.data.id,
    async load({signal, cursor}) {
      let url = new URL('https://www.reddit.com/r/news.json');
      if (cursor) {
        url.searchParams.append('after', cursor);
      }

      let res = await fetch(url.toString(), {signal});
      let json = await res.json();
      return {items: json.data.children, cursor: json.data.after};
    },
    async sort({items, sortDescriptor}) {
      return {
        items: items.slice().sort((a, b) => {
          let cmp = a.data[sortDescriptor.column] < b.data[sortDescriptor.column] ? -1 : 1;
          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }
          return cmp;
        })
      };
    }
  });

  return (
    <div>
      <ActionButton marginBottom={10} onPress={() => list.remove(list.items[0].data.id)}>Remove first item</ActionButton>
      <Table aria-label="Top news from Reddit" selectionMode="multiple" width={1000} height={400} isQuiet sortDescriptor={list.sortDescriptor} onSortChange={list.sort}>
        <TableHeader>
          <Column key="score" width={100} allowsSorting>Score</Column>
          <Column key="title" isRowHeader allowsSorting>Title</Column>
          <Column key="author" width={200} allowsSorting>Author</Column>
          <Column key="num_comments" width={100} allowsSorting>Comments</Column>
        </TableHeader>
        <TableBody items={list.items} isLoading={list.isLoading} onLoadMore={list.loadMore}>
          {item =>
            (<Row key={item.data.id}>
              {key =>
                key === 'title'
                  ? <Cell textValue={item.data.title}><Link isQuiet><a href={item.data.url} target="_blank">{item.data.title}</a></Link></Cell>
                  : <Cell>{item.data[key]}</Cell>
              }
            </Row>)
          }
        </TableBody>
      </Table>
    </div>
  );
}

let COLUMNS = [
  {
    name: 'Name',
    key: 'name',
    minWidth: 200
  },
  {
    name: 'Owner',
    key: 'ownerName'
  }
];

async function getCollectionItems(): Promise<any> {
  const result = [
    {
      id: 'xx',
      name: 'abc',
      ownerName: 'xx'
    },
    {
      id: 'aa',
      name: 'efg',
      ownerName: 'aa'
    },
    {
      id: 'yy',
      name: 'abcd',
      ownerName: 'yy'
    },
    {
      id: 'bb',
      name: 'efgh',
      ownerName: 'bb'
    },
    {
      id: 'zz',
      name: 'abce',
      ownerName: 'zz'
    },
    {
      id: 'cc',
      name: 'efgi',
      ownerName: 'cc'
    }
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 5);
  });
}

function ProjectListTable() {
  interface Item {
    id: string,
    name: string,
    ownerName: string
  }

  let {contains} = useFilter({sensitivity: 'base'});
  let [filterText, setFilterText] = React.useState('');
  let list = useAsyncList<Item>({
    async load() {
      let projects = await getCollectionItems();
      return {items: projects};
    }
  });
  let filteredItems = React.useMemo(() => list.items.filter(item => contains(item.name, filterText)), [list.items, filterText, contains]);
  const onChange = (value) => {
    setFilterText(value);
  };

  return (
    <>
      <SearchField
        marginStart={'size-200'}
        marginBottom={'size-200'}
        marginTop={'size-200'}
        width={'size-3600'}
        aria-label={'Search by name'}
        placeholder={'Search by name'}
        value={filterText}
        onChange={(onChange)} />
      <View flexGrow={1} height={700} overflow="hidden">
        <Table
          aria-label={'Project list'}
          height={'100%'}
          isQuiet
          sortDescriptor={list.sortDescriptor}
          onSortChange={list.sort}>
          <TableHeader columns={COLUMNS}>
            {(column) => {
              const {name, ...columnProps} = column;
              return <Column {...columnProps}>{name}</Column>;
            }}
          </TableHeader>
          <TableBody
            items={filteredItems}
            isLoading={list.isLoading}>
            {(item) => (
              <Row key={item.id}>{(key) => <Cell>{item[key]}</Cell>}</Row>
            )}
          </TableBody>
        </Table>
      </View>
    </>
  );
}

function AsyncServerFilterTable() {
  interface Item {
    name: string,
    height: string,
    mass: string
  }

  let columns = [
    {
      name: 'Name',
      key: 'name',
      minWidth: 200
    },
    {
      name: 'Height',
      key: 'height'
    },
    {
      name: 'Mass',
      key: 'mass'
    }
  ];

  let list = useAsyncList<Item>({
    getKey: (item) => item.name,
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(cursor || `https://swapi.dev/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  const onChange = (value) => {
    list.setFilterText(value);
  };
  return (
    <div>
      <SearchField
        marginStart={'size-200'}
        marginBottom={'size-200'}
        marginTop={'size-200'}
        width={'size-3600'}
        aria-label={'Search by name'}
        placeholder={'Search by name'}
        defaultValue={list.filterText}
        onChange={(onChange)} />
      <Table
        aria-label={'Star Wars Characters'}
        height={200}
        width={600}
        isQuiet
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}>
        <TableHeader columns={columns}>
          {(column) => {
            const {name, ...columnProps} = column;
            return <Column {...columnProps}>{name}</Column>;
          }}
        </TableHeader>
        <TableBody
          items={list.items}
          isLoading={list.isLoading}
          onLoadMore={list.loadMore}>
          {(item) => (
            <Row key={item.name}>{(key) => <Cell>{item[key]}</Cell>}</Row>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
