import {Tooltip} from '../src/Tooltip';
import {Button, TooltipTrigger} from 'react-aria-components';

import type {Meta} from '@storybook/react';

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
    <Button><span role="img" aria-label="">💾</span></Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);

export const LongLabel = (args: any) => (
  <TooltipTrigger>
    <Button><span role="img" aria-label="">💾</span></Button>
    <Tooltip {...args}>Checkbox with very long label so we can see wrapping</Tooltip>
  </TooltipTrigger>
);
