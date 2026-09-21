'use client';
import {TableView, TableHeader, Column, TableBody, Row, Cell} from '@react-spectrum/s2/TableView';
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

interface PokemonTableViewProps {
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

export function PokemonTableView(props: PokemonTableViewProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <TableView
      styles={style({height: 250, width: 250})}
      aria-label="Pokemon table"
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Level</Column>
      </TableHeader>
      <TableBody items={items} renderEmptyState={renderEmptyState}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.level}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
