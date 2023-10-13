import {action} from '@storybook/addon-actions';
import {ActionMenu} from '@react-spectrum/menu';
import {chain} from '@react-aria/utils';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import File from '@spectrum-icons/illustrations/File';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/illustrations/Folder';
import {Item, ListView} from '../';
import {ItemDropTarget} from '@react-types/shared';
import {items} from './ListView.stories';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useDragAndDrop} from '@react-spectrum/dnd';
import {useListData} from '@react-stately/data';

export function DragExample(props?) {
  let {listViewProps, dragHookOptions} = props;
  let getItems = (keys) => [...keys].map(key => {
    let item = items.find(item => item.key === key);
    return {
      'text/plain': item.name
    };
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems,
    getAllowedDropOperations() {
      props.getAllowedDropOperationsAction?.();
      return ['move', 'cancel'];
    },
    ...dragHookOptions
  });

  return (
    <ListView
      aria-label="draggable list view"
      width="300px"
      selectionMode="multiple"
      items={items}
      disabledKeys={['f']}
      dragAndDropHooks={dragAndDropHooks}
      {...listViewProps}>
      {(item: any) => (
        <Item key={item.key} textValue={item.name} hasChildItems={item.type === 'folder'}>
          {item.type === 'folder' && <Folder />}
          {item.key === 'a' && <File />}
          <Text>
            {item.name}
          </Text>
          {item.key === 'b' && <Text slot="description">Beta</Text>}
          <ActionMenu
            onAction={action('onAction')}>
            <Item key="edit" textValue="Edit">
              <Edit />
              <Text>Edit</Text>
            </Item>
            <Item key="delete" textValue="Delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionMenu>
        </Item>
      )}
    </ListView>
  );
}

let itemList1 = [
  {id: '1', type: 'item', textValue: 'Item One'},
  {id: '2', type: 'item', textValue: 'Item Two'},
  {id: '3', type: 'item', textValue: 'Item Three'},
  {id: '4', type: 'item', textValue: 'Item Four'},
  {id: '5', type: 'item', textValue: 'Item Five'},
  {id: '6', type: 'item', textValue: 'Item Six'}
];

let itemList2 = [
  {id: '7', type: 'item', textValue: 'Item Seven'},
  {id: '8', type: 'item', textValue: 'Item Eight'},
  {id: '9', type: 'item', textValue: 'Item Nine'},
  {id: '10', type: 'item', textValue: 'Item Ten'},
  {id: '11', type: 'item', textValue: 'Item Eleven'},
  {id: '12', type: 'item', textValue: 'Item Twelve'}
];

export function ReorderExample(props) {
  let {onDrop, onDragStart, onDragEnd, disabledKeys = ['2'], ...otherprops} = props;
  let list = useListData({
    initialItems: props.items || itemList1
  });

  // Use a random drag type so the items can only be reordered within this list and not dragged elsewhere.
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
      props.getAllowedDropOperationsAction?.();
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
    <ListView
      aria-label="reorderable list view"
      selectionMode="multiple"
      width="300px"
      height="100%"
      items={list.items}
      disabledKeys={disabledKeys}
      dragAndDropHooks={dragAndDropHooks}
      {...otherprops}>
      {(item: any) => (
        <Item>
          {item.textValue}
        </Item>
      )}
    </ListView>
  );
}

export function DragIntoItemExample(props) {
  let {
    listViewProps = {},
    dragHookOptions = {},
    dropHookOptions = {}
  } = props;
  let {onDragStart, onDragEnd} = dragHookOptions;
  let {onDrop} = dropHookOptions;
  let onDropAction = chain(action('onDrop'), onDrop);
  let getAllowedDropOperationsAction = action('getAllowedDropOperations');

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
      if (target.type === 'root' || target.dropPosition !== 'on' || !list.getItem(target.key).childNodes || disabledKeys.includes(target.key)) {
        return 'cancel';
      }

      return 'move';
    }
  });

  return (
    <ListView
      aria-label="Drop into list view item example"
      selectionMode="multiple"
      width="300px"
      items={list.items}
      disabledKeys={disabledKeys}
      dragAndDropHooks={dragAndDropHooks}
      {...listViewProps}>
      {(item: any) => (
        <Item textValue={item.textValue} hasChildItems={item.type === 'folder'}>
          <Text>{item.type === 'folder' ? `${item.textValue} (Drop items here)` : `Item ${item.textValue}`}</Text>
          {item.type === 'folder' &&
            <>
              <Folder />
              <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
            </>
          }
        </Item>
      )}
    </ListView>
  );
}

export function DragBetweenListsExample(props) {
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
      props.getAllowedDropOperationsAction?.();
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
        <Text alignSelf="center">List 1</Text>
        <ListView
          aria-label="First list view"
          selectionMode="multiple"
          width="300px"
          items={list1.items}
          disabledKeys={['2']}
          dragAndDropHooks={dragAndDropHooks}
          {...props}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 2</Text>
        <ListView
          aria-label="Second list view"
          selectionMode="multiple"
          width="300px"
          items={list2.items}
          disabledKeys={['2']}
          dragAndDropHooks={dragAndDropHooks}
          {...props}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
    </>
  );
}

export function DragBetweenListsRootOnlyExample(props) {
  let {
    listViewProps = {},
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
      props.getAllowedDropOperationsAction?.();
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
      props.getAllowedDropOperationsAction?.();
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
        <Text alignSelf="center">List 1</Text>
        <ListView
          aria-label="First list view"
          selectionMode="multiple"
          width="300px"
          items={list1.items}
          disabledKeys={['2']}
          dragAndDropHooks={dragAndDropHooksFirst}
          {...listViewProps}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">List 2</Text>
        <ListView
          aria-label="Second list view"
          selectionMode="multiple"
          width="300px"
          items={list2.items}
          disabledKeys={['2']}
          dragAndDropHooks={dragAndDropHooksSecond}
          {...listViewProps}>
          {(item: any) => (
            <Item>
              {item.textValue}
            </Item>
        )}
        </ListView>
      </Flex>
    </>
  );
}
