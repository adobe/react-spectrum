import React from 'react';
import { Form } from 'react-aria-components';
import { Button } from '../src/Button';
import { Radio, RadioGroup } from '../src/RadioGroup';

export default {
  title: 'RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    label: 'Favorite sport',
    isDisabled: false,
    isRequired: false,
    description: '',
    children: <>
      <Radio value="soccer">Soccer</Radio>
      <Radio value="baseball">Baseball</Radio>
      <Radio value="basketball">Basketball</Radio>
    </>
  }
};

export const Default = {
  args: {},
};

export const Validation = (args: any) => (
  <Form className="flex flex-col gap-2 items-start">
    <RadioGroup {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
