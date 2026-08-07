'use client';
import {ListView, ListViewItem} from '@react-spectrum/s2/ListView';
import {Text} from '@react-spectrum/s2';
import {DragAndDropHooks} from '@react-spectrum/s2/useDragAndDrop';
import {ReactElement} from 'react';
import {IllustratedMessage, Heading, Content} from '@react-spectrum/s2/IllustratedMessage';
import FolderOpen from '@react-spectrum/s2/illustrations/linear/FolderOpen';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export interface Pokemon {
  id: number;
  name: string;
  type: string;
  level?: number;
}

interface PokemonListViewProps {
  items?: Pokemon[];
  dragAndDropHooks?: DragAndDropHooks<Pokemon>;
}

///- begin collapse -///
export let defaultItems: Pokemon[] = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: 67},
  {id: 2, name: 'Blastoise', type: 'Water', level: 56},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: 83},
  {id: 4, name: 'Pikachu', type: 'Electric', level: 100}
];
///- end collapse -///

function renderEmptyState(): ReactElement {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>No results.</Heading>
      <Content>Drop items here.</Content>
    </IllustratedMessage>
  );
}

export function PokemonListView(props: PokemonListViewProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <ListView
      styles={style({height: 250, width: 250})}
      aria-label="Pokemon list"
      selectionMode="multiple"
      items={items}
      renderEmptyState={renderEmptyState}
      dragAndDropHooks={dragAndDropHooks}>
      {item => (
        <ListViewItem textValue={item.name}>
          <Text slot="label">{item.name}</Text>
          <Text slot="description">{item.type}</Text>
        </ListViewItem>
      )}
    </ListView>
  );
}
