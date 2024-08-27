import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../src/Button';
import { Checkbox, CheckboxGroup } from '../src/Checkbox';

export default {
  title: 'CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    label: 'Cities',
    isDisabled: false,
    isRequired: false,
    description: '',
    children: <>
      <Checkbox value="sf">San Francisco</Checkbox>
      <Checkbox value="ny">New York</Checkbox>
      <Checkbox value="sydney">Sydney</Checkbox>
      <Checkbox value="london">London</Checkbox>
      <Checkbox value="tokyo">Tokyo</Checkbox>
    </>
  }
};

export const Default = {
  args: {},
};

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <CheckboxGroup {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
