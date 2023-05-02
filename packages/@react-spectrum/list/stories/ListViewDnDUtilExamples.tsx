import {action} from '@storybook/addon-actions';
import {DIRECTORY_DRAG_TYPE} from '@react-aria/dnd';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/illustrations/Folder';
import {Item, ListSection, ListView} from '../';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useDragAndDrop} from '@react-spectrum/dnd';
import {useListData, useTreeData} from '@react-stately/data';

let itemProcessor = async (items, acceptedDragTypes) => {
  let processedItems = [];
  let text;
  for (let item of items) {
    for (let type of acceptedDragTypes) {
      if (item.kind === 'text' && item.types.has(type)) {
        text = await item.getText(type);
        processedItems.push(JSON.parse(text));
        break;
      } else if (item.types.size === 1 && item.types.has('text/plain')) {
        // Fallback for Chrome Android case: https://bugs.chromium.org/p/chromium/issues/detail?id=1293803
        // Multiple drag items are contained in a single string so we need to split them out
        text = await item.getText('text/plain');
        processedItems = text.split('\n').map(val => JSON.parse(val));
        break;
      }
    }
  }
  return processedItems;
};

let folderList1 = [
  {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
  {identifier: '2', type: 'file', name: 'Adobe XD'},
  {identifier: '3', type: 'folder', name: 'Documents',  childNodes: []},
  {identifier: '4', type: 'file', name: 'Adobe InDesign'},
  {identifier: '5', type: 'folder', name: 'Utilities',  childNodes: []},
  {identifier: '6', type: 'file', name: 'Adobe AfterEffects'}
];

let folderList2 = [
  {identifier: '7', type: 'folder', name: 'Pictures',  childNodes: []},
  {identifier: '8', type: 'file', name: 'Adobe Fresco'},
  {identifier: '9', type: 'folder', name: 'Apps',  childNodes: []},
  {identifier: '10', type: 'file', name: 'Adobe Illustrator'},
  {identifier: '11', type: 'file', name: 'Adobe Lightroom'},
  {identifier: '12', type: 'file', name: 'Adobe Dreamweaver'},
  {identifier: '13', type: 'unique_type', name: 'invalid drag item'}
];

export function DragExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Draggable ListView with dnd hook util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dragAndDropHooks={dragAndDropHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
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

export function ReorderExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorder')(e);

      let itemsToCopy = [];
      if (dropOperation === 'copy') {
        for (let key of keys) {
          let item = {...list.getItem(key)};
          item.identifier = Math.random().toString(36).slice(2);
          itemsToCopy.push(item);
        }
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          list.moveBefore(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list.moveAfter(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Reorderable ListView from util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dragAndDropHooks={dragAndDropHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
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

export function ItemDropExampleUtilHandlers(props) {
  let {listViewProps, dndOptions} = props;
  let list = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDrop')(e);
      if (isInternal) {
        let processedItems = await itemProcessor(items, acceptedDragTypes);
        let targetItem = list.getItem(target.key);
        if (targetItem?.childNodes != null) {
          list.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});
          if (isInternal && dropOperation === 'move') {
            let keysToRemove = processedItems.map(item => item.identifier);
            list.remove(...keysToRemove);
          }
        }
      }
    },
    acceptedDragTypes,
    ...dndOptions
  });

  return (
    <ListView
      aria-label="Item and folder droppable ListView from dnd hook util handlers"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      {...listViewProps}
      dragAndDropHooks={dragAndDropHooks}>
      {(item: any) => (
        <Item textValue={item.name} key={item.identifier}>
          <Text>{item.name}</Text>
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

export function RootDropExampleUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks: list1Hooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEnd')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    acceptedDragTypes,
    ...firstListDnDOptions
  });

  let {dragAndDropHooks: list2Hooks} = useDragAndDrop({
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.append(...processedItems);
    },
    acceptedDragTypes,
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable ListView"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dragAndDropHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Root droppable ListView from dnd hook util handlers"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dragAndDropHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

export function InsertExampleUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks: list1Hooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEnd')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    acceptedDragTypes,
    ...firstListDnDOptions
  });

  let {dragAndDropHooks: list2Hooks} = useDragAndDrop({
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    acceptedDragTypes,
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable ListView"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dragAndDropHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Insert droppable ListView from dnd hook util handlers"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dragAndDropHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

export function FinderDropUtilHandlers(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let {dragAndDropHooks: list1Hooks} = useDragAndDrop({
    acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
    onInsert: async (e) => {
      action('onInsertList1')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropList1')(e);
    },
    ...firstListDnDOptions
  });

  let {dragAndDropHooks: list2Hooks} = useDragAndDrop({
    onInsert: async (e) => {
      action('onInsertList2')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropList2')(e);
    },
    acceptedDragTypes: 'all',
    ...secondListDnDOptions
  });

  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="ListView that accepts directory drops only"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dragAndDropHooks={list1Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="ListView that accepts all drag types"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dragAndDropHooks={list2Hooks}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

export function DragBetweenListsComplex(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];

  // List 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dragAndDropHooks: dragAndDropHooksList1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...processedItems);
      }

    },
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list1.append(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list1.getItem(target.key);
      list1.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});

      if (isInternal && dropOperation === 'move') {
        // TODO test this, perhaps it would be easier to also pass the draggedKeys to onItemDrop instead?
        // TODO: dig into other libraries to see how they handle this
        let keysToRemove = processedItems.map(item => item.identifier);
        list1.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList1')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key).childNodes,
    ...firstListDnDOptions
  });

  // List 2 should allow reordering, on folder drops, and on root drops
  let {dragAndDropHooks: dragAndDropHooksList2} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list2.getItem(key);
      let dragItem = {};
      let itemString = JSON.stringify(item);
      dragItem[`${item.type}`] = itemString;
      if (item.type !== 'unique_type') {
        dragItem['text/plain'] = itemString;
      }

      return dragItem;
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorderList2')(e);

      let itemsToCopy = [];
      if (dropOperation === 'copy') {
        for (let key of keys) {
          let item = {...list2.getItem(key)};
          item.identifier = Math.random().toString(36).slice(2);
          itemsToCopy.push(item);
        }
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          list2.moveBefore(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list2.moveAfter(target.key, [...keys]);
        } else if (dropOperation === 'copy') {
          list2.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList2')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.prepend(...processedItems);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let targetItem = list2.getItem(target.key);
      list2.update(target.key, {...targetItem, childNodes: [...targetItem.childNodes, ...processedItems]});

      if (isInternal && dropOperation === 'move') {
        let keysToRemove = processedItems.map(item => item.identifier);
        list2.remove(...keysToRemove);
      }
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList2')(e);
      if (dropOperation === 'move' && !isInternal) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key).type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key).childNodes,
    ...secondListDnDOptions
  });


  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="First ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dragAndDropHooks={dragAndDropHooksList1}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="Second ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dragAndDropHooks={dragAndDropHooksList2}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

