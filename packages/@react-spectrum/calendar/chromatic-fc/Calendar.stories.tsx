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

import {Calendar} from '../';
import {CalendarDate} from '@internationalized/date';
import {Flex} from '@react-spectrum/layout';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
export default {
  title: 'Calendar'
} as Meta<typeof Calendar>;

export type CalendarStory = StoryFn<typeof Calendar>;

const date = new CalendarDate(2022, 2, 3);

export const All: CalendarStory = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>Selected</h2>
    <Calendar value={date} />
    <h2>Min Max</h2>
    <Calendar
      minValue={new CalendarDate(2022, 2, 10)}
      maxValue={new CalendarDate(2022, 2, 20)} />
    <h2>Disabled</h2>
    <Calendar isDisabled value={date} />
    <h2>Unavailable</h2>
    <Calendar
      focusedValue={date}
      isDateUnavailable={date => date.day >= 10 && date.day <= 20} />
    <h2>Error Message</h2>
    <Calendar value={date} isInvalid errorMessage="Selection invalid." />
    <h2>Disabled Invalid</h2>
    <Calendar value={date} minValue={new CalendarDate(2022, 2, 5)} />
  </Flex>
);

All.story = {
  name: 'all'
};
