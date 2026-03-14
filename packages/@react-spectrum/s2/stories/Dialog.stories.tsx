/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, ButtonGroup, Checkbox, Content, Dialog, DialogContainer, DialogProps, DialogTrigger, Footer, Header, Heading, Image, Provider} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactElement, useState} from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      controls: {exclude: ['showHero', 'showHeading', 'showHeader', 'showFooter', 'showButtons', 'paragraphs', 'title']}
    }
  },
  argTypes: {
    children: {table: {disable: true}}
  },
  tags: ['autodocs'],
  title: 'Dialog'
};

export default meta;

interface ExampleRenderProps extends DialogProps {
  type: 'popover' | 'dialog',
  paragraphs: number,
  title: string
}

const ExampleRender = (args: ExampleRenderProps): ReactElement => (
  <DialogTrigger {...args}>
    <Button variant="primary">Open dialog</Button>
    <Dialog {...args}>
      {({close}) => (
        <>
          {args.type !== 'popover' && <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" alt="Sky over roof" />}
          <Heading slot="title">Dialog title</Heading>
          <Header>Header</Header>
          <Content>
            {[...Array(args.paragraphs)].map((_, i) =>
              <p key={i} style={{marginTop: i === 0 ? 0 : undefined, marginBottom: i === args.paragraphs - 1 ? 0 : undefined}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
            )}
          </Content>
          <Footer><Checkbox>Don't show this again</Checkbox></Footer>
          <ButtonGroup>
            <Button onPress={close} variant="secondary">Cancel</Button>
            <Button onPress={close} variant="accent">Save</Button>
          </ButtonGroup>
        </>
      )}
    </Dialog>
  </DialogTrigger>
);

export type ExampleStoryType = typeof ExampleRender;
export const Example: StoryObj<typeof ExampleRender> = {
  render: (args) => <ExampleRender {...args} />,
  argTypes: {
    type: {
      control: 'radio',
      options: ['popover', 'dialog']
    },
    paragraphs: {
      control: 'number',
      min: 1,
      max: 10
    }
  }
};

export const DialogTriggerExample: StoryObj<typeof ExampleDialog> = {
  render: (args) => (
    <DialogTrigger {...args}>
      <Button variant="primary">Open dialog</Button>
      <ExampleDialog {...args} />
    </DialogTrigger>
  ),
  args: {
    showHero: true,
    showHeading: true,
    showHeader: true,
    showFooter: true,
    showButtons: true,
    paragraphs: 1,
    title: 'Dialog title'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

interface ExampleDialogProps extends DialogProps {
  showHero?: boolean,
  showHeading?: boolean,
  showHeader?: boolean,
  showFooter?: boolean,
  showButtons?: boolean,
  paragraphs: number,
  title: string
}

function ExampleDialog(args: ExampleDialogProps): ReactElement {
  return (
    <Dialog {...args}>
      {({close}) => (
        <>
          {args.showHero && <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" alt="Sky over roof" />}
          {args.showHeading && <Heading slot="title">{args.title}</Heading>}
          {args.showHeader && <Header>Header</Header>}
          <Content>
            {[...Array(args.paragraphs)].map((_, i) =>
              <p key={i} style={{marginTop: i === 0 ? 0 : undefined, marginBottom: i === args.paragraphs - 1 ? 0 : undefined}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
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
  );
}

function DialogContainerExampleRender(props: ExampleDialogProps): ReactElement {
  let [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" onPress={() => setOpen(true)}>Open dialog</Button>
      <DialogContainer onDismiss={() => setOpen(false)} {...props}>
        {isOpen &&
          <ExampleDialog {...props} />
        }
      </DialogContainer>
    </>
  );
}

export const DialogContainerExample: StoryObj<typeof DialogContainerExampleRender> = {
  render: (args) => <DialogContainerExampleRender {...args} />,
  args: DialogTriggerExample.args,
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
let [isOpen, setOpen] = useState(false);

<Button variant="accent" onPress={() => setOpen(true)}>Open dialog</Button>
<DialogContainer onDismiss={() => setOpen(false)} {...props}>
  {isOpen &&
    <ExampleDialog {...props} />
  }
</DialogContainer>
          `;
        }
      }
    }
  }
};

export const ColorScheme: StoryObj<typeof ExampleDialog> = {
  render: (args) => (
    <Provider colorScheme="dark" background="base" styles={style({padding: 48})}>
      <DialogTrigger {...args}>
        <Button variant="primary">Open dialog</Button>
        <ExampleDialog {...args} />
      </DialogTrigger>
    </Provider>
  ),
  args: DialogTriggerExample.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};
