'use client';
import {Table, TableHeader, Column, TableBody, Row, Cell} from 'vanilla-starter/Table';
import {DragAndDropHooks} from 'react-aria-components';

export interface Pokemon {
  id: number,
  name: string,
  type: string,
  level?: number
}

interface PokemonTableProps {
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

export function PokemonTable(props: PokemonTableProps) {
  let {items = defaultItems, dragAndDropHooks} = props;

  return (
    <Table
      aria-label="Pokemon table"
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Level</Column>
      </TableHeader>
      <TableBody items={items} renderEmptyState={() => 'Drop items here'}>
        {item => (
          <Row>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.level}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}