export function DragBetweenListsOverride(props) {
  let list1 = useListData({
    initialItems: [
      {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
      {identifier: '2', type: 'file', name: 'Adobe XD'},
      {identifier: '3', type: 'file', name: 'Adobe InDesign'},
      {identifier: '4', type: 'file', name: 'Adobe AfterEffects'}
    ],
    getKey: (item) => item.identifier
  });

  let list2 = useListData({
    initialItems: [
      {identifier: '7', type: 'folder', name: 'Pictures',  childNodes: []},
      {identifier: '8', type: 'file', name: 'Adobe Fresco'},
      {identifier: '9', type: 'folder', name: 'Apps',  childNodes: []},
      {identifier: '10', type: 'file', name: 'Adobe Illustrator'},
      {identifier: '11', type: 'file', name: 'Adobe Lightroom'},
      {identifier: '12', type: 'file', name: 'Adobe Dreamweaver'}
    ],
    getKey: (item) => item.identifier
  });

  let {dragAndDropHooks: dragAndDropHooksList1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      let dragType = `list-1-adobe-${item.type}`;
      return {
        [`${dragType}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onDragEnd: (e) => {
      action('onDragEnd')(e);
      if (e.dropOperation === 'move') {
        list1.remove(...e.keys);
      }
    }
  });

  let {dragAndDropHooks: dragAndDropHooksList2} = useDragAndDrop({
    getDropOperation: (target, types) => {
      if (target.type !== 'root' || !(types.has('list-1-adobe-file') || types.has('text/plain'))) {
        return 'cancel';
      }

      return 'move';
    },
    onDrop: async (e) => {
      action('onDrop')(e);
      let {
        items
      } = e;
      let itemsToAdd = [];
      let text;
      for (let item of items) {
        if (item.kind === 'text') {
          if (item.types.size === 1 && item.types.has('text/plain')) {
            text = await item.getText('text/plain');
            itemsToAdd = text.split('\n').map(val => JSON.parse(val));
          } else {
            text = await item.getText('list-1-adobe-file');
            itemsToAdd.push(JSON.parse(text));
          }
        }
      }

      list2.append(...itemsToAdd);
    },
    // the below utility handlers shouldn't be called because onDrop is defined
    // shouldAcceptItemDrop and acceptedDragTypes shouldn't affect the behavior either
    onInsert: () => action('onInsert'),
    onReorder: () => action('onReorder'),
    onRootDrop: () => action('onRootDrop'),
    onItemDrop: () => action('onItemDrop'),
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key).childNodes,
    acceptedDragTypes: 'all'
  });


  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="Draggable listview"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        dragAndDropHooks={dragAndDropHooksList1}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' && <Folder />}
          </Item>
        )}
      </ListView>
      <ListView
        aria-label="droppable listview"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        dragAndDropHooks={dragAndDropHooksList2}
        {...props}>
        {(item: any) => (
          <Item textValue={item.name} key={item.identifier}>
            <Text>{item.name}</Text>
            {item.type === 'folder' &&
              <>
                <Folder />
                <Text slot="description">{`contains ${item.childNodes.length} dropped item(s)`}</Text>
              </>
            }
          </Item>
        )}
      </ListView>
    </Flex>
  );
}

let folderList1Section = [
  {identifier: 'a', type: 'section', name: 'Section A', childNodes: [
    {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
    {identifier: '2', type: 'file', name: 'Adobe XD'},
    {identifier: '3', type: 'folder', name: 'Documents', childNodes: []}
  ]},
  {identifier: 'b', type: 'section', name: 'Section B', childNodes: [
    {identifier: '4', type: 'file', name: 'Adobe InDesign'},
    {identifier: '5', type: 'folder', name: 'Utilities', childNodes: []},
    {identifier: '6', type: 'file', name: 'Adobe AfterEffects'}
  ]},
  {identifier: 'c', type: 'section', name: 'Section C', childNodes: [
    {identifier: '7', type: 'file', name: 'Adobe Premier'},
    {identifier: '8', type: 'folder', name: 'My Photos', childNodes: []},
    {identifier: '9', type: 'file', name: 'Adobe Media Encoder'}
  ]}
];

let folderList2Section = [
  {identifier: 'd', type: 'section', name: 'Section D', childNodes: [
    {identifier: '10', type: 'folder', name: 'Pictures', childNodes: []},
    {identifier: '11', type: 'file', name: 'Adobe Fresco'},
    {identifier: '12', type: 'folder', name: 'Apps', childNodes: []},
    {identifier: '13', type: 'file', name: 'Adobe Illustrator'}
  ]},
  {identifier: 'e', type: 'section', name: 'Section E', childNodes: [
    {identifier: '14', type: 'file', name: 'Adobe Lightroom'},
    {identifier: '15', type: 'file', name: 'Adobe Dreamweaver'},
    {identifier: '16', type: 'folder', name: 'Adobe Audition', childNodes: []}
  ]},
  {identifier: 'f', type: 'section', name: 'Section F', childNodes: [
    {identifier: '17', type: 'file', name: 'Adobe Aero'},
    {identifier: '18', type: 'folder', name: 'dev', childNodes: []},
    {identifier: '19', type: 'file', name: 'Adobe Animate'}
  ]}
];

interface ListItems {
  identifier: string,
  type: string,
  name: string,
  childNodes?: Array<ListItems>
}

// TODO update the dnd portion to work with useTreeData
export function DnDSections(props) {
  let {listViewProps, firstListDnDOptions, secondListDnDOptions} = props;
  let list1 = useTreeData<ListItems>({
    initialItems: folderList1Section,
    getKey: (item) => {
      return item.identifier;
    },
    getChildren: (item) => {
      return item?.childNodes;
    }
  });

  let list2 = useTreeData<ListItems>({
    initialItems: folderList2Section,
    getKey: (item) => {
      return item.identifier;
    },
    getChildren: (item) => {
      return item?.childNodes;
    }
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];


  // TODO: List of dnd bugs with sections.
  //  1. Need to adapt the below handlers and stuff to work with sections/useTreeData.
  //  2. keyboard DnD navigation works for the most part, drop targets are preserved. However, there are
  //  some things that will need to be updated, namely that we need to take into account the sections when adding insertion indicators
  //  At the moment, I cannot drop after the last element in a section, the next drop indicator is in the next section before its first item.
  //  3. Mouse drag and drop is borked, maybe because of sections being recognized as drop target? Looks to be that the section and header is considered
  //  an item, ideally we'd disallow those. Maybe somethingin getAllowedDropOperation or something we should automatically detect in ListDropTargetDelegate/drop hooks

  // Scenarios to consider:
  // 1. What if root drop is enabled? We don't want to allow sections with items that don't belong to any sections, but we'd be relying
  // on the user to handle that case

  // list 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dragAndDropHooks: dragAndDropHooksList1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      return {
        [`${item.value.type}`]: JSON.stringify(item),
        'text/plain': JSON.stringify(item)
      };
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      // TODO: additional work to make useTreeData handle updating .value easier is in https://github.com/adobe/react-spectrum/pull/4444/files
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...itemsToAppend);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...itemsToAppend);
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      list1.append('a', ...itemsToAppend);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      // TODO: Investigation as to why .remove must be called before .append to be done in https://github.com/adobe/react-spectrum/pull/4444/files
      if (isInternal && dropOperation === 'move') {
        let keysToRemove = itemsToAppend.map(item => item.identifier);
        list1.remove(...keysToRemove);
      }
      list1.append(target.key, ...itemsToAppend);
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList1')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key)?.value.childNodes,
    ...firstListDnDOptions
  });

  // list 2 should allow reordering, on folder drops, and on root drops
  let {dragAndDropHooks: dragAndDropHooksList2} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list2.getItem(key);
      let dragItem = {};
      let itemString = JSON.stringify(item);
      dragItem[`${item.value.type}`] = itemString;
      if (item.value.type !== 'unique_type') {
        dragItem['text/plain'] = itemString;
      }
      return dragItem;
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...itemsToAppend);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...itemsToAppend);
      }
    },
    onReorder: async (e) => {
      let {
        keys,
        target,
        dropOperation
      } = e;
      action('onReorderList2')(e);

      let itemsToCopy = [];
      for (let key of keys) {
        let item = list2.getItem(key);
        let itemCopy = {
          ...item.value,
          childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
        };
        if (dropOperation === 'copy') {
          itemCopy.identifier = Math.random().toString(36).slice(2);
        }
        itemsToCopy.push(itemCopy);
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          // TODO: work to add moveBefore/after methods to useTreeData to be done in https://github.com/adobe/react-spectrum/pull/4444/files
          list2.remove(...keys);
          list2.insertBefore(target.key, ...itemsToCopy);
        } else if (dropOperation === 'copy') {
          list2.insertBefore(target.key, ...itemsToCopy);
        }
      } else if (target.dropPosition === 'after') {
        if (dropOperation === 'move') {
          list2.remove(...keys);
          list2.insertAfter(target.key, ...itemsToCopy);
        } else if (dropOperation === 'copy') {
          list2.insertAfter(target.key, ...itemsToCopy);
        }
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropList2')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      list2.append('d', ...itemsToAppend);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropList2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      // Now that we are returning the entire item tree node from tree, need to reformat the items into the ListItems format
      // that the tree methods understand.
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      if (isInternal && dropOperation === 'move') {
        let keysToRemove = itemsToAppend.map(item => item.identifier);
        list2.remove(...keysToRemove);
      }

      list2.append(target.key, ...itemsToAppend);
    },
    acceptedDragTypes,
    onDragEnd: (e) => {
      let {
        dropOperation,
        isInternal,
        keys
      } = e;
      action('onDragEndList2')(e);
      if (dropOperation === 'move' && !isInternal) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key).value.type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key)?.value.childNodes,
    ...secondListDnDOptions
  });


  return (
    <Flex wrap gap="size-300">
      <ListView
        aria-label="First ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list1.items}
        {...listViewProps}
        dragAndDropHooks={dragAndDropHooksList1}>
        {(item: any) => {
          return (
            <ListSection key={item.value.identifier} items={item.children} title={item.value.name}>
              {(item: any) => (
                <Item textValue={item.value.name} key={item.value.identifier}>
                  <Text>{item.value.name}</Text>
                  {item.value.type === 'folder' &&
                    <>
                      <Folder />
                      <Text slot="description">{`contains ${item.value.childNodes?.length} dropped item(s)`}</Text>
                    </>
                  }
                </Item>
              )}
            </ListSection>
          );
        }}
      </ListView>
      <ListView
        aria-label="Second ListView in drag between list example"
        selectionMode="multiple"
        width="size-3600"
        height="size-3600"
        items={list2.items}
        {...listViewProps}
        dragAndDropHooks={dragAndDropHooksList2}
        {...props}>
        {(item: any) => {
          return (
            <ListSection key={item.value.identifier} items={item.children} title={item.value.name}>
              {(item: any) => (
                <Item textValue={item.value.name} key={item.value.identifier}>
                  <Text>{item.value.name}</Text>
                  {item.value.type === 'folder' &&
                    <>
                      <Folder />
                      <Text slot="description">{`contains ${item.value.childNodes?.length} dropped item(s)`}</Text>
                    </>
                  }
                </Item>
              )}
            </ListSection>
          );
        }}
      </ListView>
    </Flex>
  );
}
