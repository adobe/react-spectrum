// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Static TableView', `
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


test('Dynamic TableView', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

let columns = [
  {name: 'Foo', id: 'foo'},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz'}
];

let items = [
  {id: 1, foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1'},
  {id: 2, foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2'}
];

<TableView>
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
</TableView>
`);
