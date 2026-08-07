'use client';
import {useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonTreeView, type Pokemon} from './PokemonTreeView';

export function DraggableTreeView() {
  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, items) {
      return items.map(item => ({
        'text/plain': `${item.name} – ${item.type}`,
        'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
        pokemon: JSON.stringify(item)
      }));
    }
  });

  return <PokemonTreeView dragAndDropHooks={dragAndDropHooks} />;
}
