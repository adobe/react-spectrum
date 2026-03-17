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
  Button,
  Content,
  ContextualHelp,
  Footer,
  Form,
  Heading,
  Link,
  NumberField,
  Text
} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}},
    placeholder: {control: {type: 'text'}}
  },
  args: {
    placeholder: 'How many items?'
  },
  tags: ['autodocs'],
  title: 'NumberField'
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Example: Story = {
  render: (args) => (
    <NumberField {...args} />
  ),
  args: {
    label: 'Quantity'
  }
};

export const Validation: Story = {
  render: (args) => (
    <Form>
      <NumberField {...args} />
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    label: 'Quantity',
    isRequired: true
  }
};

export const CustomWidth: Story = {
  render: (args) => <NumberField {...args} styles={style({width: 384})} />,
  args: {
    label: 'Large quantity'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};


export const ContextualHelpExample: Story = {
  render: (args) => (
    <NumberField
      {...args}
      contextualHelp={
        <ContextualHelp>
          <Heading>Quantity</Heading>
          <Content>
            <Text>
              Pick a number between negative infinity and positive infinity.
            </Text>
          </Content>
          <Footer>
            <Link
              isStandalone
              href="https://en.wikipedia.org/wiki/Quantity"
              target="_blank">Learn more about quantity</Link>
          </Footer>
        </ContextualHelp>
      } />
  ),
  args: {
    label: 'Quantity'
  }
};
