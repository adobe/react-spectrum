import {ProgressCircle} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=13120%3A401&mode=dev'
    }
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Example: Story = {
  render: (args) => <ProgressCircle aria-label="Test Progress Circle" {...args} />,
  args: {
    staticColor: undefined,
    value: 80
  },
  argTypes: {
    staticColor: {
      control: 'select',
      options: [undefined, 'white', 'black']
    },
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    }
  }
};
