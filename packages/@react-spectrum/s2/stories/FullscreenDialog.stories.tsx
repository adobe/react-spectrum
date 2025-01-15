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

import {Button, ButtonGroup, Content, DialogTrigger, FullscreenDialog, Header, Heading} from '../src';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof FullscreenDialog> = {
  component: FullscreenDialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'FullscreenDialog'
};

export default meta;

export const Example = (args: any) => (
  <DialogTrigger {...args}>
    <Button variant="primary">Open dialog</Button>
    <FullscreenDialog {...args}>
      {({close}) => (
        <>
          <Heading slot="title">Dialog title</Heading>
          <Header>Header</Header>
          <Content>
            {[...Array(5)].map((_, i) =>
              <p key={i} style={{marginTop: i === 0 ? 0 : undefined, marginBottom: i === args.paragraphs - 1 ? 0 : undefined}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
            )}
          </Content>
          <ButtonGroup>
            <Button onPress={close} variant="secondary">Cancel</Button>
            <Button onPress={close} variant="accent">Save</Button>
          </ButtonGroup>
        </>
      )}
    </FullscreenDialog>
  </DialogTrigger>
);
