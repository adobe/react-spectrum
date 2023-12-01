import {ActionButton} from '../src/ActionButton';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
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

type Story = StoryObj<typeof ActionButton>;
export const Example: Story = {
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=702-2877&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
