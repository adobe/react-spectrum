import {Item} from 'react-stately/Item';
import {ListBox} from '../src/ListBox';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ListBox> = {
  component: ListBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListBox>;

export const Example: Story = args => (
  <ListBox aria-label="Favorite animal" selectionMode="single" {...args}>
    <Item>Aardvark</Item>
    <Item>Cat</Item>
    <Item>Dog</Item>
    <Item>Kangaroo</Item>
    <Item>Panda</Item>
    <Item>Snake</Item>
  </ListBox>
);
