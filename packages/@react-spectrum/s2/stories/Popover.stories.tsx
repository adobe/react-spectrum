import {Popover} from '../src/Popover';
import {DialogTrigger} from '../src/DialogTrigger'; // where do we want to import this from?
import {Button} from '../src/Button';
import NewIcon from '../src/wf-icons/New';
import type {Meta, StoryObj} from '@storybook/react';
import {Content, Heading} from '../src/Content';
import {TextField} from '../src/TextField';
import {Form} from '../src/Form';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {Dialog} from '../src/Dialog';
// this Dialog has a lot of styles and conditional rendering, where do we actually want to get this from?
// a different one for Popovers?
// this is the current API for v3


const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Example: Story = {
  render: (args: any) => {
    let {placement, hideArrow, shouldFlip, ...props} = args;
    return (
      <DialogTrigger type="popover" placement={placement} hideArrow={hideArrow} shouldFlip={shouldFlip}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Dialog {...props}>
          <Heading slot="title">Help</Heading>
          <Content slot="body">
            <Form>
              <TextField label="First Name" name="firstName" />
              <TextField label="Last Name" name="firstName" />
              <Button type="submit" variant="primary" className={style({gridColumnStart: 'field', width: 'fit'})()}>Submit</Button>
            </Form>
          </Content>
        </Dialog>
      </DialogTrigger>
    );
  }
};
