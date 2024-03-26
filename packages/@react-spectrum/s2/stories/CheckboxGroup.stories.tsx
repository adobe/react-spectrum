import {CheckboxGroup, Checkbox} from '../src';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

export const Example: Story = {
  render(args) {
    return (
      <CheckboxGroup {...args}>
        <Checkbox isEmphasized value="soccer">Soccer</Checkbox>
        <Checkbox value="baseball">Baseball</Checkbox>
        <Checkbox value="basketball">Basketball</Checkbox>
      </CheckboxGroup>
    );
  },
  args: {
    label: 'Favorite sports'
  }
};

export const CheckboxGroupOverridesIsEmphasized: Story = {
  render(args) {
    return (
      <CheckboxGroup {...args}>
        <Checkbox isEmphasized value="soccer">Soccer</Checkbox>
        <Checkbox value="baseball">Baseball</Checkbox>
        <Checkbox value="basketball">Basketball</Checkbox>
      </CheckboxGroup>
    );
  },
  parameters: {
    docs: {
      disable: true
    }
  },
  args: {
    label: 'Favorite sports'
  }
};

