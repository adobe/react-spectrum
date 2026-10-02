'use client';
import {useState} from 'react';
import {isTextDropItem, useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonListView, type Pokemon} from './PokemonListView';

export function DroppableListView() {
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

  return <PokemonListView items={items} dragAndDropHooks={dragAndDropHooks} />;
}
