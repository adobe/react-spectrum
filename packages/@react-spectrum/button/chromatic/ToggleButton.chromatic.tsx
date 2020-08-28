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
import {Grid, repeat} from '@adobe/react-spectrum';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {storiesOf} from '@storybook/react';
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

// Generate a powerset of the options
let combinations: any[] = [{}];
for (let i = 0; i < states.length; i++) {
  let len = combinations.length;
  for (let j = 0; j < len; j++) {
    let merged = mergeProps(combinations[j], states[i]);

    // Ignore disabled combined with interactive states.
    if (merged.isDisabled && merged.UNSAFE_className) {
      continue;
    }

    combinations.push(merged);
  }
}

storiesOf('Button/ToggleButton', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add('all possible states', () => (
    <Grid columns={repeat(states.length, '1fr')} autoFlow="row" gap="size-300">
      {combinations.map(c => <ToggleButton {...c}>Button</ToggleButton>)}
    </Grid>
  ));
