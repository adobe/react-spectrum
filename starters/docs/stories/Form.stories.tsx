import {Form} from '../src/Form';
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField
} from 'react-aria-components';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Form>;

export const Example: Story = (args) => (
  <Form {...args}>
    <TextField name="email" type="email" isRequired>
      <Label>Email</Label>
      <Input />
      <FieldError />
    </TextField>
    <Button type="submit">Submit</Button>
  </Form>
);
