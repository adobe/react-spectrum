import {Select, SelectItem} from '../src/Select';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
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
