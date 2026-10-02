'use client';
import {useState} from 'react';
import {isTextDropItem, useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonTreeView, type Pokemon} from './PokemonTreeView';

export function DroppableTreeView() {
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

  return <PokemonTreeView items={items} dragAndDropHooks={dragAndDropHooks} />;
}
