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
import defaultConfig from './Table.stories';
import {DragBetweenTablesExample, DragBetweenTablesRootOnlyExample, DragExample, DragOntoRowExample, ReorderExample} from './TableDnDExamples';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {TableStory} from './Table.stories';
import {TableView} from '../';

export default {
  ...defaultConfig,
  title: 'TableView/Drag and Drop'
} as ComponentMeta<typeof TableView>;

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
  storyName: 'Drag out of table'
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
  storyName: 'Drag within table (Reorder)'
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
  storyName: 'Drag onto row',
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
  storyName: 'Drag between tables'
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
  storyName: 'Drag between tables (Root only)'
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
  storyName: 'draggable rows, allow copy and link',
  parameters: {
    description: {data: 'Allows copy, link, and cancel operations. Copy should be the default operation, and link should be the operation when the CTRL key is held while dragging.'}
  }
};

let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');
