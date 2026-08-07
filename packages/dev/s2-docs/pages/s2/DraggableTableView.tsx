'use client';
import {useDragAndDrop} from '@react-spectrum/s2/useDragAndDrop';
import {PokemonTableView, type Pokemon} from './PokemonTableView';

export function DraggableTableView() {
  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    getItems(keys, items) {
      return items.map(item => ({
        'text/plain': `${item.name} – ${item.type}`,
        'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
        pokemon: JSON.stringify(item)
      }));
    }
  });

  return <PokemonTableView dragAndDropHooks={dragAndDropHooks} />;
}
