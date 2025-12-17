'use client';

import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';
import {Folder, File} from 'lucide-react';
import {useDragAndDrop, isTextDropItem, useListData, ListData} from 'react-aria-components';
import React from 'react';

interface ListItem {
  id: string;
  type: 'file' | 'folder';
  name: string;
}

interface BidirectionalDnDListBoxProps {
  list: ListData<ListItem>;
  'aria-label': string;
}

function BidirectionalDnDListBox(props: BidirectionalDnDListBoxProps) {
  let {list} = props;
  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['custom-app-type-bidirectional'],
    // Only allow move operations
    getAllowedDropOperations: () => ['move'],
    getItems(keys) {
      return [...keys].map(key => {
        let item = list.getItem(key)!;
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
        items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('custom-app-type-bidirectional')))
      );
      if (target.dropPosition === 'before') {
        list.insertBefore(target.key, ...processedItems);
      } else if (target.dropPosition === 'after') {
        list.insertAfter(target.key, ...processedItems);
      }
    },
    onReorder: (e) => {
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
        items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('custom-app-type-bidirectional')))
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
    <ListBox
      aria-label={props['aria-label']}
      selectionMode="multiple"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      style={{width: 300, height: 300, overflow: 'auto'}}>
      {item => (
        <ListBoxItem textValue={item.name} style={{display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row', justifyContent: 'flex-start'}}>
          {item.type === 'folder' ? <Folder size={16} /> : <File size={16} />}
          <span>{item.name}</span>
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export default function DragBetweenListsExample() {
  let list1 = useListData<ListItem>({
    initialItems: [
      {id: '1', type: 'file', name: 'Adobe Photoshop'},
      {id: '2', type: 'file', name: 'Adobe XD'},
      {id: '3', type: 'folder', name: 'Documents'},
      {id: '4', type: 'file', name: 'Adobe InDesign'},
      {id: '5', type: 'folder', name: 'Utilities'},
      {id: '6', type: 'file', name: 'Adobe AfterEffects'}
    ]
  });

  let list2 = useListData<ListItem>({
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
    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8}}>
      <BidirectionalDnDListBox list={list1} aria-label="First ListBox in drag between list example" />
      <BidirectionalDnDListBox list={list2} aria-label="Second ListBox in drag between list example" />
    </div>
  );  
}