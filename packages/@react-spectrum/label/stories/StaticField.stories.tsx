
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

import {CalendarDate, CalendarDateTime, getLocalTimeZone, isWeekend, parseZonedDateTime, today, ZonedDateTime} from '@internationalized/date';
import React from 'react';
import {StaticField} from '../src/StaticField';
import {storiesOf} from '@storybook/react';


storiesOf('StaticField', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: Test (controlled)',
    () => render({value: 'Test'})
  )
  .add(
    'test: CalendarDate',
    () => render({value: new CalendarDate(2019, 6, 5)})
  );


function render(props = {}) {
  return (
    <StaticField
      value="test"
      label="test"
      {...props} />
  );
}

