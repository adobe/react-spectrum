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

import type {AriaLabelingProps, DOMProps, RangeValue, SpectrumLabelableProps, StyleProps} from '@react-types/shared';
import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';
import type {DateValue} from '@react-types/datepicker';
import {Meta, Story} from '@storybook/react';
import React from 'react';
import {StaticField} from '../';

interface StaticFieldBaseProps extends DOMProps, StyleProps, Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'>, AriaLabelingProps {}

type NumberValue = number | RangeValue<number>;
interface NumberProps<T extends NumberValue> {
    value: T,
    formatOptions?: Intl.NumberFormatOptions
}

type DateTime = Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time;
type RangeDateTime = RangeValue<DateTime>;
type DateTimeValue = DateTime | RangeDateTime;
interface DateProps<T extends DateTimeValue> {
    value: T,
    formatOptions?: Intl.DateTimeFormatOptions
}

interface StringProps<T extends string> {
    value: T,
    formatOptions?: never
}

interface StringListProps<T extends string[]> {
    value: T,
    // @ts-ignore
    formatOptions?: Intl.ListFormatOptions
}

type StaticFieldProps<T> =
    T extends NumberValue ? NumberProps<T> :
    T extends DateTimeValue ? DateProps<T> :
    T extends string[] ? StringListProps<T> :
    T extends string ? StringProps<T> :
    never;

type SpectrumStaticFieldTypes = string[] | string | Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time | number | RangeValue<number> | RangeValue<DateValue>;
type SpectrumStaticFieldProps<T> = StaticFieldProps<T> & StaticFieldBaseProps;

const meta: Meta<SpectrumStaticFieldProps<SpectrumStaticFieldTypes>> = {
  title: 'StaticField',
  component: StaticField
};

export default meta;

const Template = (): Story<SpectrumStaticFieldProps<SpectrumStaticFieldTypes>> => (args) => (
  <StaticField {...args} />
);

export const Default = Template().bind({});
Default.args = {label: 'Test', value: 'hello'};

export const StringArray = Template().bind({});
StringArray.args = {value: ['wow', 'cool', 'awesome']};

export const withCalendarDate = Template().bind({});
withCalendarDate.args = {value: new CalendarDate(2019, 6, 5), formatOptions: {dateStyle: 'medium'}};

export const withCalendarDateTime = Template().bind({});
withCalendarDateTime.args = {value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}};

export const withZonedDateTime = Template().bind({});
withZonedDateTime.args = {value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), formatOptions: {dateStyle: 'long', timeStyle: 'long'}};

export const withDate = Template().bind({});
withDate.args = {value: new Date(2000, 5, 5), formatOptions: {dateStyle: 'long'}};

export const withTime = Template().bind({});
withTime.args = {value: new Time(9, 45), formatOptions: {timeStyle: 'short'}};

/* still to be completed!! */
