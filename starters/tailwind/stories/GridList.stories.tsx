import { Meta } from '@storybook/react';
import { GridList, GridListHeader, GridListItem} from '../src/GridList';
import { GridListSection } from 'react-aria-components';
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

export const Sections = (args: any) => (
  <GridList aria-label="Food" {...args}>
    <GridListSection>
      <GridListHeader>Fruits</GridListHeader>
      <GridListItem id="Apple">Apple</GridListItem>
      <GridListItem id="Grape">Grape</GridListItem>
      <GridListItem id="Peach">Peach</GridListItem>
      <GridListItem id="Melon">Melon</GridListItem>
    </GridListSection>
    <GridListSection>
      <GridListHeader>Vegetables</GridListHeader>
      <GridListItem id="brocoli">Broccoli</GridListItem>
      <GridListItem id="peas">Peas</GridListItem>
      <GridListItem id="brussels-sprouts">Brussels Sprouts</GridListItem>
      <GridListItem id="zucchini">Zucchini</GridListItem>
    </GridListSection>
  </GridList>
);

Sections.args = {
  onAction: null,
  selectionMode: 'multiple'
};

