/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection} from 'react-aria/Collection';
import {expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TreeView, TreeViewItem, TreeViewItemContent} from '../src/TreeView';
import {User} from '@react-aria/test-utils';

let items = [
  {
    id: 1,
    title: 'Documents',
    type: 'directory',
    children: [
      {
        id: 2,
        title: 'Project',
        type: 'directory',
        children: [
          {id: 3, title: 'Weekly Report', type: 'file', children: []},
          {id: 4, title: 'Budget', type: 'file', children: []}
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Photos',
    type: 'directory',
    children: [
      {id: 6, title: 'Image 1', type: 'file', children: []},
      {id: 7, title: 'Image 2', type: 'file', children: []}
    ]
  }
];

function TreeViewExample() {
  return (
    <TreeView
      aria-label="Files"
      items={items}
      selectionMode="multiple"
      styles={style({width: 600})}>
      {function renderItem(item) {
        return (
          <TreeViewItem textValue={item.title}>
            <TreeViewItemContent>{item.title}</TreeViewItemContent>
            {/* oxlint-disable-next-line react/react-compiler */}
            <Collection items={item.children}>{renderItem}</Collection>
          </TreeViewItem>
        );
      }}
    </TreeView>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('expands and selects a row via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<TreeViewExample />);

  let tester = testUtilUser.createTester('Tree', {
    root: container.querySelector('[role=treegrid]') as HTMLElement,
    interactionType
  });
  await tester.toggleRowExpansion({row: 'Photos'});
  await tester.toggleRowSelection({row: 'Image 2'});
  let selectedRow = tester.findRow({indexOrText: 'Image 2'});
  expect(selectedRow!.getAttribute('aria-selected')).toBe('true');
});
