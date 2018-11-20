import ListDataSource from '@react/react-spectrum/ListDataSource';
import React from 'react';
import Switch from '@react/react-spectrum/Switch';
import IllustratedMessage from '@react/react-spectrum/IllustratedMessage';

export let columns = [
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

let rows = [
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

export class TestDS extends ListDataSource {
  constructor(data = rows) {
    super();
    this.data = data;
  }

  load(sortDescriptor) {
    let data = this.data.slice();
    if (sortDescriptor) {
      this.data.sort((a, b) => a[sortDescriptor.column.key] < b[sortDescriptor.column.key] ? -sortDescriptor.direction : sortDescriptor.direction);
    }

    return data;
  }

  loadMore() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(rows);
      }, 2000);
    });
  }
}

export function renderCell(column, data, rowFocused) {
  if (column.key === 'enabled') {
    // Determine how to set tabIndex of Switch based on focused state of row.
    var tabIndex = rowFocused ? 0 : -1;

    return (
      <Switch
        defaultChecked={data[column.key]}
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
  return data[column.key];
}

export function renderEmptyView() {
  return <IllustratedMessage heading="Drop items here" description="Drag and drop items from the left." illustration={illustration} />;
}

let illustration = (
  <svg viewBox="0 0 199 97.7" height="110">
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="3px">
      <path d="M110.53,85.66,100.26,95.89a1.09,1.09,0,0,1-1.52,0L88.47,85.66" />
      <line x1="99.5" y1="95.5" x2="99.5" y2="58.5" />
      <path d="M105.5,73.5h19a2,2,0,0,0,2-2v-43" />
      <path d="M126.5,22.5h-19a2,2,0,0,1-2-2V1.5h-31a2,2,0,0,0-2,2v68a2,2,0,0,0,2,2h19" />
      <line x1="105.5" y1="1.5" x2="126.5" y2="22.5" />
      <path d="M139.5,36.5H196A1.49,1.49,0,0,1,197.5,38V72A1.49,1.49,0,0,1,196,73.5H141A1.49,1.49,0,0,1,139.5,72V32A1.49,1.49,0,0,1,141,30.5H154a2.43,2.43,0,0,1,1.67.66l6,5.66" />
      <rect x="1.5" y="34.5" width="58" height="39" rx="2" ry="2" />
      <path strokeWidth="2px" d="M47.93,50.49a5,5,0,1,0-4.83-5A4.93,4.93,0,0,0,47.93,50.49Z" />
      <path strokeWidth="2px" d="M36.6,65.93,42.05,60A2.06,2.06,0,0,1,45,60l12.68,13.2" />
      <path strokeWidth="2px" d="M3.14,73.23,22.42,53.76a1.65,1.65,0,0,1,2.38,0l19.05,19.7" />
    </g>
  </svg>
);
