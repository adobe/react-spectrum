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
import {CalendarDateTime, parseTime, parseZonedDateTime, Time, toZoned} from '@internationalized/date';
import React from 'react';
import {TimeField} from '../';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/TimeField',
  decorators: [BlockDecorator],
  excludeStories: ['render']
};

export const Default = () => render();

Default.story = {
  name: 'default'
};

export const DefaultValue = () => render({defaultValue: parseTime('20:24')});

DefaultValue.story = {
  name: 'defaultValue'
};

export const ControlledValue = () => render({value: new Time(2, 35)});

ControlledValue.story = {
  name: 'controlled value'
};

export const GranularitySecond = () => render({granularity: 'second'});

GranularitySecond.story = {
  name: 'granularity: second'
};

export const HourCycle12 = () => render({hourCycle: 12, defaultValue: parseTime('00:00')});

HourCycle12.story = {
  name: 'hourCycle: 12'
};

export const HourCycle24 = () => render({hourCycle: 24, defaultValue: parseTime('00:00')});

HourCycle24.story = {
  name: 'hourCycle: 24'
};

export const HourCycle12GranularityHour = () => render({hourCycle: 12, granularity: 'hour'});

HourCycle12GranularityHour.story = {
  name: 'hourCycle: 12, granularity: hour'
};

export const HourCycle24GranularityHour = () => render({hourCycle: 24, granularity: 'hour'});

HourCycle24GranularityHour.story = {
  name: 'hourCycle: 24, granularity: hour'
};

export const Zoned = () => render({defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]')});

Zoned.story = {
  name: 'zoned'
};

export const HideTimeZone = () => render({defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]'), hideTimeZone: true});

HideTimeZone.story = {
  name: 'hideTimeZone'
};

export const IsDisabled = () => render({isDisabled: true, value: new Time(2, 35)});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsQuietIsDisabled = () => render({isQuiet: true, isDisabled: true, value: new Time(2, 35)});

IsQuietIsDisabled.story = {
  name: 'isQuiet, isDisabled'
};

export const IsReadOnly = () => render({isReadOnly: true, value: new Time(2, 35)});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const AutoFocus = () => render({autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid', value: new Time(2, 35)});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid = () => render({validationState: 'valid', value: new Time(2, 35)});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const PlaceholderValue8Am = () => render({placeholderValue: new Time(8)});

PlaceholderValue8Am.story = {
  name: 'placeholderValue: 8 AM'
};

export const PlaceholderValue1980118AmZoned = () => render({placeholderValue: toZoned(new CalendarDateTime(1980, 1, 1, 8), 'America/Los_Angeles')});

PlaceholderValue1980118AmZoned.story = {
  name: 'placeholderValue: 1980/1/1 8AM, zoned'
};

export const MinValue8Am = () => render({minValue: new Time(8)});

MinValue8Am.story = {
  name: 'minValue: 8 AM'
};

export const MaxValue8Pm = () => render({maxValue: new Time(20)});

MaxValue8Pm.story = {
  name: 'maxValue: 8 PM'
};

export const MinValue8AmMaxValue8Pm = () => render({minValue: new Time(8), maxValue: new Time(20)});

MinValue8AmMaxValue8Pm.story = {
  name: 'minValue: 8 AM, maxValue: 8 PM'
};

export const AllTheEvents = () => render({onBlur: action('onBlur'), onFocus: action('onFocus'), onFocusChange: action('onFocusChange'), onKeyDown: action('onKeyDown'), onKeyUp: action('onKeyUp'), onOpenChange: action('onOpenChange')});

AllTheEvents.story = {
  name: 'all the events'
};

export function render(props = {}) {
  return (
    <TimeField
      label="Time"
      onChange={action('change')}
      maxWidth="calc(100vw - 40px)"
      {...props} />
  );
}
