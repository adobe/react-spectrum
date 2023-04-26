
import {action} from '@storybook/addon-actions';
import {Cell, Column, Row, TableBody, TableHeader, TableSection, TableView} from '..';
import {DIRECTORY_DRAG_TYPE, useDragAndDrop} from '@react-spectrum/dnd';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useListData, useTreeData} from '@react-stately/data';

let onSelectionChange = action('onSelectionChange');

let itemProcessor = async (items, acceptedDragTypes) => {
  let processedItems = [];
  let text;
  for (let item of items) {
    for (let type of acceptedDragTypes) {
      if (item.kind === 'text' && item.types.has(type)) {
        let processedItem;
        text = await item.getText(type);
        processedItem = JSON.parse(text);
        // If processed item has a parent key, then it is from a section. We need to extract its original value of the item in these
        // cases
        // if (processedItem?.parentKey != null) {
        //   processedItem = processedItem.value;
        // }
        processedItems.push(processedItem);
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

let columns = [
    {name: 'ID', key: 'identifier'},
    {name: 'Name', key: 'name'},
    {name: 'Type', key: 'type'}
];

export function DragExampleUtilHandlers(props) {
  let {tableViewProps, dndOptions} = props;
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
    <TableView aria-label="TableView with dnd util handlers" selectionMode="multiple" width={400} height={200} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row key={item.identifier}>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

export function ReorderExampleUtilHandlers(props) {
  let {tableViewProps, dndOptions} = props;
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
    <TableView aria-label="Reorderable TableView with util handlers" selectionMode="multiple" width={400} height={200} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row key={item.identifier}>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>

  );
}

export function ItemDropExampleUtilHandlers(props) {
  let {tableViewProps, dndOptions} = props;
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
    <TableView aria-label="Row droppable TableView from dnd hook util handlers" selectionMode="multiple" width={400} height={200} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row key={item.identifier}>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

export function RootDropExampleUtilHandlers(props) {
  let {tableViewProps, firstTableDnDOptions, secondTableDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks: table1Hooks} = useDragAndDrop({
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
    ...firstTableDnDOptions
  });

  let {dragAndDropHooks: table2Hooks} = useDragAndDrop({
    onRootDrop: async (e) => {
      action('onRootDropTable1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      list2.append(...processedItems);
    },
    acceptedDragTypes,
    ...secondTableDnDOptions
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView" selectionMode="multiple" width={300} dragAndDropHooks={table1Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={300} dragAndDropHooks={table2Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

export function InsertExampleUtilHandlers(props) {
  let {tableViewProps, firstTableDnDOptions, secondTableDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let acceptedDragTypes = ['file', 'folder', 'text/plain'];
  let {dragAndDropHooks: table1Hooks} = useDragAndDrop({
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
    ...firstTableDnDOptions
  });

  let {dragAndDropHooks: table2Hooks} = useDragAndDrop({
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertTable2')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);

      if (target.dropPosition === 'before') {
        list2.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list2.insertAfter(target.key, ...processedItems);
      }
    },
    acceptedDragTypes,
    ...secondTableDnDOptions
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView" selectionMode="multiple" width={300} dragAndDropHooks={table1Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={300} dragAndDropHooks={table2Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

export function FinderDropUtilHandlers(props) {
  let {tableViewProps, firstTableDnDOptions, secondTableDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });
  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });

  let {dragAndDropHooks: table1Hooks} = useDragAndDrop({
    acceptedDragTypes: [DIRECTORY_DRAG_TYPE],
    onInsert: async (e) => {
      action('onInsertTable1')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropTable1')(e);
    },
    ...firstTableDnDOptions
  });

  let {dragAndDropHooks: table2Hooks} = useDragAndDrop({
    onInsert: async (e) => {
      action('onInsertTable2')(e);
    },
    onItemDrop: async (e) => {
      action('onItemDropTable2')(e);
    },
    acceptedDragTypes: 'all',
    ...secondTableDnDOptions
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="TableView that accepts directory drops only" selectionMode="multiple" width={300} dragAndDropHooks={table1Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="TableView that accepts all drag types" selectionMode="multiple" width={300} dragAndDropHooks={table2Hooks} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

export function DragBetweenTablesComplex(props) {
  let {tableViewProps, firstTableDnDOptions, secondTableDnDOptions} = props;
  let list1 = useListData({
    initialItems: folderList1,
    getKey: (item) => item.identifier
  });

  let list2 = useListData({
    initialItems: folderList2,
    getKey: (item) => item.identifier
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];

  // table 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dragAndDropHooks: dragAndDropHooksTable1} = useDragAndDrop({
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
      action('onInsertTable1')(e);
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...processedItems);
      }

    },
    onRootDrop: async (e) => {
      action('onRootDropTable1')(e);
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
      action('onItemDropTable1')(e);
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
      action('onDragEndTable1')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key)?.childNodes,
    ...firstTableDnDOptions
  });

  // table 2 should allow reordering, on folder drops, and on root drops
  let {dragAndDropHooks: dragAndDropHooksTable2} = useDragAndDrop({
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
      action('onInsertTable2')(e);
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
      action('onReorderTable2')(e);

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
      action('onRootDropTable2')(e);
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
      action('onItemDropTable2')(e);
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
      action('onDragEndTable2')(e);
      if (dropOperation === 'move' && !isInternal) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key).type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key)?.childNodes,
    ...secondTableDnDOptions
  });

  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView in drag between table example" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable1} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView in drag between table example" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable2} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

export function DragBetweenTablesOverride(props) {
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

  let {dragAndDropHooks: dragAndDropHooksTable1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      let dragType = `table-1-adobe-${item.type}`;
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

  let {dragAndDropHooks: dragAndDropHooksTable2} = useDragAndDrop({
    getDropOperation: (target, types) => {
      if (target.type !== 'root' || !(types.has('table-1-adobe-file') || types.has('text/plain'))) {
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
            text = await item.getText('table-1-adobe-file');
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
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key)?.childNodes,
    acceptedDragTypes: 'all'
  });


  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="TableView that accepts directory drops only" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable1} {...props}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="TableView that accepts all drag types" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable2} {...props}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <Row key={item.identifier}>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

let folderList1Section = [
  {identifier: 'a', type: 'section', name: 'Section 1', childNodes: [
    {identifier: '1', type: 'file', name: 'Adobe Photoshop'},
    {identifier: '2', type: 'file', name: 'Adobe XD'},
    {identifier: '3', type: 'folder', name: 'Documents', childNodes: []}
  ]},
  {identifier: 'b', type: 'section', name: 'Section 2', childNodes: [
    {identifier: '4', type: 'file', name: 'Adobe InDesign'},
    {identifier: '5', type: 'folder', name: 'Utilities', childNodes: []},
    {identifier: '6', type: 'file', name: 'Adobe AfterEffects'}
  ]}
];

let folderList2Section = [
  {identifier: 'c', type: 'section', name: 'Section 3', childNodes: [
    {identifier: '7', type: 'folder', name: 'Pictures', childNodes: []},
    {identifier: '8', type: 'file', name: 'Adobe Fresco'},
    {identifier: '9', type: 'folder', name: 'Apps', childNodes: []},
    {identifier: '10', type: 'file', name: 'Adobe Illustrator'}
  ]},
  {identifier: 'd', type: 'section', name: 'Section 4', childNodes: [
    {identifier: '11', type: 'file', name: 'Adobe Lightroom'},
    {identifier: '12', type: 'file', name: 'Adobe Dreamweaver'},
    {identifier: '13', type: 'unique_type', name: 'invalid drag item'}
  ]}
];

interface TableItems {
  identifier: string,
  type: string,
  name: string,
  childNodes?: Array<TableItems>
}

export function DragBetweenTablesSectionsComplex(props) {
  let {tableViewProps, firstTableDnDOptions, secondTableDnDOptions} = props;
  let list1 = useTreeData<TableItems>({
    initialItems: folderList1Section,
    getKey: (item) => {
      return item.identifier;
    },
    getChildren: (item) => {
      return item?.childNodes;
    },
    propsInsert: (parentNodeValue, index, ...values) => {
      return ({
        childNodes: [
          ...parentNodeValue.childNodes.slice(0, index),
          ...values,
          ...parentNodeValue.childNodes.slice(index)
        ]
      });
    },
    propsRemove: (parentNodeValue, key) => {
      return ({
        ...parentNodeValue,
        childNodes: parentNodeValue.childNodes.filter(node => node.identifier !== key)
      });
    }
  });

  let list2 = useTreeData<TableItems>({
    initialItems: folderList2Section,
    getKey: (item) => {
      return item.identifier;
    },
    getChildren: (item) => {
      return item?.childNodes;
    },
    propsInsert: (parentNodeValue, index, ...values) => {
      return ({
        childNodes: [
          ...parentNodeValue.childNodes.slice(0, index),
          ...values,
          ...parentNodeValue.childNodes.slice(index)
        ]
      });
    },
    propsRemove: (parentNodeValue, key) => {
      return ({
        ...parentNodeValue,
        childNodes: parentNodeValue.childNodes.filter(node => node.identifier !== key)
      });
    }
  });
  let acceptedDragTypes = ['file', 'folder', 'text/plain'];

  // table 1 should allow on item drops and external drops, but disallow reordering/internal drops
  let {dragAndDropHooks: dragAndDropHooksTable1} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list1.getItem(key);
      console.log('item of list 1 drag', item)
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
      action('onInsertTable1')(e);
      // let processedItems = await itemProcessor(items, acceptedDragTypes);
      // console.log('processedItems insert list 1', processedItems);
      // // debugger;
      // if (target.dropPosition === 'before') {
      //   list1.insertBefore(target.key, ...processedItems);
      // } else if (target.dropPosition === 'after') {
      //   list1.insertAfter(target.key, ...processedItems);
      // }


      let processedItems = await itemProcessor(items, acceptedDragTypes);
      console.log('processedItems insert list 1', processedItems);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      if (target.dropPosition === 'before') {
        list1.insertBefore(target.key, ...itemsToAppend);
      } else if (target.dropPosition === 'after') {
        list1.insertAfter(target.key, ...itemsToAppend);
      }
    },
    onRootDrop: async (e) => {
      action('onRootDropTable1')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
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
      action('onItemDropTable1')(e);
      // let processedItems = await itemProcessor(items, acceptedDragTypes);
      // console.log('processedItems onitemDrop list 1', processedItems);
      // // debugger;
      // if (isInternal && dropOperation === 'move') {
      //   let keysToRemove = processedItems.map(item => item.identifier);
      //   list1.remove(...keysToRemove);
      // }
      // list1.append(target.key, ...processedItems);



      let processedItems = await itemProcessor(items, acceptedDragTypes);
      console.log('processedItems onitemDrop list 1', processedItems);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
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
      action('onDragEndTable1')(e);
      if (dropOperation === 'move' && !isInternal) {
        list1.remove(...keys);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list1.getItem(target.key)?.value.childNodes,
    ...firstTableDnDOptions
  });

  // table 2 should allow reordering, on folder drops, and on root drops
  let {dragAndDropHooks: dragAndDropHooksTable2} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => {
      let item = list2.getItem(key);
      let dragItem = {};
      let itemString = JSON.stringify(item);
      dragItem[`${item.value.type}`] = itemString;
      if (item.value.type !== 'unique_type') {
        dragItem['text/plain'] = itemString;
      }
      console.log('item of list 2 drag', item, dragItem)
      return dragItem;
    }),
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      action('onInsertTable2')(e);
      // let processedItems = await itemProcessor(items, acceptedDragTypes);
      // console.log('processedItems insert list 2', processedItems);
      // // debugger;
      // if (target.dropPosition === 'before') {
      //   list2.insertBefore(target.key, ...processedItems);
      // } else if (target.dropPosition === 'after') {
      //   list2.insertAfter(target.key, ...processedItems);
      // }


      let processedItems = await itemProcessor(items, acceptedDragTypes);
      console.log('processedItems on insert list 2', processedItems)
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      console.log('reprocessed items on insert list 2', itemsToAppend)
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
      action('onReorderTable2')(e);

      let itemsToCopy = [];
      for (let key of keys) {
        let item = list2.getItem(key);
        let itemCopy = {
          ...item.value,
          // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
        };
        if (dropOperation === 'copy') {
          itemCopy.identifier = Math.random().toString(36).slice(2);
        }
        itemsToCopy.push(itemCopy);
      }

      if (target.dropPosition === 'before') {
        if (dropOperation === 'move') {
          // TODO: this breaks if moving an item(s) to positions immediately adjacent to itself, will
          // need to update useTreeData so it has something like move from useListData
          // for now perhaps use useTreeData.move and do a move for each and calculate a new index everytime?
          // Can't do .move without reimplementing the same logic that useListData does for move operations
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
      action('onRootDropTable2')(e);
      let processedItems = await itemProcessor(e.items, acceptedDragTypes);
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      list2.append('c', ...itemsToAppend);
    },
    onItemDrop: async (e) => {
      let {
        items,
        target,
        isInternal,
        dropOperation
      } = e;
      action('onItemDropTable2')(e);
      // // TODO: internal drop onItemDrop is broken, it doesn't seem to remove the items
      // // TODO: drops from one list to another list's folder updates the tracked children properly but the
      // // "value" in the 2nd list doesn't update to reflect the change. This might actaully be expected
      // // since useTreeData doesn't actually know what the "value" is of the node (doesn't know that it is the "childNodes" prop) and thus doesn't update it
      // // This seems to be problematic because adding items to the folder of one list and then dragging that folder back to the second list
      // // doesn't retain the children of that folder

      // // TODO: calling append after remove makes it update properly, but calling append before remove doesn't remove the items
      // let processedItems = await itemProcessor(items, acceptedDragTypes);
      // console.log('processedItems on item drop list 2', processedItems)
      // if (isInternal && dropOperation === 'move') {
      //   let keysToRemove = processedItems.map(item => item.identifier);
      //   list2.remove(...keysToRemove);
      // }

      // list2.append(target.key, ...processedItems);



      // TODO: internal drop onItemDrop is broken, it doesn't seem to remove the items
      // TODO: drops from one list to another list's folder updates the tracked children properly but the
      // "value" in the 2nd list doesn't update to reflect the change. This might actaully be expected
      // since useTreeData doesn't actually know what the "value" is of the node (doesn't know that it is the "childNodes" prop) and thus doesn't update it
      // This seems to be problematic because adding items to the folder of one list and then dragging that folder back to the second list
      // doesn't retain the children of that folder

      // TODO: calling append after remove makes it update properly, but calling append before remove doesn't remove the items
      let processedItems = await itemProcessor(items, acceptedDragTypes);
      console.log('processedItems on item drop list 2', processedItems)
      // Now that we are returning the entire item tree node from tree, need to reformat the items into the TableItems format
      // that the tree methods understand.
      let itemsToAppend = processedItems.map(item => ({
        ...item.value,
        // childNodes: item.value.childNodes ? item.children.map(child => child.value) : undefined
      }));
      if (isInternal && dropOperation === 'move') {
        let keysToRemove = itemsToAppend.map(item => item.identifier);
        console.log('keys to remove in onItemDrop list 2', keysToRemove)
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
      action('onDragEndTable2')(e);
      if (dropOperation === 'move' && !isInternal) {
        let keysToRemove = [...keys].filter(key => list2.getItem(key).value.type !== 'unique_type');
        list2.remove(...keysToRemove);
      }
    },
    getAllowedDropOperations: () => ['move', 'copy'],
    shouldAcceptItemDrop: (target) => !!list2.getItem(target.key)?.value.childNodes,
    ...secondTableDnDOptions
  });
  console.log('list1 items', list1.items)
  console.log('list2 items', list2.items);
  // console.log('folder', list2.getItem('9'), list2.getItem('9').children, list2.getItem('9').value);
  return (
    <>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 1</Text>
        <TableView aria-label="First TableView in drag between table example" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable1} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'} allowsResizing>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item) => (
              <TableSection key={item.value.identifier} items={item.children} title={item.value.name}>
                {(item) => (
                  <Row key={item.value.identifier}>
                    {key => <Cell>{item.value[key]}</Cell>}
                  </Row>
                )}
              </TableSection>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView in drag between table example" selectionMode="multiple" width={300} dragAndDropHooks={dragAndDropHooksTable2} {...tableViewProps}>
          <TableHeader columns={columns}>
            {column => <Column isRowHeader={column.key === 'name'} allowsResizing>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item) => (
              <TableSection key={item.value.identifier} items={item.children} title={item.value.name}>
                {(item) => (
                  <Row key={item.value.identifier}>
                    {key => <Cell>{item.value[key]}</Cell>}
                  </Row>
                )}
              </TableSection>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}
