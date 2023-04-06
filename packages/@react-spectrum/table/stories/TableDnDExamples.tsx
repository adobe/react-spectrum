
import {action} from '@storybook/addon-actions';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../';
import {chain} from '@react-aria/utils';
import {Flex} from '@react-spectrum/layout';
import {ItemDropTarget} from '@react-types/shared';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useDragAndDrop} from '@react-spectrum/dnd';
import {useListData} from '@react-stately/data';

let onSelectionChange = action('onSelectionChange');

let columns = [
  {name: 'First name', key: 'first_name', isRowHeader: true},
  {name: 'Last name', key: 'last_name', isRowHeader: true},
  {name: 'Email', key: 'email'},
  {name: 'Department', key: 'department'},
  {name: 'Job Title', key: 'job_title'},
  {name: 'IP Address', key: 'ip_address'}
];

let items = [
  {id: 'a', first_name: 'Vin', last_name: 'Charlet', email: 'vcharlet0@123-reg.co.uk', ip_address: '18.45.175.130', department: 'Services', job_title: 'Analog Circuit Design manager'},
  {id: 'b', first_name: 'Lexy', last_name: 'Maddison', email: 'lmaddison1@xinhuanet.com', ip_address: '238.210.151.48', department: 'Research and Development', job_title: 'Analog Circuit Design manager'},
  {id: 'c', first_name: 'Robbi', last_name: 'Persence', email: 'rpersence2@hud.gov', ip_address: '130.2.120.99', department: 'Business Development', job_title: 'Analog Circuit Design manager'},
  {id: 'd', first_name: 'Dodie', last_name: 'Hurworth', email: 'dhurworth3@webs.com', ip_address: '235.183.154.184', department: 'Training', job_title: 'Account Coordinator'},
  {id: 'e', first_name: 'Audrye', last_name: 'Hember', email: 'ahember4@blogtalkradio.com', ip_address: '136.25.192.37', department: 'Legal', job_title: 'Operator'},
  {id: 'f', first_name: 'Beau', last_name: 'Oller', email: 'boller5@nytimes.com', ip_address: '93.111.22.12', department: 'Business Development', job_title: 'Speech Pathologist'},
  {id: 'g', first_name: 'Roarke', last_name: 'Gration', email: 'rgration6@purevolume.com', ip_address: '234.221.23.241', department: 'Product Management', job_title: 'Electrical Engineer'},
  {id: 'h', first_name: 'Cathy', last_name: 'Lishman', email: 'clishman7@constantcontact.com', ip_address: '181.158.213.202', department: 'Research and Development', job_title: 'Assistant Professor'},
  {id: 'i', first_name: 'Enrika', last_name: 'Soitoux', email: 'esoitoux8@google.com.hk', ip_address: '51.244.20.173', department: 'Support', job_title: 'Teacher'},
  {id: 'j', first_name: 'Aloise', last_name: 'Tuxsell', email: 'atuxsell9@jigsy.com', ip_address: '253.46.84.168', department: 'Training', job_title: 'Financial Advisor'}
];

let getAllowedDropOperationsAction = action('getAllowedDropOperationsAction');

export function DragExample(props?) {
  let {tableViewProps, dragHookOptions} = props;
  let getItems = (keys) => [...keys].map(key => {
    let item = items.find(item => item.id === key);
    return {
      'text/plain': `${item.first_name} ${item.last_name}`
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
    <TableView aria-label="TableView with dragging enabled" selectionMode="multiple" width={400} height={300} onSelectionChange={s => onSelectionChange([...s])} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <Row>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

export function ReorderExample(props) {
  let {onDrop, onDragStart, onDragEnd, tableViewProps} = props;
  let list = useListData({
    initialItems: items,
    getKey: item => item.id
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
    <TableView aria-label="Reorderable TableView" selectionMode="multiple" width={400} height={300} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row>
            {key => <Cell>{item[key]}</Cell>}
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

export function DragOntoRowExample(props) {
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
    {name: 'ID', key: 'id', width: 50},
    {name: 'Type', key: 'type', width: 100},
    {name: 'Name', key: 'name', width: 200},
    {name: 'Child Items', key: 'childNodes', width: 250}
  ];

  let list = useListData({
    initialItems: [
      {id: '0', type: 'folder', name: 'Folder 1', childNodes: []},
      {id: '1', type: 'item', name: 'One'},
      {id: '2', type: 'item', name: 'Two'},
      {id: '3', type: 'item', name: 'Three'},
      {id: '4', type: 'item', name: 'Four'},
      {id: '5', type: 'item', name: 'Five'},
      {id: '6', type: 'item', name: 'Six'},
      {id: '7', type: 'folder', name: 'Folder (disabled)', childNodes: []},
      {id: '8', type: 'folder', name: 'Folder 2', childNodes: []}
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
    <TableView aria-label="Drag onto table row example" selectionMode="multiple" disabledKeys={disabledKeys} dragAndDropHooks={dragAndDropHooks} {...tableViewProps}>
      <TableHeader columns={columns}>
        {column => <Column minWidth={column.width} isRowHeader={column.key === 'name'}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={list.items}>
        {item => (
          <Row>
            <Cell>{item.id}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.name}</Cell>
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

export function DragBetweenTablesExample(props) {
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
        <TableView aria-label="First TableView" selectionMode="multiple" width={400} dragAndDropHooks={dragAndDropHooks} {...props}>
          <TableHeader columns={itemColumns}>
            {column => <Column minWidth={100} isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item: any) => (
              <Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={400} dragAndDropHooks={dragAndDropHooks} {...props}>
          <TableHeader columns={itemColumns}>
            {column => <Column minWidth={100} isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item: any) => (
              <Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}

export function DragBetweenTablesRootOnlyExample(props) {
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
        <TableView aria-label="First TableView" selectionMode="multiple" width={400} dragAndDropHooks={dragAndDropHooksFirst} {...tableViewProps}>
          <TableHeader columns={itemColumns}>
            {column => <Column minWidth={100} isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list1.items}>
            {(item: any) => (
              <Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
      <Flex direction="column" margin="size-100">
        <Text alignSelf="center">Table 2</Text>
        <TableView aria-label="Second TableView" selectionMode="multiple" width={400} dragAndDropHooks={dragAndDropHooksSecond} {...tableViewProps}>
          <TableHeader columns={itemColumns}>
            {column => <Column minWidth={100} isRowHeader={column.key === 'name'}>{column.name}</Column>}
          </TableHeader>
          <TableBody items={list2.items}>
            {(item: any) => (
              <Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </>
  );
}
