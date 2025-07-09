'use client';
import {createElement, ReactElement, useState} from 'react';
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';

interface TextItem {
  id: string,
  name: string,
  style: string
}

export function DroppableGridList(): ReactElement {
  let [items, setItems] = useState<TextItem[]>([]);

  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['custom-app-type'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('custom-app-type')))
      );
      setItems(items);
    }
  });

  return (
    <GridList
      aria-label="Droppable list"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      renderEmptyState={() => 'Drop items here'}>
      {item => (
        <GridListItem textValue={item.name}>
          {createElement(item.style || 'span', null, item.name)}
        </GridListItem>
      )}
    </GridList>
  );
}
