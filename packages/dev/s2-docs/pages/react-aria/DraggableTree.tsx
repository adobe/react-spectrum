"use client";
import {useDragAndDrop} from 'react-aria-components';
import {PokemonTree, Pokemon} from './PokemonTree';

export function DraggableTree() {
  let {dragAndDropHooks} = useDragAndDrop<Pokemon>({
    renderDragPreview(items) {
      return (
        <div className="drag-preview">
          {items[0]['text/plain']}
          <span className="badge">{items.length}</span>
        </div>
      );
    },
    getItems(keys, items) {
      return items.map(item => {
        return {
          'text/plain': `${item.name} – ${item.type}`,
          'text/html': `<strong>${item.name}</strong> – <em>${item.type}</em>`,
          'pokemon': JSON.stringify(item)
        };
      });
    },
  });

  return <PokemonTree dragAndDropHooks={dragAndDropHooks} />;
}
