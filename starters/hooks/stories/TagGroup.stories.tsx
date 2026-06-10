import {Item} from 'react-stately/Item';
import {TagGroup} from '../src/TagGroup';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof TagGroup> = {
  component: TagGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof TagGroup>;

export const Example: Story = args => (
  <TagGroup label="Ice cream flavor" selectionMode="single" {...args}>
    <Item>Chocolate</Item>
    <Item>Mint</Item>
    <Item>Strawberry</Item>
    <Item>Vanilla</Item>
  </TagGroup>
);
