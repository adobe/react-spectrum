import {Item} from 'react-stately/Item';
import {Button} from '../src/Button';
import {GridList} from '../src/GridList';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof GridList> = {
  component: GridList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof GridList>;

export const Example: Story = args => (
  <GridList aria-label="Pokémon" selectionMode="multiple" selectionBehavior="replace" {...args}>
    <Item textValue="Charizard">
      Charizard
      <Button variant="secondary" onPress={() => alert('Info for Charizard')}>
        Info
      </Button>
    </Item>
    <Item textValue="Blastoise">
      Blastoise
      <Button variant="secondary" onPress={() => alert('Info for Blastoise')}>
        Info
      </Button>
    </Item>
    <Item textValue="Venusaur">
      Venusaur
      <Button variant="secondary" onPress={() => alert('Info for Venusaur')}>
        Info
      </Button>
    </Item>
  </GridList>
);
