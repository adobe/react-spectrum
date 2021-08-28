import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import React, {useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {storiesOf} from '@storybook/react';


let manyColumns = [];
for (let i = 0; i < 100; i++) {
  manyColumns.push(
    i === 0
      ? {name: 'Column name', key: 'C0'}
      : {name: 'Column ' + i, key: 'C' + i}
  );
}

let manyRows = [];
for (let i = 0; i < 1000; i++) {
  let row = {key: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = j === 0 ? `Row ${i}` : `${i}, ${j}`;
  }

  manyRows.push(row);
}

storiesOf('useFocusRing', module)
  .add(
    'search + tableview',
    () => (
      <SearchExample />
    )
  );

function SearchExample() {
  const [items, setItems] = useState(manyRows);

  return (
    <div>
      <SearchField
        onChange={(value) => {
          const newItems = manyRows.filter((item) =>
            item['C0'].toLowerCase().includes(value.toLowerCase())
          );
          setItems(newItems);
        }} />
      <TableView aria-label="Searchable table with many columns and rows" selectionMode="multiple" width={700} height={500}>
        <TableHeader columns={manyColumns}>
          {column =>
            <Column minWidth={100}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items}>
          {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </TableView>
    </div>
  );
}
