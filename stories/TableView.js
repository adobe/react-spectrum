import {action, storiesOf} from '@storybook/react';
import React from 'react';
import Switch from '../src/Switch';
import {TableView, TableViewDataSource} from '../src/TableView';
import {VerticalCenter} from '../.storybook/layout';
import './TableView.styl';

storiesOf('TableView', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'variant: quiet',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'allowsSelection: false',
    () => render({allowsSelection: false}),
    {inline: true}
  )
  .addWithInfo(
    'allowsMultipleSelection: false',
    () => render({allowsMultipleSelection: false}),
    {inline: true}
  )
  .addWithInfo(
    'rowHeight: 72',
    () => render({rowHeight: 72}),
    {inline: true}
  );

var tableData = [
  {'id': 1, 'name': 'Python, carpet', 'enabled': true, 'createdBy': 'Alexandro Hindrich'},
  {'id': 2, 'name': 'Cormorant, flightless', 'enabled': false, 'createdBy': 'Felicity McRinn'},
  {'id': 3, 'name': 'Cape cobra', 'enabled': false, 'createdBy': 'Emalee Worsfield'},
  {'id': 4, 'name': 'Red lava crab', 'enabled': true, 'createdBy': 'Cedric Henriet'},
  {'id': 5, 'name': 'Tiger', 'enabled': true, 'createdBy': 'Roselin Burk'},
  {'id': 6, 'name': 'Blue-tongued skink', 'enabled': false, 'createdBy': 'Dru Kretschmer'},
  {'id': 7, 'name': 'Springbuck', 'enabled': false, 'createdBy': 'Brockie Eastham'},
  {'id': 8, 'name': 'Woodpecker, downy', 'enabled': true, 'createdBy': 'Lexis Bravey'},
  {'id': 9, 'name': 'Cape white-eye', 'enabled': true, 'createdBy': 'Vevay Wessel'},
  {'id': 10, 'name': 'African wild cat', 'enabled': false, 'createdBy': 'Melamie Klais'}
];

class TableDS extends TableViewDataSource {
  getColumns() {
    return [
      {
        title: 'Active',
        key: 'enabled',
        width: 100,
        announce: false
      },
      {
        title: 'Name',
        key: 'name',
        minWidth: 200,
        sortable: true,
        divider: true
      },
      {
        title: 'Created By',
        key: 'createdBy',
        width: 200,
        sortable: true
      }
    ];
  }

  getNumberOfRows(section) {
    return tableData.length;
  }

  getCell(column, row, section) {
    return tableData[row][column.key];
  }

  sort(column, dir) {
    tableData.sort((a, b) => a[column.key] < b[column.key] ? -dir : dir);
    this.reloadData();
  }
}
var ds = new TableDS;

function renderCell(column, data, rowFocused) {
  if (column.key === 'enabled') {

    // Determine how to set tabIndex of Switch based on focused state of row.
    var tabIndex = rowFocused ? 0 : -1;

    return (
      <Switch
        defaultChecked={data}
        onChange={action('change')}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.stopPropagation();
          }
        }}
        tabIndex={tabIndex}
        title={column.title} />
    );
  }
  return <span>{'' + data}</span>;
}

function render(props = {}) {
  return (
    <TableView
      dataSource={ds}
      renderCell={renderCell}
      onCellClick={action('cellClick')}
      onCellDoubleClick={action('cellDoubleClick')}
      onSelectionChange={action('selectionChange')}
      {...props} />
  );
}
