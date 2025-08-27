'use client';
import {createElement, ReactElement} from 'react';
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {useDragAndDrop} from 'react-aria-components';

export function DraggableGridList(): ReactElement {
  let items = new Map([
    ['ps', {name: 'Photoshop', style: 'strong'}],
    ['xd', {name: 'XD', style: 'strong'}],
    ['id', {name: 'InDesign', style: 'strong'}],
    ['dw', {name: 'Dreamweaver', style: 'em'}],
    ['co', {name: 'Connect', style: 'em'}]
  ]);

  let {dragAndDropHooks} = useDragAndDrop({
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    },
    getItems(keys) {
      return [...keys].map(key => {
        let item = items.get(key as string)!;
        return {
          'text/plain': item.name,
          'text/html': `<${item.style}>${item.name}</${item.style}>`,
          'custom-app-type': JSON.stringify({id: key, ...item})
        };
      });
    }
  });

  return (
    <GridList
      aria-label="Draggable list"
      selectionMode="multiple"
      items={items}
      dragAndDropHooks={dragAndDropHooks}>
      {([id, item]) => (
        <GridListItem
          id={id}
          textValue={item.name}>
          {createElement(item.style || 'span', null, item.name)}
        </GridListItem>
      )}
    </GridList>
  );
}
