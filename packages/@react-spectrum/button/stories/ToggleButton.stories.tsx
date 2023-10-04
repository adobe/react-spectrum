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
import Add from '@spectrum-icons/workflow/Add';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex, Text, View} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {ToggleButton} from '../';

export type ToggleButtonStory = ComponentStoryObj<typeof ToggleButton>;

export default {
  title: 'Button/ToggleButton',
  component: ToggleButton,
  args: {
    onPress: action('press'),
    onPressStart: action('pressstart'),
    onPressEnd: action('pressend'),
    variant: 'cta'
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
    isEmphasized: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof ToggleButton>;

export const Default: ToggleButtonStory = {
  render: (args) => render(args)
};

export const StaticWhite: ToggleButtonStory = {
  args: {staticColor: 'white'},
  render: (args) => (
    <View backgroundColor="static-blue-700" padding="size-1000">
      <Flex direction="column" rowGap="size-150">
        {render(args)}
      </Flex>
    </View>
  ),
  name: 'staticColor: white'
};

export const StaticBlack: ToggleButtonStory = {
  args: {staticColor: 'black'},
  render: (args) => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      <Flex direction="column" rowGap="size-150">
        {render(args)}
      </Flex>
    </View>
  ),
  name: 'staticColor: black'
};

export const WHCM: ToggleButtonStory = {
  render: () => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      <Flex direction="column" rowGap="size-150">
        {render()}
        {render({isEmphasized: true})}
        {render({isQuiet: true})}
        {render({isQuiet: true, isEmphasized: true})}
      </Flex>
    </View>
  ),
  name: 'styles to check WHCM support'
};

export const Controlled: ToggleButtonStory = {
  render: () => <ControlledToggleButton />,
  name: 'controlled state'
};

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <ToggleButton onChange={action('change')} onPress={action('press')} {...props}>
        <Add />
        <Text>Default</Text>
      </ToggleButton>
      <ToggleButton onChange={action('change')} onPress={action('press')} defaultSelected {...props}>
        <Add />
        <Text>Selected</Text>
      </ToggleButton>
    </Flex>
  );
}

function ControlledToggleButton() {
  let [selected, setSelected] = useState(false);
  return (
    <div>
      <ToggleButton isSelected={selected} onChange={setSelected}>Press Me</ToggleButton>
      <br />
      {selected ? 'true' : 'false'}
    </div>
  );
}
