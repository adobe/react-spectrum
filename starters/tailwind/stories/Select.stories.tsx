import { Form } from 'react-aria-components';
import {Select, SelectItem} from '../src/Select';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Ice cream flavor'
  }
};

export default meta;

export const Example = (args: any) => (
  <Select {...args}>
    <SelectItem>Chocolate</SelectItem>
    <SelectItem id="mint">Mint</SelectItem>
    <SelectItem>Strawberry</SelectItem>
    <SelectItem>Vanilla</SelectItem>
  </Select>
);

export const DisabledItems = (args: any) => <Example {...args} />;
DisabledItems.args = {
  disabledKeys: ['mint']
};

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <Example {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
