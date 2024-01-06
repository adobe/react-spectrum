import {Form} from '../src/Form';
import { TextField } from '../src/TextField';
import { DateField } from '../src/DateField';
import { Button } from '../src/Button';
import React from 'react';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Form {...args}>
    <TextField label="Email" name="email" type="email" isRequired />
    <DateField label="Birth date" isRequired />
    <div className="flex gap-2">
      <Button type="submit">Submit</Button>
      <Button type="reset" variant="secondary">Reset</Button>
    </div>
  </Form>
);
