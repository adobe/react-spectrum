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

import {ColumnViewDataSource} from '../../src/ColumnView';
import React from 'react';
import TreeDataSource from '../../src/TreeDataSource';

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

  isItemEqual(a, b) {
    return a.label === b.label;
  }
}

export class TreeDS extends TreeDataSource {
  async getChildren(item) {
    if (!item) {
      return data;
    }

    return item.children;
  }

  hasChildren(item) {
    return !!item.children;
  }
  
  isItemEqual(a, b) {
    return a.label === b.label;
  }
}

export function renderItem(item) {
  return <span>{item.label}</span>;
}

export function renderDetail(item) {
  return (
    <div>
      <h4>Detail</h4>
      <div>{item.label}</div>
    </div>
  );
}
