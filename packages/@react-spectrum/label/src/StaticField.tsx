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
import {CalendarDate, CalendarDateTime, getLocalTimeZone, startOfMonth, Time, toCalendarDateTime, today, ZonedDateTime} from '@internationalized/date';
import {Label} from './Label';
import React, {ForwardedRef, ReactElement, ReactNode, RefObject, useCallback, useMemo, useRef} from 'react';
import {TimeValue} from '@react-types/datepicker';
import {useDateFormatter, useListFormatter, useNumberFormatter} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/utils';
import { isNonContiguousSelectionModifier } from '@react-aria/selection/src/utils';


interface StaticFieldBaseProps extends DOMProps, StyleProps, Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'>, AriaLabelingProps {}

type NumberValue = number | RangeValue<number>;
interface NumberProps<T extends NumberValue> {
    value: T,
    formatOptions?: Intl.NumberFormatOptions
}

type DateValue = Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time | RangeValue<DateValue>;
interface DateProps<T extends DateValue> {
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
    T extends DateValue ? DateProps<T> :
    T extends string[] ? StringListProps<T> :
    T extends string ? StringProps<T> :
    never;

type SpectrumStaticFieldProps<T> = StaticFieldProps<T> & StaticFieldBaseProps;

  // TODO: logic can be as follows, maybe can simplifiy or rearrange:
  // 1. If value is an array -> it is a string array so format appropriately (aka format with stringlistformatter)
  // 2. else if value is a object with start and end -> it is either a number range or date range so handle appropriately (extract start and end and format with numberformatter or dateformatter,
  //    then concat the string? Double check with how we format range calendar)
  // 3. else if value is a number -> it is a number so format with numberformatter
  // 4. else it is some DateValue (except DateValue Range) -> figure out what kind of DateValue via attribtues specific to each DateValue and format accordingly

// will this need a ref ?? also so many typescript issues 
function StaticField<T>(props: SpectrumStaticFieldProps<T>, ref: RefObject<HTMLElement>) {
  let {
    value, 
    formatOptions, // again another issue here because it doesn't formatOption exists on SpectrumStaticFieldProps

    ...otherProps
  } = props;

  // let numberFormatter = useNumberFormatter(formatOptions);
  // let dateFormatter = useDateFormatter(formatOptions);
  // let stringFormatter = useListFormatter(formatOptions); // this is tripping things up so you might need to comment it out

  // let final;

  // is a string array
  // if (Array.isArray(value)) {
  //   final = stringFormatter.format(value);
  // } else if (typeof value === 'object' && 'start' in (value as any)) {
  //   let start = value.start;
  //   let end = value.end;

  //   // number range
  //   if (typeof start === 'number' && typeof end === 'number') {
  //     final = numberFormatter.formatRange(start, end);
  //   } else if (start instanceof Date && end instanceof Date) { // date range
  //     final = dateFormatter.formatRange(start, end);
  //     console.log('date range: ' + final);
  //   }
  // } else if (typeof value === 'number') {
  //   final = numberFormatter.format(value); 
  // } 
  
  
  // else if (typeof value === 'object' && 'timeZone' in value) { // zoned date time
  //   final = dateFormatter.format(value.toDate());
  //   console.log('zone date time: ' + final);
  //   console.log('zone date time value:' + value);
  // } else if (typeof value === 'object' && 'calendar' in value && 'hour' in value) {  // calendar date time
  //   let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  //   final = dateFormatter.format(value.toDate(timezone));
  // } else if (typeof value === 'object' && 'calendar' in value) { // calendar date
  //   let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  //   final = dateFormatter.format(value.toDate(timezone));
  //   console.log('calendar date: ' + final);
  // } else  if (value instanceof Date) { // date
  //   final = dateFormatter.format(value);
  // } else if (typeof value === 'string') { // string
  //   final = stringFormatter.format(value);
  // } else if (value instanceof Time) { // time
  //   console.log('time value: ' + value);

    // let date = today(getLocalTimeZone());
    // let v = toCalendarDateTime(date, value);
    // let d = v.toDate();

    // 5. caveat to the above is Time. For Time, we will need to get the current date and create a CalendarDateTime so we can use toDate to make it a Date object. See useTimeFieldState for how to do this

  //   let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  //   final = dateFormatter.format(convertValue((v), [value]).toDate(timezone));
  //   console.log('time: ' + final);
  // }

  let {styleProps} = useStyleProps(otherProps);


  return (
    <div
      {...styleProps}
      ref={ref as RefObject<HTMLDivElement>}>
      <Label
        elementType="span">
        <span>
          {Array.isArray(props.value) && <FormattedStringList value={value as string[]} formatOptions={formatOptions as Intl.ListFormatOptions} />}

          {typeof value === 'object' && 'start' in (value as any) && typeof (value as RangeValue<NumberValue>).start === 'number' && <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions}  />}

          {typeof value === 'object' && 'start' in (value as any) && typeof (value as RangeValue<DateValue>).start !== 'number' && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'number' && <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions} />}

          {/* {typeof value === 'object' && 'timeZone' in (value as any) && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />} */}

          {/* {typeof value === 'object' && 'calendar' in (value as any) && 'hour' in (value as any) && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />} */}

          {typeof value === 'object' && 'calendar' in (value as any) && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {value instanceof Date && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}
          
          {value instanceof Time && <FormattedDate value={value as DateValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />}

          {typeof value === 'string' && props.value}
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

function FormattedDate<T extends DateValue>(props: DateProps<T>) {
  let dateFormatter = useDateFormatter(props.formatOptions);

  let value = props.value;
  let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  if (typeof value === 'object' && (value as RangeValue<DateValue>).start instanceof Date && (value as RangeValue<DateValue>).end instanceof Date) {

    let s = (value as RangeValue<DateValue>).start;
    let e = (value as RangeValue<DateValue>).end;
  
    return <>{dateFormatter.formatRange(s.toDate(timezone), e.toDate(timezone))}</>;
  }

  if (typeof value === 'object' && 'timeZone' in value) {
    console.log(value.toDate());
    return <>{dateFormatter.format(value.toDate())}</>;
  }

  if (typeof value === 'object' && 'calendar' in value) {
    return <>{dateFormatter.format(value.toDate(timezone))}</>;
  }

  if (value instanceof Time) {    
    return <>{dateFormatter.format(convertValue(value).toDate(timezone))}</>;
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

// not sure if this forward ref will work just because if you look at StaticField stories both the props come up with warnings 
