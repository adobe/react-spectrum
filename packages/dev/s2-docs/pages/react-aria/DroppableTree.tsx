'use client';
import {isTextDropItem, useDragAndDrop} from 'react-aria-components';
import {useState} from 'react';
import {PokemonTree, Pokemon} from './PokemonTree';

export function DroppableTree() {
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

  return <PokemonTree items={items} dragAndDropHooks={dragAndDropHooks} />
}
