import type { Meta } from '@storybook/react';
import { GridList, GridListItem } from '../src/GridList';
import React from 'react';

const meta: Meta<typeof GridList> = {
  component: GridList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <GridList aria-label="Ice cream flavors" {...args}>
    <GridListItem id="chocolate">Chocolate</GridListItem>
    <GridListItem id="mint">Mint</GridListItem>
    <GridListItem id="strawberry">Strawberry</GridListItem>
    <GridListItem id="vanilla">Vanilla</GridListItem>
  </GridList>
);

Example.args = {
  onAction: null,
  selectionMode: 'multiple'
};

export const DisabledItems = (args: any) => <Example {...args} />;
DisabledItems.args = {
  ...Example.args,
  disabledKeys: ['mint']
};
