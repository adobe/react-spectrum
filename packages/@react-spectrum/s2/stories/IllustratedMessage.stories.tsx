import type {Meta} from '@storybook/react';
import {IllustratedMessage, Button, Illustration, Heading, Content, ButtonGroup} from '../src';
import Cloud from '../spectrum-illustrations/Cloud.svg';

const meta: Meta<typeof IllustratedMessage> = {
  component: IllustratedMessage,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=20032%3A601&mode=dev'
    }
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <IllustratedMessage {...args}>
    <Illustration>
      <Cloud />
    </Illustration>
    <Heading>
      Illustrated message title
    </Heading>
    <Content>
      Illustrated message description. Give more information about what a user can do, expect, or how to make items appear.    </Content>
    <ButtonGroup>
      <Button variant="secondary" >Label</Button>
      <Button variant="accent" >Label</Button>
    </ButtonGroup>
  </IllustratedMessage>
);

export const NoButtonLongText = (args: any) => (
  <IllustratedMessage {...args}>
    <Illustration>
      <Cloud />
    </Illustration>
    <Heading>
      Error 403: Access not allowed
    </Heading>
    <Content>
      You do not have permission to access this page. Try checking the URL or visit a different page.
    </Content>
  </IllustratedMessage>
);

export const NoButtonShortText = (args: any) => (
  <IllustratedMessage {...args}>
    <Illustration>
      <Cloud />
    </Illustration>
    <Heading>
      Error 504: Server timeout
    </Heading>
    <Content>
      The server took too long. Please try again later.
    </Content>
  </IllustratedMessage>
);

