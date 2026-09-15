import {Cell, Column, Row, Table, TableBody, TableHeader} from '../src/Table';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Table> = {
  component: Table,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Table>;

export const Example: Story = args => (
  <Table aria-label="Pokémon" selectionMode="multiple" selectionBehavior="replace" {...args}>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
      <Column>Level</Column>
    </TableHeader>
    <TableBody>
      <Row key="charizard">
        <Cell>Charizard</Cell>
        <Cell>Fire, Flying</Cell>
        <Cell>67</Cell>
      </Row>
      <Row key="blastoise">
        <Cell>Blastoise</Cell>
        <Cell>Water</Cell>
        <Cell>56</Cell>
      </Row>
      <Row key="venusaur">
        <Cell>Venusaur</Cell>
        <Cell>Grass, Poison</Cell>
        <Cell>83</Cell>
      </Row>
      <Row key="pikachu">
        <Cell>Pikachu</Cell>
        <Cell>Electric</Cell>
        <Cell>100</Cell>
      </Row>
    </TableBody>
  </Table>
);
