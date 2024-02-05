import {RadioGroup} from '../src/RadioGroup';
import {Radio} from '../src/Radio';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <RadioGroup description="A long description to test help text wrapping." errorMessage="A long error message to test help text wrapping. Only shows when invalid is set which makes it red too!" {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="football" isDisabled>Football</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};
