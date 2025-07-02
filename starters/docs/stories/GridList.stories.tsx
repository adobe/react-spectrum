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

export const Example: Story = (args) => (
  <GridList aria-label="Ice cream flavors" {...args}>
    <GridListItem>Chocolate</GridListItem>
    <GridListItem>Mint</GridListItem>
    <GridListItem>Strawberry</GridListItem>
    <GridListItem>Vanilla</GridListItem>
  </GridList>
);

Example.args = {
  onAction: undefined,
  selectionMode: 'multiple'
};
