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
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TimeField} from '../';
import { parseTime, Time } from '../../../@internationalized/date';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf('TimeField', module)
  .addDecorator(BlockDecorator)
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
    () => render({defaultValue: parseTime('20:24')})
  )
  .add(
    'controlled value',
    () => render({value: new Time(2, 35)})
  )
  .add(
    'granularity: second',
    () => render({granularity: 'second'})
  )
  .add(
    'hourCycle: 24',
    () => render({hourCycle: 24})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: new Time(2, 35)})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: new Time(2, 35)})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: new Time(2, 35)})
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
    () => render({validationState: 'invalid', value: new Time(2, 35)})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: new Time(2, 35)})
  );

function render(props = {}) {
  return (
    <TimeField
      onChange={action('change')}
      {...props} />
  );
}
