/* eslint-disable */
import ButtonExamples from './sections/ButtonExamples';
import {
  Cell,
  Column,
  Item,
  Row,
  TableBody,
  TableHeader,
  TableView,
  TagGroup
} from '@adobe/react-spectrum';
import CollectionExamples from './sections/CollectionExamples';
import ColorExamples from './sections/ColorExamples';
import ContentExamples from './sections/ContentExamples';
import DateTimeExamples from './sections/DateTimeExamples';
import DragAndDropExamples from './sections/DragAndDropExamples';
import {enableTableNestedRows} from '@react-stately/flags';
import FormExamples from './sections/FormExamples';
import Lighting from './Lighting';
import NavigationExamples from './sections/NavigationExamples';
import OverlayExamples from './sections/OverlayExamples';
import PickerExamples from './sections/PickerExamples';
import StatusExamples from './sections/StatusExamples';
import React, {useState} from 'react';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let nestedItems = [
  {foo: 'Lvl 1 Foo 1', bar: 'Lvl 1 Bar 1', baz: 'Lvl 1 Baz 1', childRows: [
      {foo: 'Lvl 2 Foo 1', bar: 'Lvl 2 Bar 1', baz: 'Lvl 2 Baz 1', childRows: [
          {foo: 'Lvl 3 Foo 1', bar: 'Lvl 3 Bar 1', baz: 'Lvl 3 Baz 1'}
        ]},
      {foo: 'Lvl 2 Foo 2', bar: 'Lvl 2 Bar 2', baz: 'Lvl 2 Baz 2'}
    ]}
];

function App() {
  let [selected, setSelection] = useState(false);
  enableTableNestedRows();

  return (
      <div className="content-padding">
        <Lighting selected={selected} switch={setSelection}/>
        <TagGroup aria-label="Static TagGroup items example">
          <Item>News</Item>
          <Item>Travel</Item>
          <Item>Gaming</Item>
          <Item>Shopping</Item>
        </TagGroup>
        <TableView aria-label="example table with nested rows" UNSTABLE_allowsExpandableRows width={500} height={200} >
          <TableHeader columns={columns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={nestedItems}>
            {(item: any) =>
              (<Row key={item.foo} UNSTABLE_childItems={item.childRows}>
                {(key) => {
                  return <Cell>{item[key]}</Cell>;
                }}
              </Row>)
            }
          </TableBody>
        </TableView>
        <ButtonExamples />
        <CollectionExamples />
        <ColorExamples />
        <DateTimeExamples />
        <FormExamples />
        <NavigationExamples />
        <OverlayExamples />
        <StatusExamples />
        <ContentExamples />
        <PickerExamples />
        <DragAndDropExamples />
      </div>
  );
}

export default {
  title: 'App',
  argTypes: {}
};


export const Default = {
  render: (args) => (
    <App />
  )
};
