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
import {Flex, Text, View} from '@adobe/react-spectrum';
import React from 'react';
import {ToggleButton} from '../';

export default {
  title: 'Button/ToggleButton',

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const Default = () => render();

Default.story = {
  name: 'default'
};

export const Emphasized = () => render({isEmphasized: true});

Emphasized.story = {
  name: 'emphasized'
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const IsQuietEmphasized = () =>
  render({isEmphasized: true, isQuiet: true});

IsQuietEmphasized.story = {
  name: 'isQuiet & emphasized'
};

export const StaticColorWhite = () => (
  <View backgroundColor="static-seafoam-600" padding="size-1000">
    <Flex direction="column" rowGap="size-150">
      {render({staticColor: 'white'})}
      {render({staticColor: 'white', isQuiet: true})}
    </Flex>
  </View>
);

StaticColorWhite.story = {
  name: 'staticColor: white'
};

export const StaticColorBlack = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    <Flex direction="column" rowGap="size-150">
      {render({staticColor: 'black'})}
      {render({staticColor: 'black', isQuiet: true})}
    </Flex>
  </View>
);

StaticColorBlack.story = {
  name: 'staticColor: black'
};

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <ToggleButton
        onChange={action('change')}
        onPress={action('press')}
        {...props}>
        <Add />
        <Text>Default</Text>
      </ToggleButton>
      <ToggleButton
        onChange={action('change')}
        onPress={action('press')}
        defaultSelected
        {...props}>
        <Add />
        <Text>Selected</Text>
      </ToggleButton>
      <ToggleButton defaultSelected isDisabled {...props}>
        <Add />
        <Text>Disabled + selected</Text>
      </ToggleButton>
    </Flex>
  );
}
