'use client';
import {
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  Collection,
  Text
} from '@react-spectrum/s2/TreeView';
import {DragAndDropHooks} from '@react-spectrum/s2/useDragAndDrop';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {ReactElement} from 'react';
import {IllustratedMessage, Heading, Content} from '@react-spectrum/s2/IllustratedMessage';
import FolderOpen from '@react-spectrum/s2/illustrations/linear/FolderOpen';

export interface Pokemon {
  id: number;
  name: string;
  type: string;
  level?: number;
  children?: Pokemon[];
}

interface PokemonTreeViewProps {
  items?: Pokemon[];
  dragAndDropHooks?: DragAndDropHooks<Pokemon>;
}

///- begin collapse -///
export let defaultItems: Pokemon[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    type: 'Grass',
    level: 14,
    children: [
      {
        id: 2,
        name: 'Ivysaur',
        type: 'Grass',
        level: 30,
        children: [{id: 3, name: 'Venusaur', type: 'Grass', level: 83}]
      }
    ]
  },
  {
    id: 4,
    name: 'Charmander',
    type: 'Fire',
    level: 16,
    children: [
      {
        id: 5,
        name: 'Charmeleon',
        type: 'Fire',
        level: 32,
        children: [{id: 6, name: 'Charizard', type: 'Fire, Flying', level: 67}]
      }
    ]
  },
  {
    id: 7,
    name: 'Squirtle',
    type: 'Water',
    level: 8,
    children: [
      {
        id: 8,
        name: 'Wartortle',
        type: 'Water',
        level: 34,
        children: [{id: 9, name: 'Blastoise', type: 'Water', level: 56}]
      }
    ]
  },
  {
    id: 10,
    name: 'Pichu',
    type: 'Electric',
    level: 45,
    children: [
      {
        id: 11,
        name: 'Pikachu',
        type: 'Electric',
        level: 85,
        children: [{id: 12, name: 'Raichu', type: 'Electric', level: 100}]
      }
    ]
  }
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

export function PokemonTreeView(props: PokemonTreeViewProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <TreeView
      styles={style({height: 250, width: 250})}
      aria-label="Pokemon tree"
      selectionMode="multiple"
      items={items}
      renderEmptyState={renderEmptyState}
      dragAndDropHooks={dragAndDropHooks}>
      {function renderItem(item: Pokemon) {
        return (
          <TreeViewItem textValue={item.name}>
            <TreeViewItemContent>
              <Text>
                {item.name} – {item.type}
              </Text>
            </TreeViewItemContent>
            <Collection items={item.children}>{renderItem}</Collection>
          </TreeViewItem>
        );
      }}
    </TreeView>
  );
}
