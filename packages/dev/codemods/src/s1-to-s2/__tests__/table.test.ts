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
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
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
    {column => <Column key={column.name}>{column.name}</Column>}
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

test('Keep key if array.map used', `
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
      {columns.map(column => <Column key={column.id}>{column.name}</Column>)}
    </TableHeader>
    <TableBody items={items}>
      {items.map(item =>
        (<Row key={item.id}>
          {columns.map(column => <Cell key={column.id}>{item[column.id]}</Cell>)}
        </Row>)
      )}
    </TableBody>
  </TableView>
  `);

test('Leave a comment for nested columns', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column title="blah">
      <Column key="test1">
        Test 1
      </Column>
      <Column key="test2">
        Test 2
      </Column>
    </Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for dragAndDropHooks', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView dragAndDropHooks={() => {}}>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for selectionStyle', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView selectionStyle="highlight">
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for UNSTABLE_defaultExpandedKeys', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView UNSTABLE_defaultExpandedKeys={['1', '2']}>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for UNSTABLE_expandedKeys', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView UNSTABLE_expandedKeys={['1', '2']}>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for UNSTABLE_onExpandedChange', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView UNSTABLE_onExpandedChange={() => {}}>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave a comment for UNSTABLE_allowsExpandableRows', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

<TableView UNSTABLE_allowsExpandableRows>
  <TableHeader>
    <Column key="test">Test</Column>
    <Column key="blah">Blah</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Test1</Cell>
      <Cell>One</Cell>
    </Row>
    <Row>
      <Cell>Test2</Cell>
      <Cell>One</Cell>
    </Row>
  </TableBody>
</TableView>
`);

test('Leave comment to add id to Row if no id in items', `
import {Cell, Column, Row, TableBody, TableHeader, TableView}  from '@adobe/react-spectrum';

let columns = [
  {name: 'Foo', id: 'foo'},
  {name: 'Bar', id: 'bar'},
  {name: 'Baz', id: 'baz'}
];

let items = [
  {foo: 'Foo 1', bar: 'Bar 1', baz: 'Baz 1'},
  {foo: 'Foo 2', bar: 'Bar 2', baz: 'Baz 2'}
];

<TableView>
  <TableHeader columns={columns}>
    {column => <Column key={column.name}>{column.name}</Column>}
  </TableHeader>
  <TableBody items={items}>
    {item =>
      (<Row>
        {key => <Cell>{item[key]}</Cell>}
      </Row>)
    }
  </TableBody>
</TableView>
`);
