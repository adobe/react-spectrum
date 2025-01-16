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

import {Button, ButtonGroup, Content, Heading, IllustratedMessage} from '../src';
import Cloud from '../spectrum-illustrations/linear/Cloud';
import Folder from '../spectrum-illustrations/gradient/generic2/FolderOpen';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof IllustratedMessage> = {
  component: IllustratedMessage,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/IllustratedMessage'
};

export default meta;

export const Example = {
  render: (args: any) => (
    <IllustratedMessage {...args}>
      <Cloud />
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
  )
};

export const NoButtonLongText = {
  render: (args: any) => (
    <IllustratedMessage {...args}>
      <Cloud />
      <Heading>
        Error 403: Access not allowed
      </Heading>
      <Content>
        You do not have permission to access this page. Try checking the URL or visit a different page.
      </Content>
    </IllustratedMessage>
  )
};

export const NoButtonShortText = {
  render: (args: any) => (
    <IllustratedMessage {...args}>
      <Cloud />
      <Heading>
        Error 504: Server timeout
      </Heading>
      <Content>
        The server took too long. Please try again later.
      </Content>
    </IllustratedMessage>
  )
};

export const Gradient = {
  render: (args: any) => (
    <IllustratedMessage {...args}>
      <Folder />
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
  )
};
