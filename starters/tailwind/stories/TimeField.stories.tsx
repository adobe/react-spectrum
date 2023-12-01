import { Form } from 'react-aria-components';
import {TimeField} from '../src/TimeField';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Event time'
  }
};

export default meta;

export const Example = (args: any) => <TimeField {...args} />;

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <TimeField {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
