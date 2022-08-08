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
import {CalendarDate, CalendarDateTime, getLocalTimeZone, Time, ZonedDateTime} from '@internationalized/date';
import {Label} from './Label';
import React, {ForwardedRef, ReactElement, RefObject, useCallback, useRef} from 'react';
import {useDateFormatter, useListFormatter, useNumberFormatter} from '@react-aria/i18n';
import {useStyleProps} from '@react-spectrum/utils';


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
  // 5. caveat to the above is Time. For Time, we will need to get the current date and create a CalendarDateTime so we can use toDate to make it a Date object. See useTimeFieldState for how to do this

// will this need a ref ?? also so many typescript issues 
function StaticField<T>(props: SpectrumStaticFieldProps<T>, ref: RefObject<HTMLElement>) {
  let {
    value, 
    formatOptions, // again another issue here because it doesn't formatOption exists on SpectrumStaticFieldProps

    ...otherProps
  } = props;

  let numberFormatter = useNumberFormatter(formatOptions);
  let dateFormatter = useDateFormatter(formatOptions);
  let stringFormatter = useListFormatter(formatOptions);

  let final;

  // is a string array
  if (Array.isArray(value)) {
    final = stringFormatter.format(value);
  } else if (typeof value === 'object' && 'start' in value) {
    let start = value.start;
    let end = value.end;

    // number range
    if (typeof start === 'number' && typeof end === 'number') {
      final = numberFormatter.formatRange(start, end);
    } else if (start instanceof Date && end instanceof Date) { // date range
      final = dateFormatter.formatRange(start, end);
    }
  } else if (typeof value === 'number') {
    final = numberFormatter.format(value); 
  } else if (typeof value === 'object' && 'timeZone' in value) { // zoned date time
    final = dateFormatter.format(value.toDate());
  } else if (typeof value === 'object' && 'calendar' in value && 'hour' in value) {  // calendar date time
    let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
    final = dateFormatter.format(value.toDate(timezone));
  } else if (typeof value === 'object' && 'calendar' in value) { // calendar date
    let timezone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
    final = dateFormatter.format(value.toDate(timezone));
  }

  // format date
  if (value instanceof Date) {
    final = dateFormatter.format(value);
  }

  // format string
  if (typeof value === 'string') {
    final = stringFormatter.format(value);
  }

  let {styleProps} = useStyleProps(otherProps);

  return (
    <div
      {...styleProps}
      ref={ref as RefObject<HTMLDivElement>}>
      <Label
        elementType="span">
        <span>
          {final}
        </span>
      </Label>
    </div>
  );
}

let _StaticField = React.forwardRef(StaticField);
export {_StaticField as StaticField};

// not sure if this forward ref will work just because if you look at StaticField stories both the props come up with warnings 
