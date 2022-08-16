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

import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import type {SpectrumStaticFieldProps, SpectrumStaticFieldTypes} from '../src/StaticField';
import {StaticField} from '../';

const meta: Meta<SpectrumStaticFieldProps<SpectrumStaticFieldTypes>> = {
  title: 'StaticField',
  component: StaticField
};

export default meta;

const Template = (): Story<SpectrumStaticFieldProps<SpectrumStaticFieldTypes>> => (args) => (
  <StaticField {...args} />
);

export const StringType = Template().bind({});
StringType.args = {label: 'Test', value: 'This is some sample text'};
StringType.storyName = 'string';

export const StringArray = Template().bind({});
StringArray.args = {value: ['wow', 'cool', 'awesome']};
StringArray.storyName = 'string array';

export const CalendarDateType = Template().bind({});
CalendarDateType.args = {value: new CalendarDate(2019, 6, 5), formatOptions: {dateStyle: 'medium'}};
CalendarDateType.storyName = 'CalendarDate';

export const CalendarDateTimeType = Template().bind({});
CalendarDateTimeType.args = {value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}};
CalendarDateTimeType.storyName = 'CalendarDateTime';

export const ZonedDateTimeType = Template().bind({});
ZonedDateTimeType.args = {value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), formatOptions: {dateStyle: 'long', timeStyle: 'long'}};
ZonedDateTimeType.storyName = 'ZonedDateTime';

export const DateType = Template().bind({});
DateType.args = {value: new Date(2000, 5, 5), formatOptions: {dateStyle: 'long'}};
DateType.storyName = 'Date';

export const TimeType = Template().bind({});
TimeType.args = {value: new Time(9, 45), formatOptions: {timeStyle: 'short'}};
TimeType.storyName = 'Time';

export const DateRangeType = Template().bind({});
DateRangeType.args = {value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}, formatOptions: {dateStyle: 'medium'}};
DateRangeType.storyName = 'RangeValue<DateValue>';

export const NumberType = Template().bind({});
NumberType.args = {value: 10};
NumberType.storyName = 'Number';

export const NumberRangeType = Template().bind({});
NumberRangeType.args = {value: {start: 10, end: 15}};
NumberRangeType.storyName = 'RangeValue<NumberValue>';

export const LabelPositionSide = Template().bind({});
LabelPositionSide.args = {label: 'Test', value: 'This is some sample text', labelPosition: 'side'};
LabelPositionSide.storyName = 'labelPosition: side';

export const LabelAlignLabelPosition = Template().bind({});
LabelAlignLabelPosition.args = {label: 'Test', value: 'This is some sample text', labelPosition: 'side', labelAlign: 'end'};
LabelAlignLabelPosition.storyName = 'labelPosition: side, labelAlign: end';

export const LabelAlignEnd = Template().bind({});
LabelAlignEnd.args = {label: 'Test', value: 'This is some sample text', labelAlign: 'end'};
LabelAlignEnd.storyName = 'labelAlign: end';

export const NoLabel = Template().bind({});
NoLabel.args = {value: 'This is some sample text'};
NoLabel.storyName = 'no visible label';

export const CustomWidth = Template().bind({});
CustomWidth.args = {label: 'Test', value: 'foo'.repeat(20), width: '300px'};
CustomWidth.storyName = 'custom width';
