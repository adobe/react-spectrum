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
import {Grid, repeat} from '@react-spectrum/layout';
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
  title: 'Grid'
} as Meta<typeof Grid>;

export type GridStory = StoryFn<typeof Grid>;

export const ExplicitGrid: GridStory = () => (
  <Grid
    areas={['header  header', 'sidebar content', 'footer  footer']}
    columns={['size-3000', 'auto']}
    rows={['size-1000', 'auto', 'size-1000']}
    height="size-6000"
    width="80%"
    gap="size-100">
    <View backgroundColor="celery-600" gridArea="header" padding="size-100">
      Header
    </View>
    <View backgroundColor="blue-600" gridArea="sidebar" padding="size-100">
      Sidebar
    </View>
    <View backgroundColor="purple-600" gridArea="content" padding="size-100">
      Content
    </View>
    <View backgroundColor="magenta-600" gridArea="footer" padding="size-100">
      Footer
    </View>
  </Grid>
);

ExplicitGrid.story = {
  name: 'Explicit grid'
};

export const ImplicitGrid: GridStory = () => (
  <Grid
    columns={repeat('auto-fit', 'size-800')}
    autoRows="size-800"
    justifyContent="center"
    width="80%"
    gap="size-100">
    {colors.map((color) => (
      <View key={String(color)} backgroundColor={color} />
    ))}
  </Grid>
);

ImplicitGrid.story = {
  name: 'Implicit grid'
};

export const Responsive: GridStory = () => (
  <Grid
    columns={{
      base: repeat('auto-fit', 'size-800'),
      M: repeat('auto-fit', 'size-1200'),
      L: repeat('auto-fit', 'size-2000')
    }}
    autoRows={{base: 'size-800', M: 'size-1200', L: 'size-2000'}}
    justifyContent="center"
    width="80%"
    gap={{base: 'size-100', M: 'size-250', L: 'size-350'}}>
    {colors.map((color) => (
      <View key={String(color)} backgroundColor={color} />
    ))}
  </Grid>
);

Responsive.story = {
  name: 'responsive'
};
