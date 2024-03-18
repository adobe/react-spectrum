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
import {ComponentMeta} from '@storybook/react';
import defaultConfig, {TableStory} from './Table.stories';
import {DragBetweenTablesComplex, DragBetweenTablesOverride, DragExampleUtilHandlers, FinderDropUtilHandlers, InsertExampleUtilHandlers, ItemDropExampleUtilHandlers, ReorderExampleUtilHandlers, RootDropExampleUtilHandlers} from './TableDnDUtilExamples';
import {Droppable} from '../../../@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {TableView} from '..';

export default {
  ...defaultConfig,
  title: 'TableView/Drag and Drop/Util Handlers'
} as ComponentMeta<typeof TableView>;

// Known accessibility issue that will be caught by aXe: https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives#tableview
export const DragOutOfTable: TableStory = {
  args: {
    disabledKeys: ['2']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <Droppable />
      <DragExampleUtilHandlers tableViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    </Flex>
  ),
  name: 'drag out of table'
};

export const DragWithinTable: TableStory = {
  args: {
    disabledKeys: ['2']
  },
  render: (args) => (
    <ReorderExampleUtilHandlers tableViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
  ),
  name: 'drag within table (reorder)'
};

export const DragOntoRow: TableStory = {
  args: {
    disabledKeys: ['2']
  },
  render: (args) => (
    <ItemDropExampleUtilHandlers tableViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
  ),
  name: 'drop onto row/folder',
  parameters: {
    description: {
      data: 'Allows dropping on items and folders. Dropping on a item is a no op (action fires still). Dropping external items is also a no op'
    }
  }
};

export const DropOntoRoot: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <RootDropExampleUtilHandlers tableViewProps={args} firstTableDnDOptions={{onDragStart: action('dragStart')}} />
    </Flex>
  ),
  name: 'drop onto root',
  parameters: {
    description: {data: 'Allows one way dragging from first table to root of second table. Copy and link operations shouldnt remove items from the first table'}
  }
};

export const DropBetweenRows: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <InsertExampleUtilHandlers tableViewProps={args} firstTableDnDOptions={{onDragStart: action('dragStart')}} />
  ),
  name: 'drop between rows',
  parameters: {
    description: {data: 'Allows one way dragging from first table to between items of second table. Copy and link operations shouldnt remove items from the first table'}
  }
};

export const AllowsDirectoriesAndFilesFromFinder: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <FinderDropUtilHandlers tableViewProps={args} />
    </Flex>
  ),
  name: 'allows directories and files from finder',
  parameters: {
    description: {data: 'The first table should allow only directory drops (e.g. folders from finder). The second table should allow all drag type drops (directory/files from finder, any drag items).'}
  }
};

export const ComplexDragBetweenTables: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <DragBetweenTablesComplex
      tableViewProps={args}
      firstTableDnDOptions={{
        onDragStart: action('dragStartTable1')
      }}
      secondTableDnDOptions={{
        onDragStart: action('dragStartTable2')
      }} />
  ),
  name: 'complex drag between tables',
  parameters: {
    description: {data: 'The first table should allow dragging and drops into its folder, but disallow reorder operations. External root drops should be placed at the end of the list. The second table should allow all operations and root drops should be placed at the top of the table. Move and copy operations are allowed. The invalid drag item should be able to be dropped in either table if accompanied by other valid drag items.'}
  }
};

export const UsingGetDropOperations: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <DragBetweenTablesComplex
      tableViewProps={args}
      firstTableDnDOptions={{
        onDragStart: action('dragStartTable1'),
        getDropOperation: (_, __, allowedOperations) => allowedOperations.filter(op => op !== 'move')[0],
        getAllowedDropOperations: () => ['link']
      }}
      secondTableDnDOptions={{
        onDragStart: action('dragStartTable2'),
        getDropOperation: (_, __, allowedOperations) => allowedOperations.filter(op => op !== 'move')[0],
        getAllowedDropOperations: () => ['move', 'copy', 'link']
      }} />
  ),
  name: 'using getDropOperations to determine default drop operation',
  parameters: {
    description: {data: 'Dragging from the first to the second table should automatically set a link operation and all other drop operations should be disabled. Dragging from the second to first table should support copy and link operations, with copy being the default.'}
  }
};

export const OverrideUtilHandlers: TableStory = {
  args: {
    disabledKeys: ['2', '8']
  },
  render: (args) => (
    <DragBetweenTablesOverride {...args} />
  ),
  name: 'util handlers overridden by onDrop and getDropOperations',
  parameters: {
    description: {data: 'The first table should be draggable, the second table should only be root droppable. No actions for onRootDrop, onReorder, onItemDrop, or onInsert should appear in the storybook actions panel.'}
  }
};
