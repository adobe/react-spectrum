/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Content, Flex, Footer, Heading, Link, Text} from '@adobe/react-spectrum';
import {ContextualHelp} from '../src';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

export default {
  title: 'ContextualHelp',
  component: ContextualHelp,
  argTypes: {
    onOpenChange: {
      action: 'openChange',
      table: {disable: true}
    },
    placement: {
      control: 'select',
      options: [
        'bottom', 'bottom left', 'bottom right', 'bottom start', 'bottom end',
        'top', 'top left', 'top right', 'top start', 'top end',
        'left', 'left top', 'left bottom',
        'start', 'start top', 'start bottom',
        'right', 'right top', 'right bottom',
        'end', 'end top', 'end bottom'
      ]
    },
    variant: {
      control: 'select',
      defaultValue: 'help',
      options: ['help', 'info']
    },
    offset: {
      control: 'number',
      min: -500,
      max: 500
    },
    crossOffset: {
      control: 'number',
      min: -500,
      max: 500
    },
    containerPadding: {
      control: 'number',
      min: -500,
      max: 500
    },
    shouldFlip: {
      control: 'boolean'
    },
    children: {
      table: {disable: true}
    }
  }
} as Meta<typeof ContextualHelp>;

export type ContextualHelpStory = StoryObj<typeof ContextualHelp>;

const helpText = () => <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem.</Text>;

export const Default: ContextualHelpStory = {
  args: {
    children: (
      <>
        <Heading>Help title</Heading>
        <Content>{helpText()}</Content>
      </>
    )
  }
};

export const WithLink: ContextualHelpStory = {
  args: {
    children: (
      <>
        <Heading>Help title</Heading>
        <Content>{helpText()}</Content>
        <Footer><Link>Learn more</Link></Footer>
      </>
    )
  },
  name: 'with link'
};

export const WithButton: ContextualHelpStory = {
  args: {
    marginStart: 'size-100'
  },
  render: (args) => (
    <Flex alignItems="center">
      <Button variant="primary" isDisabled>Create</Button>
      <ContextualHelp {...args} UNSAFE_className="foo">
        <Heading>Help title</Heading>
        <Content>{helpText()}</Content>
      </ContextualHelp>
    </Flex>
  ),
  name: 'with button',
  parameters: {description: {data: 'Custom classname foo is on the contextual help button.'}}
};

export const AriaLabelledyBy: ContextualHelpStory = {
  render: (args) => (
    <Flex alignItems="center">
      <div id="foo">I label the contextual help button</div>
      <ContextualHelp {...args} aria-labelledby="foo">
        <Heading>Help title</Heading>
        <Content>{helpText()}</Content>
      </ContextualHelp>
    </Flex>
  ),
  name: 'aria-labelledyby'
};
