/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

export type ActionButtonStory = ComponentStoryObj<typeof ActionButton>;

export default {
  title: 'Button/ActionButton',
  component: ActionButton,
  args: {
    onPress: action('press'),
    onPressStart: action('pressstart'),
    onPressEnd: action('pressend')
  },
  argTypes: {
    onPress: {
      table: {
        disable: true
      }
    },
    onPressStart: {
      table: {
        disable: true
      }
    },
    onPressEnd: {
      table: {
        disable: true
      }
    },
    staticColor: {
      table: {
        disable: true
      }
    },
    isQuiet: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof ActionButton>;


export const Default: ActionButtonStory = {
  render: (args) => render(args)
};

export const WithIcon: ActionButtonStory = {
  render: (args) => renderWithIcon(args)
};

export const IconOnly: ActionButtonStory = {
  render: (args) => renderOnlyIcon(args)
};

export const StaticWhite: ActionButtonStory = {
  args: {staticColor: 'white'},
  render: (args) => (
    <View backgroundColor="static-blue-700" padding="size-1000">
      {renderWithIcon(args)}
    </View>
  ),
  name: 'staticColor: white'
};

export const StaticBlack: ActionButtonStory = {
  args: {staticColor: 'black'},
  render: (args) => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      {renderWithIcon(args)}
    </View>
  ),
  name: 'staticColor: black'
};

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <ActionButton
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        isDisabled
        {...props}>
        Disabled
      </ActionButton>
    </Flex>
  );
}

function renderWithIcon(props = {}) {
  return (
    <Flex gap="size-100">
      <ActionButton
        {...props}>
        <Add />
        <Text>Default</Text>
      </ActionButton>
      <ActionButton
        isDisabled
        {...props}>
        <Text>Disabled</Text>
        <Add />
      </ActionButton>
    </Flex>
  );
}

function renderOnlyIcon(props = {}) {
  return (
    <Flex gap="size-100">
      <ActionButton
        {...props}
        aria-label="Add button">
        <Add />
      </ActionButton>
      <ActionButton
        isDisabled
        {...props}
        aria-label="Disabled add button">
        <Add />
      </ActionButton>
    </Flex>
  );
}
