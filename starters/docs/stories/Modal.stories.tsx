import {Modal} from '../src/Modal';
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Input,
  Label,
  TextField
} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal {...args}>
      <Dialog>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField autoFocus>
            <Label>First Name:</Label>
            <Input />
          </TextField>
          <TextField>
            <Label>Last Name:</Label>
            <Input />
          </TextField>
          <Button slot="close">
            Submit
          </Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
