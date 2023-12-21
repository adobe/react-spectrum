import {ListBox, ListBoxItem} from '../src/ListBox';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof ListBox> = {
  component: ListBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <ListBox aria-label="Ice cream flavor" {...args}>
    <ListBoxItem>Chocolate</ListBoxItem>
    <ListBoxItem>Mint</ListBoxItem>
    <ListBoxItem>Strawberry</ListBoxItem>
    <ListBoxItem>Vanilla</ListBoxItem>
  </ListBox>
);

Example.args = {
  onAction: null,
  selectionMode: 'single'
};
