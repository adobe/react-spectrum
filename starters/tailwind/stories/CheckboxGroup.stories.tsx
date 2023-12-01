import { Form } from 'react-aria-components';
import { CheckboxGroup, Checkbox } from '../src/Checkbox';
import { Button } from '../src/Button';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
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

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {
  args: {},
};

export const Description = {
  args: {
    description: 'Testing'
  },
};

export const Validation = (args) => (
  <Form className="flex flex-col gap-2 items-start">
    <CheckboxGroup {...args} />
    <Button type="submit" variant="secondary">Submit</Button>
  </Form>
);

Validation.args = {
  isRequired: true
};
