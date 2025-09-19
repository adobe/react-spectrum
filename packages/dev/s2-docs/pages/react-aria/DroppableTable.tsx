'use client';
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {useState} from 'react';
import {PokemonTable, Pokemon} from './PokemonTable';

export function DroppableTable() {
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

  return <PokemonTable items={items} dragAndDropHooks={dragAndDropHooks} />;
}
