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
import {classNames} from '@react-spectrum/utils';
import type {DateValue, TimeValue} from '@react-types/datepicker';
import {filterDOMProps} from '@react-aria/utils';
import {Label} from './Label';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
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

function StaticField<T extends SpectrumStaticFieldTypes>(props: SpectrumStaticFieldProps<T>, ref: RefObject<HTMLDivElement>) {
  let {
    value,
    formatOptions,
    labelPosition,
    labelAlign,

    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let labelWrapperClass = classNames(
    labelStyles,
    'spectrum-Field',
    {
      'spectrum-Field--positionTop': labelPosition === 'top',
      'spectrum-Field--positionSide': labelPosition === 'side'
    }
  );

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      className={classNames(labelStyles, 'spectrum-StaticField', {[labelWrapperClass]: props.label}, styleProps.className)}
      ref={ref}>
      {props.label &&
        <Label
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          elementType="span">
          {props.label}
        </Label>}
      <div
        className={classNames(labelStyles, 'spectrum-Field-wrapper')}>
        <div
          className={classNames(labelStyles, 'spectrum-Field-field')}>
          {Array.isArray(value) && 
            // @ts-ignore
            <FormattedStringList value={value} formatOptions={formatOptions as Intl.ListFormatOptions} />}

          {typeof value === 'object' && 'start' in value && typeof value.start === 'number' && typeof value.end === 'number' && 
            <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions}  />}

          {typeof value === 'object' && 'start' in value && typeof value.start !== 'number' && typeof value.end !== 'number' && 
            <FormattedDateRange value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'number' && 
            <FormattedNumber value={value} formatOptions={formatOptions as Intl.NumberFormatOptions} />}

          {(typeof value === 'object' && ('calendar' in value || 'hour' in value) || (value instanceof Date))  &&
            <FormattedDate value={value} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'string' && 
            props.value}
        </div>
      </div>
    </div>
  );
}

function FormattedStringList<T extends string[]>(props: StringListProps<T>) {
  let stringFormatter = useListFormatter(props.formatOptions); 

  return (
    <>{stringFormatter.format(props.value)}</>
  );
}

function FormattedNumber<T extends NumberValue>(props: NumberProps<T>) {
  let numberFormatter = useNumberFormatter(props.formatOptions); 
  let value = props.value;

  if (typeof value === 'object' && typeof (value as RangeValue<NumberValue>).start === 'number' && typeof (value as RangeValue<NumberValue>).end === 'number') {
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
        start = convertValue(start).toDate(timeZone);
        end = convertValue(end).toDate(timeZone);
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

function convertValue(value: TimeValue) {
  let date = today(getLocalTimeZone());
  
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
