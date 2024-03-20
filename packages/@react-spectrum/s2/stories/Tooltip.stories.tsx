import {Tooltip, TooltipTrigger, Button} from '../src';
import type {Meta} from '@storybook/react';
import NewIcon from '../src/wf-icons/New';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=4955%3A40'
    }
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <TooltipTrigger>
    <Button aria-label="New"><NewIcon /></Button>
    <Tooltip {...args}>New</Tooltip>
  </TooltipTrigger>
);

export const LongLabel = (args: any) => (
  <TooltipTrigger>
    <Button aria-label="New"><NewIcon /></Button>
    <Tooltip {...args}>Checkbox with very long label so we can see wrapping</Tooltip>
  </TooltipTrigger>
);
