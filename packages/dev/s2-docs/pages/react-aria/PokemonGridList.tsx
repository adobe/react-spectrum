'use client';
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {DragAndDropHooks} from 'react-aria-components';

export interface Pokemon {
  id: number,
  name: string,
  type: string,
  level: number
}

interface PokemonGridListProps {
  items?: Pokemon[],
  dragAndDropHooks?: DragAndDropHooks<Pokemon>
}

///- begin collapse -///
export let defaultItems: Pokemon[] = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];
///- end collapse -///

export function PokemonGridList(props: PokemonGridListProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <GridList
      aria-label="Pokemon list"
      selectionMode="multiple"
      items={items}
      renderEmptyState={() => 'Drop items here'}
      dragAndDropHooks={dragAndDropHooks}>
      {(item) => (
        <GridListItem textValue={item.name}>
          <strong>{item.name}</strong> – <em>{item.type}</em>
        </GridListItem>
      )}
    </GridList>
  );
}
