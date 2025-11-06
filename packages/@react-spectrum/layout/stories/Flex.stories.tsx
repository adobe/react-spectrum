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

import {BackgroundColorValue, Responsive as TResponsive} from '@react-types/shared';
import {Flex} from '@react-spectrum/layout';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {View} from '@react-spectrum/view';

let baseColors = [
  'celery',
  'chartreuse',
  'yellow',
  'magenta',
  'fuchsia',
  'purple',
  'indigo',
  'seafoam',
  'red',
  'orange',
  'green',
  'blue'
];
let colors: Array<TResponsive<BackgroundColorValue> | undefined> = [];
for (let color of baseColors) {
  for (let i = 4; i <= 7; i++) {
    colors.push(`${color}-${i}00` as TResponsive<BackgroundColorValue>);
  }
}

export default {
  title: 'Flex'
} as Meta<typeof Flex>;

export type FlexStory = StoryFn<typeof Flex>;

export const VerticalStackWithGap: FlexStory = () => (
  <Flex direction="column" width="size-2000" gap="size-100">
    <View backgroundColor="celery-600" height="size-800" />
    <View backgroundColor="blue-600" height="size-800" />
    <View backgroundColor="magenta-600" height="size-800" />
  </Flex>
);

VerticalStackWithGap.story = {
  name: 'Vertical stack with gap'
};

export const HorizontalStackWithGap: FlexStory = () => (
  <Flex direction="row" height="size-800" gap="size-100">
    <View backgroundColor="celery-600" width="size-800" />
    <View backgroundColor="blue-600" width="size-800" />
    <View backgroundColor="magenta-600" width="size-800" />
  </Flex>
);

HorizontalStackWithGap.story = {
  name: 'Horizontal stack with gap'
};

export const WrappingWithGap: FlexStory = () => (
  <View maxWidth="80%" borderWidth="thin" borderColor="dark">
    <Flex direction="row" gap="size-100" wrap>
      {colors.map((color) => (
        <View key={String(color)} backgroundColor={color} width="size-800" height="size-800" />
      ))}
    </Flex>
  </View>
);

WrappingWithGap.story = {
  name: 'Wrapping with gap'
};

export const NestedFlexWithGap: FlexStory = () => (
  <Flex direction="column" gap="size-150">
    <View backgroundColor="celery-600" height="size-800" />
    <Flex direction="row" height="size-800" gap="size-100">
      <View backgroundColor="indigo-600" width="size-800" />
      <View backgroundColor="seafoam-600" width="size-800" />
      <View backgroundColor="blue-600" width="size-800" />
    </Flex>
    <View backgroundColor="magenta-600" height="size-800" />
  </Flex>
);

NestedFlexWithGap.story = {
  name: 'Nested flex with gap'
};

export const AlignCenter: FlexStory = () => (
  <Flex direction="row" gap="size-100" alignItems="center">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-2000" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

AlignCenter.story = {
  name: 'Align center'
};

export const AlignEnd: FlexStory = () => (
  <Flex direction="row" gap="size-100" alignItems="end">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-2000" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

AlignEnd.story = {
  name: 'Align end'
};

export const JustifyStart: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="start" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifyStart.story = {
  name: 'Justify start'
};

export const JustifyCenter: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="center" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifyCenter.story = {
  name: 'Justify center'
};

export const JustifyEnd: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="end" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifyEnd.story = {
  name: 'Justify end'
};

export const JustifySpaceAround: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="space-around" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifySpaceAround.story = {
  name: 'Justify space-around'
};

export const JustifySpaceBetween: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="space-between" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifySpaceBetween.story = {
  name: 'Justify space-between'
};

export const JustifySpaceEvenly: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="space-evenly" width="80%">
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

JustifySpaceEvenly.story = {
  name: 'Justify space-evenly'
};

export const Ordered: FlexStory = () => (
  <Flex direction="row" gap="size-100" justifyContent="space-evenly" width="80%">
    <View backgroundColor="celery-600" order={2} width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" order={1} width="size-800" height="size-800" />
  </Flex>
);

Ordered.story = {
  name: 'ordered'
};

export const Responsive: FlexStory = () => (
  <Flex
    direction={{base: 'column', L: 'row'}}
    gap={{base: 'size-100', M: 'size-250', L: 'size-350'}}>
    <View backgroundColor="celery-600" width="size-800" height="size-800" />
    <View backgroundColor="blue-600" width="size-800" height="size-800" />
    <View backgroundColor="magenta-600" width="size-800" height="size-800" />
  </Flex>
);

Responsive.story = {
  name: 'responsive'
};
