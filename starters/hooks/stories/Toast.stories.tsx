import {ToastProvider, Button} from '../src/Toast';
import type {Meta, StoryObj} from '@storybook/react';

interface ToastStoryArgs {
  message: string;
  buttonLabel: string;
}

const meta: Meta<ToastStoryArgs> = {
  title: 'Toast',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The text content of the toast.'
    },
    buttonLabel: {
      control: 'text',
      description: 'Label for the trigger button.'
    }
  },
  args: {
    message: 'Toast is done!',
    buttonLabel: 'Show toast'
  }
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Example: Story = {
  render: args => (
    <ToastProvider>
      {state => <Button onPress={() => state.add(args.message)}>{args.buttonLabel}</Button>}
    </ToastProvider>
  )
};
