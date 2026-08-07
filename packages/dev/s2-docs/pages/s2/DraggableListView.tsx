'use client';
import {useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonListView, type Pokemon} from './PokemonListView';

export function DraggableListView() {
  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, items) {
      return items.map(item => ({
        'text/plain': `${item.name} – ${item.type}`,
        'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
        pokemon: JSON.stringify(item)
      }));
    }
  });

  return <PokemonListView dragAndDropHooks={dragAndDropHooks} />;
}
