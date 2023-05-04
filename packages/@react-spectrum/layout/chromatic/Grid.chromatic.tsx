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

import {Grid, repeat} from '@react-spectrum/layout';
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
let colors = [];
for (let color of baseColors) {
  for (let i = 4; i <= 7; i++) {
    colors.push(`${color}-${i}00`);
  }
}

export default {
  title: 'Grid',

  parameters: {
    chromaticProvider: {colorSchemes: ['light']}
  }
};

export const ExplicitGrid = () => (
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

export const ImplicitGrid = () => (
  <Grid
    columns={repeat('auto-fit', 'size-800')}
    autoRows="size-800"
    justifyContent="center"
    width="80%"
    gap="size-100">
    {colors.map((color) => (
      <View key={color} backgroundColor={color} />
    ))}
  </Grid>
);

ImplicitGrid.story = {
  name: 'Implicit grid'
};
