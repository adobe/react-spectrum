import {MyToastRegion, queue} from '../src/Toast';
import {Button} from '../src/Button';
import type {Meta, StoryObj} from '@storybook/react';

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

function MyToast(props: ToastProps<MyToastContent>) {
  return <Toast {...props} />;
}

function MyToastRegion() {
  return (
    <ToastRegion queue={queue}>
      {({toast}) => (
        <MyToast toast={toast}>
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
            )}
          </ToastContent>
          <Button slot="close" aria-label="Close" variant="quiet">
            <X size={16} />
          </Button>
        </MyToast>
      )}
    </ToastRegion>
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
