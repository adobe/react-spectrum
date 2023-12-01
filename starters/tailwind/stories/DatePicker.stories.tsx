import { Form } from 'react-aria-components';
import {DatePicker} from '../src/DatePicker';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Event date'
  }
};

export default meta;

export const Example = (args: any) => <DatePicker {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <DatePicker {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
