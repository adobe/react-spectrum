import type {Meta} from '@storybook/react';
import { Form } from 'react-aria-components';
import {NumberField} from '../src/NumberField';
import { Button } from '../src/Button';

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Cookies'
  }
};

export default meta;

export const Example = (args: any) => <NumberField {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <NumberField {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
