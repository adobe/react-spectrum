import {Tooltip} from '../src/Tooltip';
import {Button, TooltipTrigger} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => (
  <TooltipTrigger>
    <Button><span role="img" aria-label="">💾</span></Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
