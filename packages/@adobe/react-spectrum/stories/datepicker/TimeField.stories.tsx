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

import {action} from 'storybook/actions';
import {
  CalendarDateTime,
  parseTime,
  parseZonedDateTime,
  Time,
  toZoned
} from '@internationalized/date';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {TimeField} from '../../src/datepicker/TimeField';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/TimeField',
  decorators: [BlockDecorator],
  excludeStories: ['render']
} as Meta<typeof TimeField>;

export type TimeFieldStory = StoryObj<typeof TimeField>;

export const Default: TimeFieldStory = {
  render: () => render(),
  name: 'default'
};

export const DefaultValue: TimeFieldStory = {
  render: () => render({defaultValue: parseTime('20:24')}),
  name: 'defaultValue'
};

export const ControlledValue: TimeFieldStory = {
  render: () => render({value: new Time(2, 35)}),
  name: 'controlled value'
};

export const GranularitySecond: TimeFieldStory = {
  render: () => render({granularity: 'second'}),
  name: 'granularity: second'
};

export const HourCycle12: TimeFieldStory = {
  render: () => render({hourCycle: 12, defaultValue: parseTime('00:00')}),
  name: 'hourCycle: 12'
};

export const HourCycle24: TimeFieldStory = {
  render: () => render({hourCycle: 24, defaultValue: parseTime('00:00')}),
  name: 'hourCycle: 24'
};

export const HourCycle12GranularityHour: TimeFieldStory = {
  render: () => render({hourCycle: 12, granularity: 'hour'}),
  name: 'hourCycle: 12, granularity: hour'
};

export const HourCycle24GranularityHour: TimeFieldStory = {
  render: () => render({hourCycle: 24, granularity: 'hour'}),
  name: 'hourCycle: 24, granularity: hour'
};

export const Zoned: TimeFieldStory = {
  render: () =>
    render({defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]')}),
  name: 'zoned'
};

export const ZonedPlaceholder: TimeFieldStory = {
  render: () =>
    render({placeholderValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]')}),
  name: 'zoned placeholder'
};

export const HideTimeZone: TimeFieldStory = {
  render: () =>
    render({
      defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]'),
      hideTimeZone: true
    }),
  name: 'hideTimeZone'
};

export const ForceLeadingZeros: TimeFieldStory = {
  render: () => render({defaultValue: parseTime('08:00'), shouldForceLeadingZeros: true}),
  name: 'shouldForceLeadingZeros'
};

export const IsDisabled: TimeFieldStory = {
  render: () => render({isDisabled: true, value: new Time(2, 35)}),
  name: 'isDisabled'
};

export const IsQuietIsDisabled: TimeFieldStory = {
  render: () => render({isQuiet: true, isDisabled: true, value: new Time(2, 35)}),
  name: 'isQuiet, isDisabled'
};

export const IsReadOnly: TimeFieldStory = {
  render: () => render({isReadOnly: true, value: new Time(2, 35)}),
  name: 'isReadOnly'
};

export const AutoFocus: TimeFieldStory = {
  render: () => render({autoFocus: true}),
  name: 'autoFocus'
};

export const ValidationStateInvalid: TimeFieldStory = {
  render: () => render({validationState: 'invalid', value: new Time(2, 35)}),
  name: 'validationState: invalid'
};

export const ValidationStateValid: TimeFieldStory = {
  render: () => render({validationState: 'valid', value: new Time(2, 35)}),
  name: 'validationState: valid'
};

export const PlaceholderValue8Am: TimeFieldStory = {
  render: () => render({placeholderValue: new Time(8)}),
  name: 'placeholderValue: 8 AM'
};

export const PlaceholderValue1980118AmZoned: TimeFieldStory = {
  render: () =>
    render({placeholderValue: toZoned(new CalendarDateTime(1980, 1, 1, 8), 'America/Los_Angeles')}),
  name: 'placeholderValue: 1980/1/1 8AM, zoned'
};

export const MinValue8Am: TimeFieldStory = {
  render: () => render({minValue: new Time(8)}),
  name: 'minValue: 8 AM'
};

export const MaxValue8Pm: TimeFieldStory = {
  render: () => render({maxValue: new Time(20)}),
  name: 'maxValue: 8 PM'
};

export const MinValue8AmMaxValue8Pm: TimeFieldStory = {
  render: () => render({minValue: new Time(8), maxValue: new Time(20)}),
  name: 'minValue: 8 AM, maxValue: 8 PM'
};

export const AllTheEvents: TimeFieldStory = {
  render: () =>
    render({
      onBlur: action('onBlur'),
      onFocus: action('onFocus'),
      onFocusChange: action('onFocusChange'),
      onKeyDown: action('onKeyDown'),
      onKeyUp: action('onKeyUp'),
      onOpenChange: action('onOpenChange')
    }),
  name: 'all the events'
};

export function render(props = {}): JSX.Element {
  return (
    <TimeField label="Time" onChange={action('change')} maxWidth="calc(100vw - 40px)" {...props} />
  );
}
