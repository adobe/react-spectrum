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

  if (typeof value === 'number') {
    value = numberFormatter.format(value); // doesn't think value is type number
  }

  
  // did (value as ZonedDateTime) because value gave a warning which said ' The right-hand side of an 'in' expression must not be a primitive.'
  if ('timeZone' in (value as ZonedDateTime)) {
    // let TIMEZONE = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone(); // do we actually need timezone if toDate does not take any parameters
    value = value.toDate();
  }

  if ('start' in (value as RangeValue<DateValue>)) {
    value = numberFormatter.formatRange(value.start, value.end);
  }

  if (value instanceof Date) {
    value = dateFormatter.format(value);
  }

  // thinking it might be possible to distinguish CalendarDate and CalendarDateTime if we first check they both have calendar and then for CalendarDateTime check if it has the property 'hour', if it does whoo it's CalendarDateTime, if not, we know it has to be CalendarDate -> this way we wouldn't need to add any unqiue properties but also not sure if this will even work considering the other examples

  if (typeof value === 'string') {
    value = stringFormatter.format(value);
  }

  return (
    <Label
      {...props}
      elementType="span">
      <span>
        {value}
      </span>
    </Label>
  );
}

let _StaticField = React.forwardRef(StaticField);
export {_StaticField as StaticField};

// not sure if this forward ref will work just because if you look at StaticField stories both the props come up with warnings 
