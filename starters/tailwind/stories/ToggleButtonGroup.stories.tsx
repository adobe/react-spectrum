import type { Meta } from '@storybook/react';
import React from 'react';
import { ToggleButton } from '../src/ToggleButton';
import { ToggleButtonGroup } from '../src/ToggleButtonGroup';
import { Bold, Italic, Underline } from 'lucide-react'

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <ToggleButtonGroup {...args}>
    <ToggleButton id="bold" aria-label="Bold"><Bold className="w-4 h-4" /></ToggleButton>
    <ToggleButton id="italic" aria-label="Italic"><Italic className="w-4 h-4" /></ToggleButton>
    <ToggleButton id="underline" aria-label="Underline"><Underline className="w-4 h-4" /></ToggleButton>
  </ToggleButtonGroup>
);

Example.args = {
  selectionMode: 'multiple'
};
