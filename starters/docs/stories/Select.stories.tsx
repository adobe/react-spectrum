import {Select, SelectItem} from '../src/Select';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Select>;

export const Example: Story = (args) => (
  <Select {...args}>
    <SelectItem>Chocolate</SelectItem>
    <SelectItem>Mint</SelectItem>
    <SelectItem>Strawberry</SelectItem>
    <SelectItem>Vanilla</SelectItem>
  </Select>
);

Example.args = {
  label: 'Ice cream flavor'
};
