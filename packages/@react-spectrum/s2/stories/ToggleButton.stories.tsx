import {ToggleButton} from '../src/ToggleButton';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <ToggleButton {...args}>Pin
</ToggleButton>;
