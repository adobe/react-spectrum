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
import {CalendarDate, CalendarDateTime, getLocalTimeZone, Time, toCalendarDateTime, today, ZonedDateTime} from '@internationalized/date';
import type {DateValue, TimeValue} from '@react-types/datepicker';
import {Label} from './Label';
import React, {RefObject} from 'react';
import {useDateFormatter, useListFormatter, useNumberFormatter} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/utils';

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
    value: T
}

interface StringListProps<T extends string[]> {
    value: T,
    formatOptions?: Intl.ListFormatOptions
}

type StaticFieldProps<T> =
    T extends NumberValue ? NumberProps<T> :
    T extends DateTimeValue ? DateProps<T> :
    T extends string[] ? StringListProps<T> :
    T extends string ? StringProps<T> :
    never;

type SpectrumStaticFieldProps<T> = StaticFieldProps<T> & StaticFieldBaseProps;

function StaticField<T>(props: SpectrumStaticFieldProps<T>, ref: RefObject<HTMLElement>) {
  let {
    value, 
    formatOptions,

    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <div
      {...styleProps}
      ref={ref as RefObject<HTMLDivElement>}>
      <Label
        elementType="span">
        <span>
          {Array.isArray(props.value) && 
            <FormattedStringList value={value as string[]} formatOptions={formatOptions as Intl.ListFormatOptions} />}

          {typeof value === 'object' && 'start' in (value as any) && typeof (value as RangeValue<NumberValue>).start === 'number' && 
            <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions}  />}

          {typeof value === 'object' && 'start' in (value as any) && typeof (value as RangeValue<DateTimeValue>).start !== 'number' && 
            <FormattedDateRange value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'number' && 
            <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions} />}

          {typeof value === 'object' && 'calendar' in (value as any) && 
            <FormattedDate value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {value instanceof Date && 
            <FormattedDate value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}
          
          {value instanceof Time && 
            <FormattedDate value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'string' && 
            props.value}
        </span>
      </Label>
    </div>
  );
}

function FormattedStringList<T extends string[]>(props: StringListProps<T>) {
  let stringFormatter = useListFormatter(props.formatOptions); 

  return (
    stringFormatter.format(props.value)
  );
}

function FormattedNumber<T extends NumberValue>(props: NumberProps<T>) {
  let numberFormatter = useNumberFormatter(props.formatOptions); 

  let value = props.value;

  if (typeof value === 'object' && typeof (value as RangeValue<NumberValue>).start === 'number' && typeof (value as RangeValue<NumberValue>).end === 'number') {
    console.log('RangeValue<NumberValue>');
    return <>{numberFormatter.formatRange(value.start, value.end)}</>;
  }

  return <>{numberFormatter.format(value as number)}</>;
}

function FormattedDateRange<T extends DateTimeValue>(props: DateProps<T>) {
  let dateFormatter = useDateFormatter(props.formatOptions);
  let value = props.value;
  let timeZone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  let start;
  let end;

  if (typeof value === 'object' && 'start' in value) {
    start = value.start;
    end = value.end;

    if (!(start instanceof Date) && !(end instanceof Date)) {
      if (start instanceof Time && end instanceof Time) {
        start = dateFormatter.format(convertValue(start).toDate(timeZone));
        end = dateFormatter.format(convertValue(end).toDate(timeZone));
      } else if (!(start instanceof Time) && !(end instanceof Time)) {
        start = start.toDate(timeZone);
        end = end.toDate(timeZone);
      }
    } 
  }
  
  return <>{dateFormatter.formatRange(start, end)}</>;
}

function FormattedDate<T extends DateTimeValue>(props: DateProps<T>) {
  let dateFormatter = useDateFormatter(props.formatOptions);
  let value = props.value;
  let timeZone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();

  if (typeof value === 'object' && 'timeZone' in value) {
    console.log(value.toDate());
    return <>{dateFormatter.format(value.toDate())}</>;
  }

  if (typeof value === 'object' && 'calendar' in value) {
    return <>{dateFormatter.format(value.toDate(timeZone))}</>;
  }

  if (value instanceof Time) {    
    return <>{dateFormatter.format(convertValue(value).toDate(timeZone))}</>;
  }

  return <>{dateFormatter.format(value as Date)}</>;
}

function convertValue(value: TimeValue, date: DateValue = today(getLocalTimeZone())) {
  if (!value) {
    return null;
  }

  if ('day' in value) {
    return value;
  }

  return toCalendarDateTime(date, value);
}

let _StaticField = React.forwardRef(StaticField);
export {_StaticField as StaticField};
