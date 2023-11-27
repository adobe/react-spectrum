import {TextField} from '../src/TextField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => <TextField {...args} />;

Example.args = {
  label: 'Name'
};
