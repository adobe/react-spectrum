import {Popover} from '../src/Popover';
import {DialogTrigger} from '../src/DialogTrigger'; // where do we want to import this from?
import {Button} from '../src/Button';
import NewIcon from '../src/wf-icons/New';
import type {Meta, StoryObj} from '@storybook/react';
import {Content, Footer, Heading} from '../src/Content';
import {TextField} from '../src/TextField';
import {Form} from '../src/Form';
import {Dialog} from '../src/Dialog';
import {ButtonGroup} from '../src';
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
    let {placement, hideArrow, shouldFlip, isOpen, onOpenChange, defaultOpen, ...props} = args;
    return (
      <DialogTrigger
        type="popover"
        placement={placement}
        hideArrow={hideArrow}
        shouldFlip={shouldFlip}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        defaultOpen={defaultOpen}>
        <Button aria-label="Help"><NewIcon /></Button>
        <Dialog {...props}>
          <Heading slot="title">Help</Heading>
          <Content slot="body">
            <Form>
              <TextField label="First Name" name="firstName" />
              <TextField label="Last Name" name="firstName" />
            </Form>
          </Content>
          <Footer>
            <ButtonGroup>
              <Button type="submit" variant="primary">Submit</Button>
            </ButtonGroup>
          </Footer>
        </Dialog>
      </DialogTrigger>
    );
  }
};
