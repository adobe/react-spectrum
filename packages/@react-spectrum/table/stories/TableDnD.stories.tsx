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
import {chain} from '@react-aria/utils';
import {ComponentMeta} from '@storybook/react';
import defaultConfig from './Table.stories';
import {Droppable} from '@react-aria/dnd/stories/dnd.stories';
import {Flex} from '@react-spectrum/layout';
import {ItemDropTarget} from '@react-types/shared';
import React from 'react';
import {TableStory} from './Table.stories';
import {Text} from '@react-spectrum/text';
import {useDragAndDrop} from '@react-spectrum/dnd';
import {useListData} from '@react-stately/data';

export default {
  ...defaultConfig,
  title: 'TableView/Drag and Drop'
} as ComponentMeta<typeof TableView>;

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

export const DragWithinTable: TableStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <ReorderExample tableViewProps={args} onDrop={action('drop')} onDragStart={action('dragStart')} onDragEnd={action('dragEnd')} />
    </Flex>
  ),
  storyName: 'Drag within table (Reorder)'
};

export const DragOntoRow: TableStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragOntoRowExample tableViewProps={args} />
    </Flex>
  ),
  storyName: 'Drag onto row',
  parameters: {
    description: {
      content: 'Drag item types onto folder types.'
    }
  }
};

export const DragBetweenTables: TableStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenTablesExample {...args} />
    </Flex>
  ),
  storyName: 'Drag between tables'
};

export const DragBetweenTablesRootOnly: TableStory = {
  render: (args) => (
    <Flex direction="row" wrap alignItems="center">
      <DragBetweenTablesRootOnlyExample tableViewProps={args} />
    </Flex>
  ),
  storyName: 'Drag between tables (Root only)'
};

export const DraggableRowsCopyLink: TableStory = {
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
    <TableView aria-label="TableView with dragging enabled" selectionMode="multiple" width={300} height={200} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row key={item.foo} textValue={item.foo}>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

function ReorderExample(props) {
  let {onDrop, onDragStart, onDragEnd, tableViewProps} = props;
  let list = useListData({
    initialItems: items,
    getKey: item => item.foo
  });

  // Use a random drag type so the items can only be reordered within this table and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    if (target.dropPosition === 'before') {
      list.moveBefore(target.key, keys);
    } else {
      list.moveAfter(target.key, keys);
    }
  };

  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: onDragStart,
    onDragEnd: onDragEnd,
    async onDrop(e) {
      onDrop(e);
      if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, e.target);
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <TableView aria-label="Reorderable TableView" selectionMode="multiple" width={300} height={200} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row key={item.foo} textValue={item.foo}>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

function DragOntoRowExample(props) {
  let {
    tableViewProps = {},
    dragHookOptions = {},
    dropHookOptions = {}
  } = props;
  let {onDragStart, onDragEnd} = dragHookOptions;
  let {onDrop} = dropHookOptions;
  let onDropAction = chain(action('onDrop'), onDrop);
  let getAllowedDropOperationsAction = action('getAllowedDropOperations');

  let columns = [
    {name: 'ID', key: 'id'},
    {name: 'Type', key: 'type'},
    {name: 'Text', key: 'textValue'},
    {name: 'Child Nodes', key: 'childNodes'}
  ];

  let list = useListData({
    initialItems: [
      {id: '0', type: 'folder', textValue: 'Folder 1', childNodes: []},
      {id: '1', type: 'item', textValue: 'One'},
      {id: '2', type: 'item', textValue: 'Two'},
      {id: '3', type: 'item', textValue: 'Three'},
      {id: '4', type: 'item', textValue: 'Four'},
      {id: '5', type: 'item', textValue: 'Five'},
      {id: '6', type: 'item', textValue: 'Six'},
      {id: '7', type: 'folder', textValue: 'Folder disabled', childNodes: []},
      {id: '8', type: 'folder', textValue: 'Folder 2', childNodes: []}
    ]
  });
  let disabledKeys: React.Key[] = ['2', '7'];

  // Use a random drag type so the items can only be reordered within this list and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    let folderItem = list.getItem(target.key);
    let draggedItems = keys.map((key) => list.getItem(key));
    list.update(target.key, {...folderItem, childNodes: [...folderItem.childNodes, ...draggedItems]});
    list.remove(...keys);
  };

  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type !== 'root' && e.target.dropPosition === 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        if (!keys.includes(e.target.key)) {
          onMove(keys, e.target);
        }
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition !== 'on' || !list.getItem(target.key)?.childNodes || disabledKeys.includes(target.key)) {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <TableView aria-label="Drag onto table row example" selectionMode="multiple" dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row key={item.id} textValue={item.textValue}>
            <Cell>{item.id}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.textValue}</Cell>
            <Cell>
              {item.type === 'folder' ? `${item.childNodes.length} dropped items` : '-'}
            </Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

let itemList1 = [
  {id: '1', type: 'item', name: 'Item One'},
  {id: '2', type: 'item', name: 'Item Two'},
  {id: '3', type: 'item', name: 'Item Three'},
  {id: '4', type: 'item', name: 'Item Four'},
  {id: '5', type: 'item', name: 'Item Five'},
  {id: '6', type: 'item', name: 'Item Six'}
];

