'use client';
import {ListBox, ListBoxItem} from 'vanilla-starter/ListBox';
import {DragAndDropHooks, Text} from 'react-aria-components';

export interface Pokemon {
  id: number,
  name: string,
  type: string,
  level: number
}

interface PokemonListBoxProps {
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

export function PokemonListBox(props: PokemonListBoxProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <ListBox
      aria-label="Pokemon list"
      selectionMode="multiple"
      items={items}
      renderEmptyState={() => 'Drop items here'}
      dragAndDropHooks={dragAndDropHooks}>
      {(item) => (
        <ListBoxItem textValue={item.name}>
          <Text slot="label">{item.name}</Text>
          <Text slot="description">{item.type}</Text>
        </ListBoxItem>
      )}
    </ListBox>
  );
}
