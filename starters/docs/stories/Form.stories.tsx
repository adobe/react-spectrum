import {Form} from '../src/Form';
import {Button} from '../src/Button';
import {TextField} from '../src/TextField';

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
    <TextField name="email" type="email" isRequired label="Email" placeholder="Enter your email" />
    <Button type="submit">Submit</Button>
  </Form>
);
