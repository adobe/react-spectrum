import {Button} from '../src/Button';
import {FunctionComponent} from "react";

import type {Meta, StoryObj} from '@storybook/react';
import {SpectrumButtonProps} from "@adobe/react-spectrum";

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    
  },
  args: {
    children: 'Button'
  }
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Example: Story = {
};
