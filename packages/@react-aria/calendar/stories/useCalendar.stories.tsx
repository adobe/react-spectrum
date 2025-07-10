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

import {Example} from './Example';
import React from 'react';
import {StoryObj} from '@storybook/react';
import {today} from '@internationalized/date';

export default {
  title: 'Date and Time/useCalendar'
};

export type ExampleStory = StoryObj<typeof Example>;

export const Days3: ExampleStory = {
  render: () => <Example visibleDuration={{days: 3}} />,
  name: 'days: 3'
};

export const Weeks1: ExampleStory = {
  render: () => <Example visibleDuration={{weeks: 1}} />,
  name: 'weeks: 1'
};

export const Weeks2: ExampleStory = {
  render: () => <Example visibleDuration={{weeks: 2}} />,
  name: 'weeks: 2'
};

export const Months1: ExampleStory = {
  render: () => <Example visibleDuration={{months: 1}} />,
  name: 'months: 1'
};

export const Months2: ExampleStory = {
  render: () => <Example visibleDuration={{months: 2}} />,
  name: 'months: 2'
};

export const Days7SingleToday: ExampleStory = {
  render: () => <Example defaultValue={today('UTC')} visibleDuration={{days: 7}} pageBehavior="single" />,
  name: 'days: 7, pageBehavior: single, defaultValue: today'
};

export const Weeks5SingleToday: ExampleStory = {
  render: () => <Example defaultValue={today('UTC')} visibleDuration={{weeks: 5}} pageBehavior="single" />,
  name: 'weeks: 5, pageBehavior: single, defaultValue: today'
};

export const Months2PageBehaviorSingle: ExampleStory = {
  render: () => <Example visibleDuration={{months: 2}} pageBehavior="single" />,
  name: 'months: 2, pageBehavior: single'
};
