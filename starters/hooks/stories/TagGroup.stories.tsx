import {Tag, TagGroup} from '../src/TagGroup';
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
    <Tag id="chocolate">Chocolate</Tag>
    <Tag id="mint">Mint</Tag>
    <Tag id="strawberry">Strawberry</Tag>
    <Tag id="vanilla">Vanilla</Tag>
  </TagGroup>
);
