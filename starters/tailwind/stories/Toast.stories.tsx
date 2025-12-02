import {MyToastRegion, queue} from '../src/Toast';
import {Button} from '../src/Button';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

interface ToastStoryArgs {
  title: string;
  description?: string;
  timeout?: number;
  buttonLabel: string;
}

const meta: Meta<ToastStoryArgs> = {
  title: 'Toast',
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the toast.'
    },
    description: {
      control: 'text',
      description: 'Optional description text.'
    },
    timeout: {
      control: 'number',
      description: 'Auto-dismiss timeout in milliseconds.'
    },
    buttonLabel: {
      control: 'text',
      description: 'Label for the trigger button.'
    }
  },
  args: {
    title: 'Files uploaded',
    description: '3 files uploaded successfully.',
    buttonLabel: 'Show toast'
  }
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

export const Example: Story = {
  render: (args) => (
    <>
      <MyToastRegion />
      <Button onPress={() => queue.add(
        {title: args.title, description: args.description},
        args.timeout ? {timeout: args.timeout} : undefined
      )}>
        {args.buttonLabel}
      </Button>
    </>
  ),
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
const queue = new ToastQueue<MyToastContent>();

function MyToastRegion() {
  return (
    <ToastRegion
      queue={queue}
      className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
      {({toast}) => (
        <MyToast toast={toast}>
          <ToastContent className="flex flex-col flex-1 min-w-0">
            <Text slot="title" className="font-semibold text-white">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description" className="text-sm text-white">{toast.content.description}</Text>
            )}
          </ToastContent>
          <Button
            slot="close"
            aria-label="Close"
            className="flex-none appearance-none w-8 h-8 rounded-sm bg-transparent border-none text-white p-0 outline-none hover:bg-white/10 pressed:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2">
            <X className="w-4 h-4" />
          </Button>
        </MyToast>
      )}
    </ToastRegion>
  );
}

function MyToast(props: ToastProps<MyToastContent>) {
  return (
    <Toast
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "flex items-center gap-4 bg-blue-600 px-4 py-3 rounded-lg outline-none forced-colors:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
      )}
    />
  );
}

<>
  <MyToastRegion />
  <Button onPress={() => queue.add(
    {title: args.title, description: args.description},
    args.timeout ? {timeout: args.timeout} : undefined
  )}>
    {args.buttonLabel}
  </Button>
</>`;
        }
      }
    }
  }
};
