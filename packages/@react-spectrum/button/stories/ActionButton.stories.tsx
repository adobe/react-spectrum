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
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

export default {
  title: 'Button/ActionButton',

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const Default = () => render();

Default.story = {
  name: 'default'
};

export const Icon = () => renderWithIcon();

Icon.story = {
  name: 'icon'
};

export const IconOnly = () => (
  <Flex gap="size-100">
    <ActionButton
      onPress={action('press')}
      onPressStart={action('pressstart')}
      onPressEnd={action('pressend')}>
      <Add />
    </ActionButton>
    <ActionButton
      onPress={action('press')}
      onPressStart={action('pressstart')}
      onPressEnd={action('pressend')}
      isDisabled>
      <Add />
    </ActionButton>
  </Flex>
);

IconOnly.story = {
  name: 'icon only'
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const AutoFocus = () => render({autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const StaticColorWhite = () => (
  <View backgroundColor="static-seafoam-600" padding="size-1000">
    <Flex direction="column" rowGap="size-150">
      {renderWithIcon({staticColor: 'white'})}
      {renderWithIcon({staticColor: 'white', isQuiet: true})}
    </Flex>
  </View>
);

StaticColorWhite.story = {
  name: 'staticColor: white'
};

export const StaticColorBlack = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    <Flex direction="column" rowGap="size-150">
      {renderWithIcon({staticColor: 'black'})}
      {renderWithIcon({staticColor: 'black', isQuiet: true})}
    </Flex>
  </View>
);

StaticColorBlack.story = {
  name: 'staticColor: black'
};

function render(props = {}) {
  return (
    <Flex gap="size-100">
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
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
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        <Add />
        <Text>Default</Text>
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        <Text>Disabled</Text>
        <Add />
      </ActionButton>
    </Flex>
  );
}
