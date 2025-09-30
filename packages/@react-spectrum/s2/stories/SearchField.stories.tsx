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

import {categorizeArgTypes, getActionArgs} from './utils';
import {
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  SearchField,
  Text
} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const events = ['onChange', 'onClear', 'onSubmit'];

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}},
    placeholder: {control: {type: 'text'}}
  },
  args: {
    ...getActionArgs(events),
    placeholder: 'Search documents'
  },
  title: 'SearchField'
};

export default meta;
type Story = StoryObj<typeof SearchField>;

export const Example: Story = {
  render: (args) => <SearchField {...args} />,
  args: {
    label: 'Search'
  }
};

export const CustomWidth: Story = {
  render: (args) => <SearchField {...args} styles={style({width: 256})} />,
  args: {
    label: 'Search'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <SearchField
      {...args}
      contextualHelp={
        <ContextualHelp>
          <Heading>Search tips</Heading>
          <Content>
            <Text>
              You can use modifiers like "date:" and "from:" to search by specific attributes.
            </Text>
          </Content>
          <Footer>
            <Link
              isStandalone
              href="https://react-spectrum.adobe.com/"
              target="_blank">React Spectrum</Link>
          </Footer>
        </ContextualHelp>
      } />
  ),
  args: {
    label: 'Search'
  }
};
