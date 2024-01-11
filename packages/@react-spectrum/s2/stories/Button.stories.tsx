import {Button} from '../src/Button';

import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Example: Story = {
  render: (args) => <Button {...args}>Press me</Button>,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
