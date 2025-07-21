import {Modal} from '../src/Modal';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {TextField} from '../src/TextField';
import {Button} from '../src/Button';
import {Heading} from '../src/Content';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Modal>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal {...args}>
      <Dialog>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField autoFocus label='First Name:' />
          <TextField label='Last Name:' />
          <Button slot="close">
            Submit
          </Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
