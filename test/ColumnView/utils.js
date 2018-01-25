import {ColumnViewDataSource} from '../../src/ColumnView';
import React from 'react';

export const data = [
  {label: 'Test 1', children: [
    {label: 'Child 1', children: [
      {label: 'Sub Child 1'},
      {label: 'Sub Child 2'},
      {label: 'Sub Child 3'},
      {label: 'Sub Child 4'},
      {label: 'Sub Child 5'},
      {label: 'Sub Child 6'},
      {label: 'Sub Child 7'},
      {label: 'Sub Child 8'}
    ]},
    {label: 'Child 2'}
  ]},
  {label: 'Test 2'}
];

export class TestDS extends ColumnViewDataSource {
  async getChildren(item) {
    if (!item) {
      return data;
    }

    return item.children;
  }

  hasChildren(item) {
    return !!item.children;
  }
}

export function renderItem(item) {
  return <span>{item.label}</span>;
}
