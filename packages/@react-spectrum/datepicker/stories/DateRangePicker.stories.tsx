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
import {DateRangePicker} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf('DateRangePicker', module)
  .addDecorator(BlockDecorator)
  .addParameters({chromaticProvider: {locales: true}, chromatic: {viewports: [350]}})
  .add(
    'default',
    () => render()
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'controlled value',
    () => render({value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'custom date format',
    () => render({
      formatOptions: {
          // weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
        // hour12: false,
        // // timeZoneName: 'short',
        // // timeZone: 'America/New_York'
        // // era: 'long'
      }
    })
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid', value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: {start: new Date(2020, 2, 3), end: new Date(2020, 5, 4)}})
  )
  .add(
    'minDate: 2010/1/1, maxDate: 2020/1/1',
    () => render({minValue: new Date(2010, 1, 1), maxValue: new Date(2020, 1, 1)})
  )
  .add(
    'placeholderDate: 1980/1/1',
    () => render({placeholderDate: new Date(1980, 0, 1)})
  );

function render(props = {}) {
  return (
    <div>
      <DateRangePicker 
        onChange={action('change')}
        {...props} />
    </div>
  );
}
