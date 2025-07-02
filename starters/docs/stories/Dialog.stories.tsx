import {Dialog} from '../src/Dialog';
import {
  Button,
  DialogTrigger,
  Heading,
  Input,
  Label,
  Modal,
  TextField
} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal>
      <Dialog {...args}>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField autoFocus>
            <Label>First Name</Label>
            <Input />
          </TextField>
          <TextField>
            <Label>Last Name</Label>
            <Input />
          </TextField>
          <Button slot="close" style={{ marginTop: 8 }}>
            Submit
          </Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
