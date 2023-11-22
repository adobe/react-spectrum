import {RadioGroup} from '../src/RadioGroup';
import {Radio} from 'react-aria-components';

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
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};
