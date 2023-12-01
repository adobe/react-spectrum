import { Form } from 'react-aria-components';
import {ComboBox, ComboBoxItem} from '../src/ComboBox';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof ComboBox> = {
  component: ComboBox,
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
  <ComboBox {...args}>
    <ComboBoxItem>Chocolate</ComboBoxItem>
    <ComboBoxItem id="mint">Mint</ComboBoxItem>
    <ComboBoxItem>Strawberry</ComboBoxItem>
    <ComboBoxItem>Vanilla</ComboBoxItem>
  </ComboBox>
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
