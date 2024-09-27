// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Handles static TableView', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView>
  <TableHeader>
    <Column key="test">Test</Column>
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
</TableView>
`);


test('Handles dynamic columns and rows', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

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

<TableView aria-label="Dynamic table">
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
`);
