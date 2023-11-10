import {action} from '@storybook/addon-actions';
import {DIRECTORY_DRAG_TYPE} from '@react-aria/dnd';
import {Flex} from '@react-spectrum/layout';
import Folder from '@spectrum-icons/illustrations/Folder';
import {Item, ListView} from '../';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useDragAndDrop} from '@react-spectrum/dnd';
import {useListData} from '@react-stately/data';

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
