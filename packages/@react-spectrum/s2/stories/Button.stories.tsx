import {Button} from '../src/Button';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => <Button variant="accent" {...args}>Press me</Button>;
