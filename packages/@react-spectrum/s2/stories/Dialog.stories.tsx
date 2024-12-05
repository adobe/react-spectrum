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

import {Button, ButtonGroup, Checkbox, Content, Dialog, DialogContainer, DialogTrigger, Footer, Header, Heading, Image, Provider} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useState} from 'react';

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      controls: {exclude: ['showHero', 'showHeading', 'showHeader', 'showFooter', 'showButtons', 'paragraphs', 'title']}
    }
  },
  tags: ['autodocs'],
  title: 'Dialog'
};

export default meta;

export const Example = {
  render: (args: any) => (
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
  )
};

export const DialogTriggerExample = {
  render: (args: any) => (
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

function ExampleDialog(args: any) {
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

function DialogContainerExampleRender(props: any) {
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

export const DialogContainerExample = {
  render: (args) => <DialogContainerExampleRender {...args} />,
  args: DialogTriggerExample.args
};

export const ColorScheme = {
  render: (args: any) => (
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
