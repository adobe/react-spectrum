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

import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {View} from '@react-spectrum/view';

let baseColors = ['celery', 'chartreuse', 'yellow', 'magenta', 'fuchsia', 'purple', 'indigo', 'seafoam', 'red', 'orange', 'green', 'blue'];
let colors = [];
for (let color of baseColors) {
  for (let i = 4; i <= 7; i++) {
    colors.push(`${color}-${i}00`);
  }
}

storiesOf('Flex', module)
  // we do not care about colors for this one, knowing it lays out correctly is all
  .addParameters({chromaticProvider: {colorSchemes: ['light']}})
  .add(
    'Vertical stack with gap',
    () => (
      <Flex direction="column" width="size-2000" gap="size-100">
        <View backgroundColor="celery-600" height="size-800" />
        <View backgroundColor="blue-600" height="size-800" />
        <View backgroundColor="magenta-600" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Horizontal stack with gap',
    () => (
      <Flex direction="row" height="size-800" gap="size-100">
        <View backgroundColor="celery-600" width="size-800" />
        <View backgroundColor="blue-600" width="size-800" />
        <View backgroundColor="magenta-600" width="size-800" />
      </Flex>
    )
  )
  .add(
    'Wrapping with gap',
    () => (
      <View maxWidth="80%" borderWidth="thin" borderColor="dark">
        <Flex direction="row" gap="size-100" wrap>
          {colors.map(color =>
            <View key={color} backgroundColor={color} width="size-800" height="size-800" />
          )}
        </Flex>
      </View>
    )
  )
  .add(
    'Nested flex with gap',
    () => (
      <Flex direction="column" gap="size-150">
        <View backgroundColor="celery-600" height="size-800" />
        <Flex direction="row" height="size-800" gap="size-100">
          <View backgroundColor="indigo-600" width="size-800" />
          <View backgroundColor="seafoam-600" width="size-800" />
          <View backgroundColor="blue-600" width="size-800" />
        </Flex>
        <View backgroundColor="magenta-600" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Align center',
    () => (
      <Flex direction="row" gap="size-100" alignItems="center">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-2000" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Align end',
    () => (
      <Flex direction="row" gap="size-100" alignItems="end">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-2000" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify start',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="start" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify center',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="center" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify end',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="end" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify space-around',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="space-around" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify space-between',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="space-between" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  )
  .add(
    'Justify space-evenly',
    () => (
      <Flex direction="row" gap="size-100" justifyContent="space-evenly" width="80%">
        <View backgroundColor="celery-600"  width="size-800" height="size-800" />
        <View backgroundColor="blue-600"  width="size-800" height="size-800" />
        <View backgroundColor="magenta-600" width="size-800" height="size-800" />
      </Flex>
    )
  );
