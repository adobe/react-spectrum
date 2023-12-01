import { Form } from 'react-aria-components';
import {DateRangePicker} from '../src/DateRangePicker';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Trip dates'
  }
};

export default meta;

export const Example = (args: any) => <DateRangePicker {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <DateRangePicker {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
