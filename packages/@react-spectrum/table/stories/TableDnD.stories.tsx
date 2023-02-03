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
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
// import {ItemDropTarget} from '@react-types/shared';
import React from 'react';
import {useDragAndDrop} from '@react-spectrum/dnd';
// import {useListData} from '@react-stately/data';

export default {
  title: 'TableView/Drag and Drop',
  component: TableView,
  args: {
    onAction: action('onAction'),
    onResizeStart: action('onResizeStart'),
    onResize: action('onResize'),
    onResizeEnd: action('onResizeEnd'),
    onSelectionChange: action('onSelectionChange'),
    onSortChange: action('onSortChange')
  },
  argTypes: {
    // intentionally added so that we can unset the default value
    // there is no argType for function
    // use the controls reset button to undo it
    // https://storybook.js.org/docs/react/essentials/controls#annotation
    onAction: {
      control: 'select',
      options: [undefined]
    },
    onResizeStart: {
      table: {
        disable: true
      }
    },
    onResize: {
      table: {
        disable: true
      }
    },
    onResizeEnd: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    onSortChange: {
      table: {
        disable: true
      }
    },
    disabledKeys: {
      table: {
        disable: true
      }
    },
    selectedKeys: {
      table: {
        disable: true
      }
    },
    density: {
      control: 'select',
      options: ['compact', 'regular', 'spacious']
    },
    overflowMode: {
      control: 'select',
      options: ['wrap', 'truncate']
    },
    isQuiet: {
      control: 'boolean'
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple']
    },
    selectionStyle: {
      control: 'select',
      options: ['checkbox', 'highlight']
    },
    disallowEmptySelection: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof TableView>;

export type TableStory = ComponentStoryObj<typeof TableView>;

let onSelectionChange = action('onSelectionChange');

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');

function DragExample(props?) {
  let {tableViewProps, dragHookOptions} = props;
  let getItems = (keys) => [...keys].map(key => {
    let item = items.find(item => item.foo === key);
    return {
      'text/plain': item.bar
    };
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems,
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    ...dragHookOptions
  });

  return (
    <TableView aria-label="TableView with dynamic contents" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {item =>
            (<Row key={item.foo}>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
      </TableBody>
    </TableView>
  );
}

// function ReorderExample(props) {
//   let {onDrop, onDragStart, onDragEnd, tableViewProps} = props;
//   let list = useListData({
//     initialItems: props.items || items
//   });

//   // Use a random drag type so the items can only be reordered within this table and not dragged elsewhere.
//   let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

//   let onMove = (keys: React.Key[], target: ItemDropTarget) => {
//     if (target.dropPosition === 'before') {
//       list.moveBefore(target.key, keys);
//     } else {
//       list.moveAfter(target.key, keys);
//     }
//   };

//   let {dragAndDropHooks} = useDragAndDrop({
//     getItems(keys) {
//       return [...keys].map(key => {
//         key = JSON.stringify(key);
//         return {
//           [dragType]: key,
//           'text/plain': key
//         };
//       });
//     },
//     getAllowedDropOperations() {
//       getAllowedDropOperationsAction();
//       return ['move', 'cancel'];
//     },
//     onDragStart: onDragStart,
//     onDragEnd: onDragEnd,
//     async onDrop(e) {
//       onDrop(e);
//       if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
//         let keys = [];
//         for (let item of e.items) {
//           if (item.kind === 'text') {
//             let key;
//             if (item.types.has(dragType)) {
//               key = JSON.parse(await item.getText(dragType));
//               keys.push(key);
//             } else if (item.types.has('text/plain')) {
//               // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
//               // Multiple drag items are contained in a single string so we need to split them out
//               key = await item.getText('text/plain');
//               keys = key.split('\n').map(val => val.replaceAll('"', ''));
//             }
//           }
//         }
//         onMove(keys, e.target);
//       }
//     },
//     getDropOperation(target) {
//       if (target.type === 'root' || target.dropPosition === 'on') {
//         return 'cancel';
//       }

//       return 'move';
//     }
//   });

//   return (
//     <TableView aria-label="Reorderable TableView" selectionMode="multiple" width={300} height={200} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
//       <TableHeader columns={columns}>
//         {column => <Column>{column.name}</Column>}
//       </TableHeader>
//       <TableBody items={items}>
//         {item =>
//             (<Row key={item.foo}>
//               {key => <Cell>{item[key]}</Cell>}
//             </Row>)
//         }
//       </TableBody>
//     </TableView>
//   );
// }

export const DragOutOfTable: TableStory = {
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

// export const DragWithinTable: TableStory = {
//   render: (args) => (
//     <Flex direction="row" wrap alignItems="center">
//       <ReorderExample tableViewProps={args} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
//     </Flex>
//   ),
//   storyName: 'Drag within table (Reorder)'
// };
