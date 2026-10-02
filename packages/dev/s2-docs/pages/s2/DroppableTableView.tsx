'use client';
import {useState} from 'react';
import {isTextDropItem, useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonTableView, type Pokemon} from './PokemonTableView';

export function DroppableTableView() {
  let [items, setItems] = useState<Pokemon[]>([]);

  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['pokemon'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items.filter(isTextDropItem).map(async item => JSON.parse(await item.getText('pokemon')))
      );
      setItems(items);
    }
  });

  return <PokemonTableView items={items} dragAndDropHooks={dragAndDropHooks} />;
}
