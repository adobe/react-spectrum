import {action} from '@storybook/addon-actions';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {DragBetweenListsComplex, DragBetweenListsOverride, DragExampleUtilHandlers, FinderDropUtilHandlers, InsertExampleUtilHandlers, ItemDropExampleUtilHandlers, ReorderExampleUtilHandlers, RootDropExampleUtilHandlers} from './ListViewDnDUtilExamples';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import {ListView} from '../';
import React from 'react';

export default {
  title: 'ListView/Drag and Drop/Util Handlers',
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
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionStyle: {
      control: {
        type: 'radio',
        options: ['checkbox', 'highlight']
      }
    },
    isQuiet: {
      control: {type: 'boolean'}
    },
    density: {
      control: {
        type: 'select',
        options: ['compact', 'regular', 'spacious']
      }
    },
    overflowMode: {
      control: {
        type: 'radio',
        options: ['truncate', 'wrap']
      }
    },
    disabledBehavior: {
      control: {
        type: 'radio',
        options: ['selection', 'all']
      }
    }
  }
} as ComponentMeta<typeof ListView>;

export type ListViewStory = ComponentStoryObj<typeof ListView>;

export const DragOut: ListViewStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <input />
      <Droppable />
      <DragExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
    </Flex>
  ),
  name: 'Drag out of list'
};

export const DragWithin: ListViewStory = {
  render: (args) => (
    <ReorderExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
  ),
  name: 'Drag within list (Reorder}'
};

export const DropOntoItem: ListViewStory = {
  render: (args) => (
    <ItemDropExampleUtilHandlers listViewProps={args} dndOptions={{onDragStart: action('dragStart'), onDragEnd: action('dragEnd')}} />
  ),
  name: 'drop onto item/folder',
  parameters: {
    description: {
      data: 'Allows dropping on items and folders. Dropping on a item is a no op (action fires still). Dropping external items is also a no op'
    }
  }
};

export const DropOntoRoot: ListViewStory = {
  render: (args) => (
    <RootDropExampleUtilHandlers listViewProps={args} firstListDnDOptions={{onDragStart: action('dragStart')}} />
  ),
  name: 'drop onto root',
  parameters: {
    description: {
      data: 'Allows one way dragging from first list to root of second list. Copy and link operations shouldnt remove items from the first list'
    }
  }
};

export const DropBetween: ListViewStory = {
  render: (args) => (
    <InsertExampleUtilHandlers listViewProps={args} firstListDnDOptions={{onDragStart: action('dragStart')}} />
  ),
  name: 'drop between items',
  parameters: {
    description: {
      data: 'Allows one way dragging from first list to between items of second list. Copy and link operations shouldnt remove items from the first list'
    }
  }
};

export const DirectoryFileDrop: ListViewStory = {
  render: (args) => (
    <FinderDropUtilHandlers listViewProps={args} />
  ),
  name: 'allows directories and files from finder',
  parameters: {
    description: {
      data: 'The first list should allow only directory drops (e.g. folders from finder). The second list should allow all drag type drops (directory/files from finder, any drag items).'
    }
  }
};

export const Complex: ListViewStory = {
  render: (args) => (
    <DragBetweenListsComplex
      listViewProps={args}
      firstListDnDOptions={{
        onDragStart: action('dragStartList1')
      }}
      secondListDnDOptions={{
        onDragStart: action('dragStartList2')
      }} />
  ),
  name: 'complex drag between lists',
  parameters: {
    description: {
      data: 'The first list should allow dragging and drops into its folder, but disallow reorder operations. External root drops should be placed at the end of the list. The second list should allow all operations and root drops should be placed at the top of the list. Move and copy operations are allowed. The invalid drag item should be able to be dropped in either list if accompanied by other valid drag items.'
    }
  }
};

export const GetDropOperationDefault: ListViewStory = {
  render: (args) => (
    <DragBetweenListsComplex
      listViewProps={args}
      firstListDnDOptions={{
        onDragStart: action('dragStartList1'),
        getDropOperation: (_, __, allowedOperations) => allowedOperations.filter(op => op !== 'move')[0],
        getAllowedDropOperations: () => ['link']
      }}
      secondListDnDOptions={{
        onDragStart: action('dragStartList2'),
        getDropOperation: (_, __, allowedOperations) => allowedOperations.filter(op => op !== 'move')[0],
        getAllowedDropOperations: () => ['move', 'copy', 'link']
      }} />
  ),
  name: 'using getDropOperations to determine default drop operation',
  parameters: {
    description: {
      data: 'Dragging from the first to the second list should automatically set a link operation and all other drop operations should be disabled. Dragging from the second to first list should support copy and link operations, with copy being the default.'
    }
  }
};

export const UtilOverride: ListViewStory = {
  render: (args) => (
    <DragBetweenListsOverride {...args} />
  ),
  name: 'util handlers overridden by onDrop and getDropOperations',
  parameters: {
    description: {
      data: 'The first list should be draggable, the second list should only be root droppable. No actions for onRootDrop, onReorder, onItemDrop, or onInsert should appear in the storybook actions panel.'
    }
  }
};
