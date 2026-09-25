import {Button} from '../src/Button';
import {DialogTrigger} from '../src/Dialog';
import {Heading, Sheet} from '../src/Sheet';
import type {Meta, StoryFn} from '@storybook/react';
import {TextField} from '../src/TextField';

const meta: Meta<typeof Sheet> = {
  component: Sheet,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'left', 'right', 'center']
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Sheet>;

export const Example: Story = args => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Sheet {...args}>
      {({close}) => (
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField autoFocus label="First Name" placeholder="Enter your first name" />
          <TextField label="Last Name" placeholder="Enter your last name" />
          <Button onPress={close} style={{marginTop: 8}}>
            Submit
          </Button>
        </form>
      )}
    </Sheet>
  </DialogTrigger>
);

Example.args = {
  position: 'bottom'
};

// Snap points let the sheet rest partially open. It opens showing 180px of content, and can be
// dragged up to full height or down to dismiss.
export const SnapPoints: Story = args => (
  <DialogTrigger>
    <Button>Show details…</Button>
    <Sheet {...args}>
      {({close}) => (
        <>
          <Heading slot="title">Details</Heading>
          <p style={{marginTop: 0}}>
            Drag the handle up to expand this sheet to full height, or swipe it down to dismiss. It
            opens at a partial detent so the most relevant content is visible without resizing.
          </p>
          <Button onPress={close}>Done</Button>
        </>
      )}
    </Sheet>
  </DialogTrigger>
);

SnapPoints.args = {
  position: 'bottom',
  snapPoints: ['180px']
};
