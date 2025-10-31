'use client';

import {ListView, Item, Text, useListData, useDragAndDrop} from '@adobe/react-spectrum';
import {style} from '@react-spectrum/s2/style';
import File from '@spectrum-icons/illustrations/File';
import Folder from '@spectrum-icons/illustrations/Folder';
import React from 'react';

function BidirectionalDnDListView(props) {
  let {list} = props;
  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['custom-app-type-bidirectional'],
    // Only allow move operations
    getAllowedDropOperations: () => ['move'],
    getItems(keys) {
      return [...keys].map(key => {
        let item = list.getItem(key);
        // Setup the drag types and associated info for each dragged item.
        return {
          'custom-app-type-bidirectional': JSON.stringify(item),
          'text/plain': item.name
        };
      });
    },
    onInsert: async (e) => {
      let {
        items,
        target
      } = e;
      let processedItems = await Promise.all(
        items.map(async item => JSON.parse(await item.getText('custom-app-type-bidirectional')))
      );
      if (target.dropPosition === 'before') {
        list.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list.insertAfter(target.key, ...processedItems);
      }
    },
    onReorder: async (e) => {
      let {
        keys,
        target
      } = e;

      if (target.dropPosition === 'before') {
        list.moveBefore(target.key, [...keys]);
      } else if (target.dropPosition === 'after') {
        list.moveAfter(target.key, [...keys]);
      }
    },
    onRootDrop: async (e) => {
      let {
        items
      } = e;
      let processedItems = await Promise.all(
        items.map(async item => JSON.parse(await item.getText('custom-app-type-bidirectional')))
      );
      list.append(...processedItems);
    },
    /*- begin highlight -*/
    onDragEnd: (e) => {
      let {
        dropOperation,
        keys,
        isInternal
      } = e;
      // Only remove the dragged items if they aren't dropped inside the source list
      if (dropOperation === 'move' && !isInternal) {
        list.remove(...keys);
      }
    }
    /*- end highlight -*/
  });

  return (
    <ListView
      aria-label={props['aria-label']}
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}>
      {item => (
        <Item textValue={item.name}>
          {item.type === 'folder' ? <Folder /> : <File />}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  );
}

export default function DragBetweenListsExample() {
  let list1 = useListData({
    initialItems: [
      {id: '1', type: 'file', name: 'Adobe Photoshop'},
      {id: '2', type: 'file', name: 'Adobe XD'},
      {id: '3', type: 'folder', name: 'Documents'},
      {id: '4', type: 'file', name: 'Adobe InDesign'},
      {id: '5', type: 'folder', name: 'Utilities'},
      {id: '6', type: 'file', name: 'Adobe AfterEffects'}
    ]
  });

  let list2 = useListData({
    initialItems: [
      {id: '7', type: 'folder', name: 'Pictures'},
      {id: '8', type: 'file', name: 'Adobe Fresco'},
      {id: '9', type: 'folder', name: 'Apps'},
      {id: '10', type: 'file', name: 'Adobe Illustrator'},
      {id: '11', type: 'file', name: 'Adobe Lightroom'},
      {id: '12', type: 'file', name: 'Adobe Dreamweaver'}
    ]
  });


  return (
    <div className={style({display: 'flex', flexWrap: 'wrap', gap: 8})}>
      <BidirectionalDnDListView list={list1} aria-label="First ListView in drag between list example" />
      <BidirectionalDnDListView list={list2} aria-label="Second ListView in drag between list example" />
    </div>
  );  
}