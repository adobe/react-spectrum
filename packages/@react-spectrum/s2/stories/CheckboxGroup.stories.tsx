import {CheckboxGroup, Checkbox} from '../src';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <CheckboxGroup {...args}>
    <Checkbox value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);


export const CheckboxGroupOverridesIsEmphasized = (args: any) => (
  <CheckboxGroup {...args}>
    <Checkbox isEmphasized value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);

Example.args = {
  label: 'Favorite sports'
};

CheckboxGroupOverridesIsEmphasized.args = {
  label: 'Favorite sports'
};
