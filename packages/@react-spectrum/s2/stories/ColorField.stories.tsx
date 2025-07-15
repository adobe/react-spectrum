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
  ColorField,
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  Text
} from '../src/';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}},
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}}
  },
  title: 'ColorField'
};

export default meta;
type Story = StoryObj<typeof ColorField>;

export const Example: Story = {
  render: (args) => <ColorField {...args} />,
  args: {
    label: 'Color'
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <ColorField
      {...args}
      contextualHelp={
        <ContextualHelp>
          <Heading>Color</Heading>
          <Content>
            <Text>
              Pick your favorite color.
            </Text>
          </Content>
          <Footer>
            <Link
              isStandalone
              href="https://en.wikipedia.org/wiki/Color"
              target="_blank">Learn more about color</Link>
          </Footer>
        </ContextualHelp>
    } />
  ),
  args: {
    label: 'Color'
  }
};
