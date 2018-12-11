import Folder from '@react/react-spectrum/Icon/Folder';
import Layers from '@react/react-spectrum/Icon/Layers';
import React from 'react';
import TreeDataSource from '@react/react-spectrum/TreeDataSource';

const data = [
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

export class ExampleDS extends TreeDataSource {
  constructor(d = data) {
    super();
    this.data = d;
  }

  async getChildren(item) {
    if (!item) {
      return this.data;
    }

    return item.children || [];
  }

  hasChildren(item) {
    return !!item.children;
  }
}

export let ds = new ExampleDS;
export let ds2 = new ExampleDS([
  {label: 'Root 1', children: [
    {label: 'Child 1'},
    {label: 'Child 2'}
  ]},
  {label: 'Root 2', children: [
    {label: 'Child 1'},
    {label: 'Child 2'}
  ]}
]);

export function renderItem(item) {
  let icon = item.children ? <Folder size="S" /> : <Layers size="S" />;
  return (
    <span>
      {React.cloneElement(icon, {style: {marginRight: '8px', verticalAlign: 'top'}})}
      {item.label}
    </span>
  );
}

export function renderDetail(item) {
  return (
    <div>
      <h4>Detail</h4>
      <div>{item.label}</div>
    </div>
  );
}
