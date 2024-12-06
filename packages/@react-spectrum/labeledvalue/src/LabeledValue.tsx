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

import {CalendarDate, CalendarDateTime, getLocalTimeZone, Time, toCalendarDateTime, today, ZonedDateTime} from '@internationalized/date';
import {classNames, useDOMRef} from '@react-spectrum/utils';
import type {DOMProps, DOMRef, RangeValue, SpectrumLabelableProps, StyleProps} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {filterDOMProps} from '@react-aria/utils';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import React, {ReactNode} from 'react';
import {useDateFormatter, useListFormatter, useNumberFormatter} from '@react-aria/i18n';

// NOTE: the types here need to be synchronized with the ones in docs/types.ts, which are simpler so the documentation generator can handle them.

export interface LabeledValueBaseProps extends DOMProps, StyleProps, Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'>, DOMProps {
  /** The content to display as the label. */
  label: ReactNode
}

type NumberValue = number | RangeValue<number>;
interface NumberProps<T extends NumberValue> {
  /** The value to display. */
  value: T,
  /** Formatting options for the value. */
  formatOptions?: Intl.NumberFormatOptions
}

export type DateTime = Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time;
type RangeDateTime = RangeValue<DateTime>;
type DateTimeValue = DateTime | RangeDateTime;
interface DateProps<T extends DateTimeValue> {
  /** The value to display. */
  value: T,
  /** Formatting options for the value. */
  formatOptions?: Intl.DateTimeFormatOptions
}

interface StringProps<T extends string> {
  /** The value to display. */
  value: T,
  /** Formatting options for the value. */
  formatOptions?: never
}

interface StringListProps<T extends string[]> {
  /** The value to display. */
  value: T,
  /** Formatting options for the value. */
  formatOptions?: Intl.ListFormatOptions
}

type LabeledValueProps<T> =
  T extends NumberValue ? NumberProps<T> :
  T extends DateTimeValue ? DateProps<T> :
  T extends string[] ? StringListProps<T> :
  T extends string ? StringProps<T> :
  never;

type SpectrumLabeledValueTypes = string[] | string | Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time | number | RangeValue<number> | RangeValue<DateTime>;
export type SpectrumLabeledValueProps<T> = LabeledValueProps<T> & LabeledValueBaseProps;

/**
 * A LabeledValue displays a non-editable value with a label. It formats numbers, dates, times, and lists according to the user's locale.
 */
export const LabeledValue = React.forwardRef(function LabeledValue<T extends SpectrumLabeledValueTypes>(props: SpectrumLabeledValueProps<T>, ref: DOMRef<HTMLElement>) {
  let {
    value,
    formatOptions
  } = props;
  let domRef = useDOMRef(ref);

  let children;
  if (Array.isArray(value)) {
    children = <FormattedStringList value={value} formatOptions={formatOptions as Intl.ListFormatOptions} />;
  }

  if (typeof value === 'object' && 'start' in value && typeof value.start === 'number' && typeof value.end === 'number') {
    children = <FormattedNumber value={value as NumberValue} formatOptions={formatOptions as Intl.NumberFormatOptions}  />;
  }

  if (typeof value === 'object' && 'start' in value && typeof value.start !== 'number' && typeof value.end !== 'number') {
    children = <FormattedDate value={value as DateTimeValue} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />;
  }

  if (typeof value === 'number') {
    children = <FormattedNumber value={value} formatOptions={formatOptions as Intl.NumberFormatOptions} />;
  }

  if (typeof value === 'object' && ('calendar' in value || 'hour' in value) || (value instanceof Date)) {
    children = <FormattedDate value={value} formatOptions={formatOptions as Intl.DateTimeFormatOptions} />;
  }

  if (typeof value === 'string') {
    children = value;
  }

  return (
    <Field {...props as any} wrapperProps={filterDOMProps(props as any)} ref={domRef} elementType="span" wrapperClassName={classNames(labelStyles, 'spectrum-LabeledValue')}>
      <span>{children}</span>
    </Field>
  );
});

function FormattedStringList<T extends string[]>(props: StringListProps<T>) {
  let stringFormatter = useListFormatter(props.formatOptions);

  return (
    <>{stringFormatter.format(props.value)}</>
  );
}

function FormattedNumber<T extends NumberValue>(props: NumberProps<T>) {
  let numberFormatter = useNumberFormatter(props.formatOptions);
  let value = props.value;

  if (typeof value === 'object') {
    return <>{numberFormatter.formatRange(value.start, value.end)}</>;
  }

  return <>{numberFormatter.format(value)}</>;
}

function FormattedDate<T extends DateTimeValue>(props: DateProps<T>) {
  let {value, formatOptions} = props;
  if (!formatOptions) {
    formatOptions = getDefaultFormatOptions('start' in value ? value.start : value);
  }

  let dateFormatter = useDateFormatter(formatOptions);
  let timeZone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();
  let final: Date;

  if ('start' in value && 'end' in value) {
    let start = value.start;
    let end = value.end;

    start = convertDateTime(start, timeZone);
    end = convertDateTime(end, timeZone);

    return <>{dateFormatter.formatRange(start, end)}</>;
  }

  final = convertDateTime(value, timeZone);
  return <>{dateFormatter.format(final)}</>;
}

function convertDateTime(value: DateTime, timeZone: any) {
  if ('timeZone' in value) {
    return value.toDate();
  } else if ('calendar' in value) {
    return value.toDate(timeZone);
  } else if (!(value instanceof Date)) {
    return convertValue(value).toDate(timeZone);
  }

  return value;
}

function getDefaultFormatOptions(value: DateTime): Intl.DateTimeFormatOptions {
  if (value instanceof Date) {
    return {dateStyle: 'long', timeStyle: 'short'};
  } else if ('timeZone' in value) {
    return {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: value.timeZone, timeZoneName: 'short'};
  } else if ('hour' in value && 'year' in value) {
    return {dateStyle: 'long', timeStyle: 'short'};
  } else if ('hour' in value) {
    return {timeStyle: 'short'};
  } else {
    return {dateStyle: 'long'};
  }
}

function convertValue(value: Time) {
  let date = today(getLocalTimeZone());

  return toCalendarDateTime(date, value);
}
