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
import {addWeeks} from 'date-fns';
import {RangeCalendar} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('RangeCalendar', module)
  .addParameters({chromaticProvider: {locales: true}, chromatic: {viewports: [350]}})
  .add(
    'Default',
    () => render(),
    {chromatic: {disable: true}} // disable visual tests since this depends on the current month
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}})
  )
  .add(
    'controlled value',
    () => render({value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}})
  )
  .add(
    'minValue: today, maxValue: 1 week from now',
    () => render({minValue: new Date(), maxValue: addWeeks(new Date(), 1)}),
    {chromatic: {disable: true}} // disable visual tests since this depends on the current month
  )
  .add(
    'defaultValue + minValue + maxValue',
    () => render({defaultValue: {start: new Date(2019, 5, 10), end: new Date(2019, 5, 12)}, minValue: new Date(2019, 5, 5), maxValue: new Date(2019, 5, 20)})
  )
  .add(
    'isDisabled',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, isReadOnly: true})
  )
  .add(
    'autoFocus',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, autoFocus: true})
  );

function render(props = {}) {
  return <RangeCalendar onChange={action('change')} {...props} />;
}
