import {Modal} from '../src/Modal';
import {DialogTrigger} from 'react-aria-components';

import type {Meta} from '@storybook/react';
import {Dialog} from '../src/Dialog';
import {ButtonGroup, Content, Footer, Heading, Header, Image} from '../src/Content';
import {Button} from '../src/Button';
import {Checkbox} from '../src/Checkbox';

const meta: Meta<typeof Modal & typeof Dialog> = {
  component: Modal as any,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => (
  <DialogTrigger>
    <Button variant="primary">Open dialog</Button>
    <Modal {...args}>
      <Dialog size={args.size} isDismissable={args.isDismissable}>
        {({close}) => (
          <>
            {args.showHero && <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" />}
            {args.showHeading && <Heading slot="title">{args.title}</Heading>}
            {args.showHeader && <Header>Header</Header>}
            <Content>
              {[...Array(args.paragraphs)].map((_, i) => 
                <p style={{marginTop: i === 0 ? 0 : undefined, marginBottom: i === args.paragraphs - 1 ? 0 : undefined}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
              )}
            </Content>
            {args.showFooter && <Footer><Checkbox>Don't show this again</Checkbox></Footer>}
            {args.showButtons &&
              <ButtonGroup>
                <Button onPress={close} variant="secondary">Cancel</Button>
                <Button onPress={close} variant="accent">Save</Button>
              </ButtonGroup>
            }
          </>
        )}
      </Dialog>
    </Modal>
  </DialogTrigger>
);

Example.args = {
  showHero: true,
  showHeading: true,
  showHeader: true,
  showFooter: true,
  showButtons: true,
  paragraphs: 1,
  title: 'Dialog title'
};
