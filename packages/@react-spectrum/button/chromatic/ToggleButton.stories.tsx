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

import {classNames} from '@react-spectrum/utils';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat, View} from '@adobe/react-spectrum';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {ToggleButton} from '../';

let states = [
  {isQuiet: true},
  {isEmphasized: true},
  {isSelected: true},
  {isDisabled: true},
  {UNSAFE_className: classNames(styles, 'is-active')},
  {UNSAFE_className: classNames(styles, 'is-hovered')},
  {UNSAFE_className: classNames(styles, 'focus-ring')}
];

let combinations = generatePowerset(
  states,
  (merged) => merged.isDisabled && merged.UNSAFE_className
);

export default {
  title: 'Button/ToggleButton',
  parameters: {
    providerSwitcher: {status: 'positive'},
    chromatic: {delay: 300}
  }
};

export const AllPossibleStates = () => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map((c) => (
      <ToggleButton {...c}>Button</ToggleButton>
    ))}
  </Grid>
);

AllPossibleStates.story = {
  name: 'all possible states'
};

export const StaticColorWhite = () => (
  <View backgroundColor="static-blue-700" padding="size-1000">
    <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
      {combinations.map((c) => (
        <ToggleButton {...c} staticColor="white">
          Button
        </ToggleButton>
      ))}
    </Grid>
  </View>
);

StaticColorWhite.story = {
  name: 'staticColor = white'
};

export const StaticColorBlack = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
      {combinations.map((c) => (
        <ToggleButton {...c} staticColor="black">
          Button
        </ToggleButton>
      ))}
    </Grid>
  </View>
);

StaticColorBlack.story = {
  name: 'staticColor = black'
};

export const Arabic = () => (
  <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
    {combinations.map((c) => (
      <ToggleButton {...c}>زر</ToggleButton>
    ))}
  </Grid>
);
