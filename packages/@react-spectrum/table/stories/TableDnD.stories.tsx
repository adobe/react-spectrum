/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import defaultConfig, {TableStory} from './Table.stories';
import {Divider} from '@react-spectrum/divider';
import {DragBetweenTablesExample, DragBetweenTablesRootOnlyExample, DragExample, DragOntoRowExample, DragWithoutRowHeaderExample, items, ReorderExample} from './TableDnDExamples';
import {Droppable} from '../../../@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import {Meta} from '@storybook/react';
import React from 'react';
import {TableView} from '../';
import {View} from '@react-spectrum/view';

export default {
  ...defaultConfig,
  title: 'TableView/Drag and Drop'
} as Meta<typeof TableView>;

// Known accessibility issue that will be caught by aXe: https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives#tableview
export const DragOutOfTable: TableStory = {
  args: {
    disabledKeys: ['Foo 2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" gap="size-200">
      <Droppable />
      <DragExample
        dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}}
        tableViewProps={args} />
    </Flex>
  ),
  name: 'Drag out of table'
};

export const DragOutOfTableWithoutTableHeader: TableStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" gap="size-200">
      <Droppable />
      <DragWithoutRowHeaderExample
        dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}}
        tableViewProps={args} />
    </Flex>
  ),
  name: 'Drag out of table without table header'
};

export const CustomDragPreview: TableStory = {
  args: {
    disabledKeys: ['Foo 2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" gap="size-200">
      <Droppable />
      <DragExample
        dragHookOptions={{
          onDragStart: action('dragStart'),
          onDragEnd: action('dragEnd'),
          renderPreview: (keys, draggedKey) => (
            <View backgroundColor="gray-50" padding="size-100" borderRadius="medium" borderWidth="thin" borderColor="blue-500">
              <strong>Custom Preview</strong>
              <Divider size="S" />
              <div>Keys: [{[...keys].join(', ')}]</div>
              <div>Dragged: {draggedKey}</div>
            </View>
          )}}
        tableViewProps={args} />
    </Flex>
  ),
  name: 'Custom drag preview'
};

export const DragWithinTable: TableStory = {
  args: {
    disabledKeys: ['Foo 2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <ReorderExample tableViewProps={args} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within table (Reorder)'
};

let manyItems: typeof items = [];
for (let i = 0; i < 100; i++) {
  manyItems.push({...items[i % 10], id: `${i}`});
}

export const DragWithinTableManyItems: TableStory = {
  args: {
    disabledKeys: ['Foo 2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <ReorderExample items={manyItems} tableViewProps={args} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within table many items'
};

export const DragOntoRow: TableStory = {
  args: {
    disabledKeys: ['1']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragOntoRowExample tableViewProps={args} />
    </Flex>
  ),
  name: 'Drag onto row',
  parameters: {
    description: {
      data: 'Drag item types onto folder types.'
    }
  }
};

export const DragBetweenTables: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenTablesExample {...args} />
    </Flex>
  ),
  name: 'Drag between tables'
};

export const DragBetweenTablesRootOnly: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenTablesRootOnlyExample tableViewProps={args} />
    </Flex>
  ),
  name: 'Drag between tables (Root only)'
};

export const DraggableRowsCopyLink: TableStory = {
  args: {
    disabledKeys: ['Foo 2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <Droppable />
      <DragExample tableViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd'), getAllowedDropOperations: () => { getAllowedDropOperationsAction(); return ['copy', 'link', 'cancel'];}}} />
    </Flex>
  ),
  name: 'draggable rows, allow copy and link',
  parameters: {
    description: {data: 'Allows copy, link, and cancel operations. Copy should be the default operation, and link should be the operation when the CTRL key is held while dragging.'}
  }
};

let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');
