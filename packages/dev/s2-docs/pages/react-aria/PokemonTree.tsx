'use client';
import {Tree, TreeItem} from 'vanilla-starter/Tree';
import {Collection, DragAndDropHooks} from 'react-aria-components';

export interface Pokemon {
  id: number,
  name: string,
  type: string,
  level?: number,
  children?: Pokemon[]
}

interface PokemonTreeProps {
  items?: Pokemon[],
  dragAndDropHooks?: DragAndDropHooks<Pokemon>
}

///- begin collapse -///
export let defaultItems: Pokemon[] = [
  {id: 1, name: 'Bulbasaur', type: 'Grass', level: 14, children: [
    {id: 2, name: 'Ivysaur', type: 'Grass', level: 30, children: [
      {id: 3, name: 'Venusaur', type: 'Grass', level: 83}
    ]}
  ]},
  {id: 4, name: 'Charmander', type: 'Fire', level: 16, children: [
    {id: 5, name: 'Charmeleon', type: 'Fire', level: 32, children: [
      {id: 6, name: 'Charizard', type: 'Fire, Flying', level: 67}
    ]}
  ]},
  {id: 7, name: 'Squirtle', type: 'Water', level: 8, children: [
    {id: 8, name: 'Wartortle', type: 'Water', level: 34, children: [
      {id: 9, name: 'Blastoise', type: 'Water', level: 56}
    ]}
  ]},
  {id: 10, name: 'Pichu', type: 'Electric', level: 45, children: [
    {id: 11, name: 'Pikachu', type: 'Electric', level: 85, children: [
      {id: 12, name: 'Raichu', type: 'Electric', level: 100}
    ]}
  ]}
];
///- end collapse -///

export function PokemonTree(props: PokemonTreeProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <Tree 
      aria-label="Pokemon tree"
      selectionMode="multiple"
      items={items}
      renderEmptyState={() => 'Drop items here'}
      dragAndDropHooks={dragAndDropHooks}>
      {function renderItem(item: Pokemon) {
        return (
          <TreeItem title={`${item.name} – ${item.type}`} textValue={item.name}>
            <Collection items={item.children}>
              {renderItem}
            </Collection>
          </TreeItem>
        )
      }}
    </Tree>
  );
}
