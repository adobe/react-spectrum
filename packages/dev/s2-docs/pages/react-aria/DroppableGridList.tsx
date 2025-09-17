'use client';
import {useState} from 'react';
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {PokemonGridList, Pokemon} from './PokemonGridList';

export function DroppableGridList() {
  let [items, setItems] = useState<Pokemon[]>([]);

  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['pokemon'],
    async onRootDrop(e) {
      let items = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async item => JSON.parse(await item.getText('pokemon')))
      );
      setItems(items);
    }
  });

  return <PokemonGridList items={items} dragAndDropHooks={dragAndDropHooks} />;
}