let itemList2 = [
  {id: '7', type: 'item', name: 'Item Seven'},
  {id: '8', type: 'item', name: 'Item Eight'},
  {id: '9', type: 'item', name: 'Item Nine'},
  {id: '10', type: 'item', name: 'Item Ten'},
  {id: '11', type: 'item', name: 'Item Eleven'},
  {id: '12', type: 'item', name: 'Item Twelve'}
];

let itemColumns = [
  {name: 'ID', key: 'id'},
  {name: 'Type', key: 'type'},
  {name: 'Name', key: 'name'}
];

function DragBetweenTablesExample(props) {
  let {onDragStart, onDragEnd, onDrop} = props;
  let onDropAction = chain(action('onDrop'), onDrop);
  onDragStart = chain(action('dragStart'), onDragStart);
  onDragEnd = chain(action('dragEnd'), onDragEnd);

  let list1 = useListData({
    initialItems: props.items1 || itemList1
  });

  let list2 = useListData({
    initialItems: props.items2 || itemList2
  });

  let onMove = (keys: React.Key[], target: ItemDropTarget) => {
    let sourceList = list1.getItem(keys[0]) ? list1 : list2;
    let destinationList = list1.getItem(target.key) ? list1 : list2;

    if (sourceList === destinationList) {
        // Handle dragging within same list
      if (target.dropPosition === 'before') {
        sourceList.moveBefore(target.key, keys);
      } else {
        sourceList.moveAfter(target.key, keys);
      }
    } else {
      // Handle dragging between lists
      if (target.dropPosition === 'before') {
        destinationList.insertBefore(target.key, ...keys.map(key => sourceList.getItem(key)));
      } else {
        destinationList.insertAfter(target.key, ...keys.map(key => sourceList.getItem(key)));
      }
      sourceList.remove(...keys);
    }
  };

  // Use a random drag type so the items can only be reordered within the two lists and not dragged elsewhere.
  let dragType = React.useMemo(() => `keys-${Math.random().toString(36).slice(2)}`, []);

  let {dragAndDropHooks} = useDragAndDrop({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          [dragType]: key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart,
    onDragEnd,
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type !== 'root' && e.target.dropPosition !== 'on') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has(dragType)) {
              key = JSON.parse(await item.getText(dragType));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, e.target);
      }
    },
    getDropOperation(target) {
      if (target.type === 'root' || target.dropPosition === 'on') {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooks} {...props}>
          <TableHeader columns={itemColumns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item: any) => (
              <Row key={item.id} textValue={item.name}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooks} {...props}>
          <TableHeader columns={itemColumns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item: any) => (
              <Row key={item.id} textValue={item.name}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

function DragBetweenTablesRootOnlyExample(props) {
  let {
    tableViewProps = {},
    dragHookOptions = {},
    dropHookOptions = {}
  } = props;
  let {onDragStart, onDragEnd} = dragHookOptions;
  let {onDrop} = dropHookOptions;
  let onDropAction = chain(action('onDrop'), onDrop);

  let list1 = useListData({
    initialItems: props.items1 || itemList1
  });

  let list2 = useListData({
    initialItems: props.items2 || itemList2
  });

  let onMove = (keys: React.Key[], destinationList) => {
    let sourceList = list1.getItem(keys[0]) ? list1 : list2;

    let items = keys.map(key => sourceList.getItem(key));
    sourceList.remove(...keys);
    destinationList.append(...items);
  };

  let {dragAndDropHooks: dragAndDropHooksFirst} = useDragAndDrop({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          'list1': key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type === 'root') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has('list2')) {
              key = JSON.parse(await item.getText('list2'));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, list1);
      }
    },
    getDropOperation(target, types) {
      if (target.type === 'root' && (types.has('list2') || types.has('text/plain'))) {
        return 'move';
      }

      return 'cancel';
    }
  });

  let {dragAndDropHooks: dragAndDropHooksSecond} = useDragAndDrop({
    getItems(keys) {
      return [...keys].map(key => {
        key = JSON.stringify(key);
        return {
          'list2': key,
          'text/plain': key
        };
      });
    },
    getAllowedDropOperations() {
      getAllowedDropOperationsAction();
      return ['move', 'cancel'];
    },
    onDragStart: chain(action('dragStart'), onDragStart),
    onDragEnd: chain(action('dragEnd'), onDragEnd),
    onDrop: async e => {
      onDropAction(e);
      if (e.target.type === 'root') {
        let keys = [];
        for (let item of e.items) {
          if (item.kind === 'text') {
            let key;
            if (item.types.has('list1')) {
              key = JSON.parse(await item.getText('list1'));
              keys.push(key);
            } else if (item.types.has('text/plain')) {
              // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
              // Multiple drag items are contained in a single string so we need to split them out
              key = await item.getText('text/plain');
              keys = key.split('\n').map(val => val.replaceAll('"', ''));
            }
          }
        }
        onMove(keys, list2);
      }
    },
    getDropOperation(target, types) {
      if (target.type === 'root' && (types.has('list1') || types.has('text/plain'))) {
        return 'move';
      }

      return 'cancel';
    }
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksFirst} {...tableViewProps}>
          <TableHeader columns={itemColumns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item: any) => (
              <Row key={item.id} textValue={item.name}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksSecond} {...tableViewProps}>
          <TableHeader columns={itemColumns}>
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item: any) => (
              <Row key={item.id} textValue={item.name}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}
