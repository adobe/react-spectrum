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
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {Content} from '@react-spectrum/view';
import {CRUDExample} from './CRUDExample';
import {Heading} from '@react-spectrum/typography';
import {HidingColumns} from './HidingColumns';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {useAsyncList} from '@react-stately/data';

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
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={columns} columnKey="key">
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
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
      <Table width={500} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      <Table width={700} height={300} rowHeight="auto" onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={nestedColumns} columnKey="key">
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
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
      <Table width={300} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
    )
  )
  .add(
    'many columns and rows',
    () => (
      <Table width={700} height={500} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows} itemKey="key">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'isQuiet, many columns and rows',
    () => (
      <Table width={700} height={500} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows} itemKey="key">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    )
  )
  .add(
    'column widths and dividers',
    () => (
      <Table width={500} height={200} onSelectionChange={s => onSelectionChange([...s])}>
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
      <Table width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
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
    'rowHeight=72',
    () => (
      <Table width={500} height={200} isQuiet rowHeight={80} onSelectionChange={s => onSelectionChange([...s])}>
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
    'rowHeight=auto',
    () => (
      <Table width={500} height={300} isQuiet rowHeight="auto" onSelectionChange={s => onSelectionChange([...s])}>
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
      <Table width={500} height={200} isQuiet onSelectionChange={s => onSelectionChange([...s])}>
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
      <Table width={700} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={[]} isLoading itemKey="key">
          {item =>
            (<Row>
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
      <Table width={700} height={200} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={columns} columnKey="key">
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} isLoading itemKey="foo">
          {item =>
            (<Row>
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
      <Table width={700} height={400} isQuiet renderEmptyState={renderEmptyState} onSelectionChange={s => onSelectionChange([...s])}>
        <TableHeader columns={manyColunns} columnKey="key">
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
    () => <AsyncLoadingExample />
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
    <Table width={1000} height={500} isQuiet sortDescriptor={list.sortDescriptor} onSortChange={list.sort}>
      <TableHeader>
        <Column uniqueKey="score" width={100} allowsSorting>Score</Column>
        <Column uniqueKey="title" isRowHeader allowsSorting>Title</Column>
        <Column uniqueKey="author" width={200} allowsSorting>Author</Column>
        <Column uniqueKey="num_comments" width={100} allowsSorting>Comments</Column>
      </TableHeader>
      <TableBody items={list.items} isLoading={list.isLoading} onLoadMore={list.loadMore}>
        {item =>
          (<Row uniqueKey={item.data.id}>
            {key => 
              key === 'title'
                ? <Cell textValue={item.data.title}><Link isQuiet><a href={item.data.url} target="_blank">{item.data.title}</a></Link></Cell>
                : <Cell>{item.data[key]}</Cell>
            }
          </Row>)
        }
      </TableBody>
    </Table>
  );
}
