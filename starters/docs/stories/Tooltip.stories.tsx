import {Tooltip} from '../src/Tooltip';
import {TooltipTrigger} from 'react-aria-components';
import {Button} from '../src/Button';
import {Save} from 'lucide-react';

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
    <Button><Save /></Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
