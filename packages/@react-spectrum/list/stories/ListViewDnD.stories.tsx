import {action} from '@storybook/addon-actions';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {DragBetweenListsExample, DragBetweenListsRootOnlyExample, DragExample, DragIntoItemExample, ReorderExample} from './ListViewDnDExamples';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import {ListView} from '../';
import React from 'react';
import {View} from '@react-spectrum/view';

export default {
  title: 'ListView/Drag and Drop',
  component: ListView,
  args: {
    isQuiet: false,
    density: 'regular',
    selectionMode: 'multiple',
    selectionStyle: 'checkbox',
    overflowMode: 'truncate',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionStyle: {
      control: 'radio',
      options: ['checkbox', 'highlight']
    },
    isQuiet: {
      control: 'boolean'
    },
    density: {
      control: 'select',
      options: ['compact', 'regular', 'spacious']
    },
    overflowMode: {
      control: 'radio',
      options: ['truncate', 'wrap']
    },
    disabledBehavior: {
      control: 'radio',
      options: ['selection', 'all']
    }
  }
} as ComponentMeta<typeof ListView>;

export type ListViewStory = ComponentStoryObj<typeof ListView>;
let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');

export const DragOut: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input aria-label="input before" />
      <Droppable />
      <DragExample
        dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}}
        listViewProps={args} />
    </Flex>
  ),
  name: 'Drag out of list'
};

export const CustomDragPreview: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input aria-label="input before" />
      <Droppable />
      <DragExample
        dragHookOptions={{
          onDragStart: action('dragStart'),
          onDragEnd: action('dragEnd'),
          renderPreview: (keys, draggedKey) => (
            <View backgroundColor="gray-50" padding="size-100" borderRadius="medium" borderWidth="thin" borderColor="blue-500">
              <strong>Custom Preview</strong>
              <div>Keys: [{[...keys].join(', ')}]</div>
              <div>Dragged: {draggedKey}</div>
            </View>
          )}}
        listViewProps={args} />
    </Flex>
  ),
  name: 'Custom drag preview'
};

export const DragWithin: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <ReorderExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within list (Reorder}'
};

export const DragWithinScroll: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" height={100}>
      <ReorderExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within list scrolling (Reorder)'
};

let manyItems: {id: string, type: string, textValue: string}[] = [];
for (let i = 0; i < 100; i++) {
  manyItems.push({id: 'item' + i, type: 'item', textValue: 'Item ' + i});
}

export const DragWithinMany: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center" height={400}>
      <ReorderExample {...args} items={manyItems} getAllowedDropOperationsAction={getAllowedDropOperationsAction} disabledKeys={['1']} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  name: 'Drag within list with many items'
};

export const DragIntoFolder: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragIntoItemExample getAllowedDropOperationsAction={getAllowedDropOperationsAction} listViewProps={args} />
    </Flex>
  ),
  name: 'Drag into folder'
};

export const DragBetween: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenListsExample {...args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} />
    </Flex>
  ),
  name: 'Drag between lists'
};

export const DragBetweenRootOnly: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenListsRootOnlyExample listViewProps={args} getAllowedDropOperationsAction={getAllowedDropOperationsAction} />
    </Flex>
  ),
  name: 'Drag between lists (Root only)',
  parameters: {
    description: {
      data: 'Folders are non-draggable.'
    }
  }
};

export const DraggableOnAction: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input aria-label="input before" />
      <Droppable />
      <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    </Flex>
  ),
  name: 'draggable rows, onAction',
  parameters: {
    description: {
      data: 'Folders are non-draggable.'
    }
  }
};

export const DraggableCopyLink: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input aria-label="input before" />
      <Droppable />
      <DragExample listViewProps={{onAction: action('onAction'), ...args}} dragHookOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd'), getAllowedDropOperations: () => { getAllowedDropOperationsAction(); return ['copy', 'link', 'cancel'];}}} />
    </Flex>
  ),
  name: 'draggable rows, allow copy and link',
  parameters: {
    description: {
      data: 'Allows copy, link, and cancel operations. Copy should be the default operation, and link should be the operation when the CTRL key is held while dragging.'
    }
  }
};
