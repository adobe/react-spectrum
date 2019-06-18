/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import {DragTarget, IndexPath} from '@react/collection-view';
import IllustratedMessage from '../src/IllustratedMessage';
import ListDataSource from '../src/ListDataSource';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Switch from '../src/Switch';
import {TableView, TableViewDataSource} from '../src/TableView';

storiesOf('TableView', module)
  .addDecorator(
    story => <div style={{height: '300px'}}>{story()}</div>
  )
  .add(
    'Default',
    () => render()
  )
  .add(
    'variant: quiet',
    () => render({quiet: true})
  )
  .add(
    'allowsSelection: false',
    () => render({allowsSelection: false})
  )
  .add(
    'allowsMultipleSelection: false',
    () => render({allowsMultipleSelection: false})
  )
  .add(
    'rowHeight: 72',
    () => render({rowHeight: 72})
  )
  .add(
    'canDragItems: true',
    () => render({canDragItems: true, quiet: true})
  )
  .add(
    'custom drag view',
    () => render({
      canDragItems: true,
      quiet: true,
      renderDragView: () => <div style={{background: 'red', color: 'white'}}>Drag view</div>
    })
  )
  .add(
    'with empty view',
    () => render({
      dataSource: new TableDS([]),
      quiet: true,
      renderEmptyView: () => (
        <IllustratedMessage
          heading="No Results"
          description="Try another search"
          illustration={
            <svg width="150" height="103" viewBox="0 0 150 103">
              <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
            </svg>
          } />
      )
    })
  )
  .add(
    'with old API',
    () => (
      <TableView
        dataSource={new OldTableDS}
        renderCell={renderCell} />
    )
  )
  .add(
    'acceptsDrops: true',
    () => render({acceptsDrops: true}),
    {info: 'This example shows how TableView supports drag and drop between rows.'}
  )
  .add(
    'acceptsDrops: true, quiet: true',
    () => render({acceptsDrops: true, quiet: true}),
    {info: 'This example shows how TableView supports drag and drop between rows.'}
  )
  .add(
    'dropPosition: "on"',
    () => render({acceptsDrops: true, quiet: true, dropPosition: 'on'}),
    {info: 'This example shows how TableView supports drag and drop over both rows and the whole table using dropPosition="on". In this example, "Active" rows can be dropped over, otherwise the drop goes to the entire table.'}
  )
  .add(
    'canReorderItems',
    () => render({acceptsDrops: true, quiet: true, canReorderItems: true}),
    {info: 'This example shows how TableView supports reordering rows.'}
  ).add(
    'can shrink colums',
    () => render({allowsSelection: false, columns: SHRINKABLE_COLUMNS}),
    {info: 'This example shows how the TableView supports shrink columns on window resize.'}
  );

var tableData = [
  {'id': 1, 'name': 'Python, carpet', 'enabled': true, 'createdBy': 'Alexandro Hindrich', description: 'Morelia spilota, commonly referred to as carpet python and diamond pythons'},
  {'id': 2, 'name': 'Cormorant, flightless', 'enabled': false, 'createdBy': 'Felicity McRinn', description: 'The flightless cormorant, also known as the Galapagos cormorant'},
  {'id': 3, 'name': 'Cape cobra', 'enabled': false, 'createdBy': 'Emalee Worsfield', description: 'The Cape cobra, also called the yellow cobra'},
  {'id': 4, 'name': 'Red lava crab', 'enabled': true, 'createdBy': 'Cedric Henriet', description: 'No description'},
  {'id': 5, 'name': 'Tiger', 'enabled': true, 'createdBy': 'Roselin Burk', description: 'The tiger is the largest cat species, most recognizable for its pattern of dark vertical stripes on reddish-orange fur with a lighter underside. '},
  {'id': 6, 'name': 'Blue-tongued skink', 'enabled': false, 'createdBy': 'Dru Kretschmer', description: 'Blue-tongued skinks comprise the Australasian genus Tiliqua, which contains some of the largest members of the skink family'},
  {'id': 7, 'name': 'Springbuck', 'enabled': false, 'createdBy': 'Brockie Eastham', description: 'No description'},
  {'id': 8, 'name': 'Woodpecker, downy', 'enabled': true, 'createdBy': 'Lexis Bravey', description: 'The downy woodpecker is a species of woodpecker, the smallest in North America.'},
  {'id': 9, 'name': 'Cape white-eye', 'enabled': true, 'createdBy': 'Vevay Wessel', description: 'The Cape white-eye is a small passerine bird in the white-eye family. It is native to southern Africa.'},
  {'id': 10, 'name': 'African wild cat', 'enabled': false, 'createdBy': 'Melamie Klais', description: 'The African wildcat, also called Near Eastern wildcat is a wildcat species that lives in Northern Africa'}
];

const COLUMNS = [
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

const SHRINKABLE_COLUMNS = [
  {
    title: 'Description',
    key: 'description',
    width: 500,
    sortable: true,
    align: 'left'
  },
  {
    title: 'Name',
    key: 'name',
    sortable: true,
    maxWidth: 200,
    align: 'left'
  },
  {
    title: 'Created By',
    key: 'createdBy',
    maxWidth: 200,
    sortable: true,
    align: 'left'
  },
  {
    title: 'Active',
    key: 'enabled',
    width: 100,
    announce: false
  }
];

class OldTableDS extends TableViewDataSource {
  getColumns() {
    return COLUMNS;
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

class TableDS extends ListDataSource {
  constructor(data = tableData) {
    super();
    this.data = data;
  }

  load(sortDescriptor) {
    let data = this.data.slice();
    if (sortDescriptor) {
      data.sort((a, b) => a[sortDescriptor.column.key] < b[sortDescriptor.column.key] ? -sortDescriptor.direction : sortDescriptor.direction);
    }

    return data;
  }

  loadMore() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data);
      }, 2000);
    });
  }

  getDropTarget(target) {
    let item = tableData[target.indexPath.index];
    if (item && !item.enabled && target.dropPosition === DragTarget.DROP_ON) {
      return new DragTarget('item', new IndexPath(0, 0), DragTarget.DROP_BETWEEN);
    }

    return target;
  }
}

var ds = new TableDS;

function renderCell(column, data, rowFocused) {
  if (column.key === 'enabled') {
    // Determine how to set tabIndex of Switch based on focused state of row.
    var tabIndex = rowFocused ? 0 : -1;

    return (
      <Switch
        defaultChecked={data[column.key] == null ? data : data[column.key]}
        onChange={action('change')}
        tabIndex={tabIndex}
        title={column.title}
        aria-label={column.title} />
    );
  }
  return <span>{'' + (data[column.key] || data)}</span>;
}

function render(props = {}) {
  return (
    <TableView
      columns={COLUMNS}
      dataSource={ds}
      renderCell={renderCell}
      onCellClick={action('cellClick')}
      onCellDoubleClick={action('cellDoubleClick')}
      onSelectionChange={action('selectionChange')}
      {...props} />
  );
}
