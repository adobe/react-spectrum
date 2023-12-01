import { Form } from 'react-aria-components';
import {DateField} from '../src/DateField';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Event date'
  }
};

export default meta;

export const Example = (args: any) => <DateField {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <DateField {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
