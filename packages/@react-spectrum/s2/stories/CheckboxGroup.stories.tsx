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

import {
  Checkbox,
  CheckboxGroup,
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  Text
} from '../src';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}}
  },
  title: 'CheckboxGroup'
};

export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

export const Example: Story = {
  render(args) {
    return (
      <CheckboxGroup {...args}>
        <Checkbox isEmphasized value="soccer">Soccer</Checkbox>
        <Checkbox value="baseball">Baseball</Checkbox>
        <Checkbox value="basketball">Basketball</Checkbox>
      </CheckboxGroup>
    );
  },
  args: {
    label: 'Favorite sports'
  }
};

export const ContextualHelpExample = (args: any) => (
  <CheckboxGroup 
    {...args}
    contextualHelp={
      <ContextualHelp>
        <Heading>Sports</Heading>
        <Content>
          <Text>
            Social games we paly to have fun and stay healthy.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://en.wikipedia.org/wiki/Sport"
            target="_blank">Learn more about sports</Link>
        </Footer>
      </ContextualHelp>
    }>
    <Checkbox isEmphasized value="soccer">Soccer</Checkbox>
    <Checkbox value="baseball">Baseball</Checkbox>
    <Checkbox value="basketball">Basketball</Checkbox>
  </CheckboxGroup>
);

ContextualHelpExample.args = {
  label: 'Favorite sports',
  contextualHelp: (
    <ContextualHelp>
      <Heading>Sports</Heading>
      <Content>
        <Text>
          Social games we paly to have fun and stay healthy.
        </Text>
      </Content>
      <Footer>
        <Link
          isStandalone
          href="https://en.wikipedia.org/wiki/Sport"
          target="_blank">Learn more about sports</Link>
      </Footer>
    </ContextualHelp>
  )
};
