import {Tooltip} from '../src/Tooltip';
import {Button, TooltipTrigger} from 'react-aria-components';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Tooltip>;

export const Example: Story = (args) => (
  <TooltipTrigger>
    <Button>💾</Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
