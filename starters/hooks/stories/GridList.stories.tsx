import {Button} from '../src/Button';
import {GridList, GridListItem} from '../src/GridList';
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
    <GridListItem id="charizard" textValue="Charizard">
      Charizard
      <Button variant="secondary" onPress={() => alert('Info for Charizard')}>
        Info
      </Button>
    </GridListItem>
    <GridListItem id="blastoise" textValue="Blastoise">
      Blastoise
      <Button variant="secondary" onPress={() => alert('Info for Blastoise')}>
        Info
      </Button>
    </GridListItem>
    <GridListItem id="venusaur" textValue="Venusaur">
      Venusaur
      <Button variant="secondary" onPress={() => alert('Info for Venusaur')}>
        Info
      </Button>
    </GridListItem>
  </GridList>
);
