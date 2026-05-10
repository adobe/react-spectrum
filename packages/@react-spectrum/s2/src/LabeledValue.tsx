/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  CalendarDate,
  CalendarDateTime,
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  today,
  ZonedDateTime
} from '@internationalized/date';
import {ContextValue} from 'react-aria-components/slots';
import {
  controlFont,
  controlSize,
  field,
  fieldInput,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, isValidElement, ReactElement, ReactNode} from 'react';
import {
  DOMProps,
  DOMRef,
  DOMRefValue,
  RangeValue,
  SpectrumLabelableProps
} from '@react-types/shared';
import {FieldLabel} from './Field';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FormContext, useFormProps} from './Form';
import {style} from '../style' with {type: 'macro'};
import {useContext, useEffect} from 'react';
import {useDateFormatter} from 'react-aria/useDateFormatter';
import {useDOMRef} from './useDOMRef';
import {useListFormatter} from 'react-aria/useListFormatter';
import {useNumberFormatter} from 'react-aria/useNumberFormatter';
import {useSpectrumContextProps} from './useSpectrumContextProps';

type NumberValue = number | RangeValue<number>;
interface NumberProps<T extends NumberValue> {
  /** The value to display. */
  value: T;
  /** Formatting options for the value. */
  formatOptions?: Intl.NumberFormatOptions;
}

export type DateTime = Date | CalendarDate | CalendarDateTime | ZonedDateTime | Time;
type RangeDateTime = RangeValue<DateTime>;
type DateTimeValue = DateTime | RangeDateTime;
interface DateProps<T extends DateTimeValue> {
  /** The value to display. */
  value: T;
  /** Formatting options for the value. */
  formatOptions?: Intl.DateTimeFormatOptions;
}

interface StringProps<T extends string> {
  /** The value to display. */
  value: T;
  /** Formatting options for the value. */
  formatOptions?: never;
}

interface StringListProps<T extends string[]> {
  /** The value to display. */
  value: T;
  /** Formatting options for the value. */
  formatOptions?: Intl.ListFormatOptions;
}

interface ReactElementProps<T extends ReactElement> {
  /** The value to display. */
  value: T;
  /** Formatting options for the value. */
  formatOptions?: never;
}

export interface LabeledValueStyleProps {
  /**
   * The size of the component.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
}
export interface LabeledValueBaseProps
  extends DOMProps, StyleProps, Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'> {
  /** The content to display as the label. */
  label: ReactNode;
}
type LabeledValueTypeProps<T> = T extends NumberValue
  ? NumberProps<T>
  : T extends DateTimeValue
    ? DateProps<T>
    : T extends string[]
      ? StringListProps<T>
      : T extends string
        ? StringProps<T>
        : T extends ReactElement
          ? ReactElementProps<T>
          : never;

type LabeledValueTypes =
  | string[]
  | string
  | Date
  | CalendarDate
  | CalendarDateTime
  | ZonedDateTime
  | Time
  | number
  | RangeValue<number>
  | RangeValue<DateTime>
  | ReactElement;
export type LabeledValueProps<T> = LabeledValueTypeProps<T> &
  LabeledValueBaseProps &
  LabeledValueStyleProps;

export const LabeledValueContext =
  createContext<ContextValue<Partial<LabeledValueProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

const fieldStyles = style(
  {
    ...field()
  },
  getAllowedOverrides()
);

const valueStyles = style({
  ...fieldInput(),
  minHeight: {
    isInForm: controlSize()
  },
  display: 'flex',
  alignItems: 'center',
  font: controlFont()
});

/**
 * A LabeledValue displays a non-editable value with a label. It formats numbers,
 * dates, times, and lists according to the user's locale.
 */
export const LabeledValue = /*#__PURE__*/ forwardRef(function LabeledValue<
  T extends LabeledValueTypes
>(props: LabeledValueProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props as any, ref, LabeledValueContext) as any;
  props = useFormProps(props);
  let {
    label,
    value,
    formatOptions,
    size = 'M',
    labelPosition = 'top',
    labelAlign = 'start',
    contextualHelp,
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    ...otherProps
  } = props;
  let formContext = useContext(FormContext);

  let domRef = useDOMRef(ref);
  useEffect(() => {
    if (
      domRef?.current &&
      domRef.current.querySelectorAll('input, [contenteditable], textarea').length > 0
    ) {
      throw new Error('LabeledValue cannot contain an editable value.');
    }
  }, [domRef]);

  let children: ReactNode;

  if (Array.isArray(value)) {
    children = (
      <FormattedStringList
        value={value as string[]}
        formatOptions={formatOptions as Intl.ListFormatOptions}
      />
    );
  } else if (typeof value === 'number') {
    children = (
      <FormattedNumber value={value} formatOptions={formatOptions as Intl.NumberFormatOptions} />
    );
  } else if (
    typeof value === 'object' &&
    value !== null &&
    'start' in value &&
    typeof (value as RangeValue<number>).start === 'number'
  ) {
    children = (
      <FormattedNumber
        value={value as RangeValue<number>}
        formatOptions={formatOptions as Intl.NumberFormatOptions}
      />
    );
  } else if (typeof value === 'object' && value !== null && 'start' in value) {
    children = (
      <FormattedDate
        value={value as RangeDateTime}
        formatOptions={formatOptions as Intl.DateTimeFormatOptions}
      />
    );
  } else if (
    value instanceof Date ||
    (typeof value === 'object' && value !== null && ('calendar' in value || 'hour' in value))
  ) {
    children = (
      <FormattedDate
        value={value as DateTime}
        formatOptions={formatOptions as Intl.DateTimeFormatOptions}
      />
    );
  } else if (typeof value === 'string') {
    children = value;
  } else if (isValidElement(value)) {
    children = value;
  }

  return (
    <div
      {...filterDOMProps(otherProps)}
      ref={domRef}
      style={UNSAFE_style}
      className={
        UNSAFE_className +
        fieldStyles(
          {
            isInForm: !!formContext,
            labelPosition,
            size
          },
          styles
        )
      }>
      <FieldLabel
        elementType="span"
        size={size}
        labelPosition={labelPosition}
        labelAlign={labelAlign}
        contextualHelp={contextualHelp}>
        {label}
      </FieldLabel>
      <span className={valueStyles({isInForm: !!formContext, size, labelPosition})}>
        {children}
      </span>
    </div>
  );
});

function FormattedStringList({
  value,
  formatOptions
}: {
  value: string[];
  formatOptions?: Intl.ListFormatOptions;
}) {
  let formatter = useListFormatter(formatOptions ?? {});
  return <>{formatter.format(value)}</>;
}

function FormattedNumber({
  value,
  formatOptions
}: {
  value: NumberValue;
  formatOptions?: Intl.NumberFormatOptions;
}) {
  let formatter = useNumberFormatter(formatOptions);
  if (typeof value === 'object') {
    return <>{formatter.formatRange(value.start, value.end)}</>;
  }
  return <>{formatter.format(value)}</>;
}

function FormattedDate<T extends DateTimeValue>({
  value,
  formatOptions
}: {
  value: T;
  formatOptions?: Intl.DateTimeFormatOptions;
}) {
  if (!formatOptions) {
    formatOptions = getDefaultFormatOptions(
      'start' in value ? (value as RangeDateTime).start : (value as DateTime)
    );
  }

  let dateFormatter = useDateFormatter(formatOptions);
  let timeZone = dateFormatter.resolvedOptions().timeZone || getLocalTimeZone();

  if ('start' in value && 'end' in value) {
    let start = convertDateTime((value as RangeDateTime).start, timeZone);
    let end = convertDateTime((value as RangeDateTime).end, timeZone);
    return <>{dateFormatter.formatRange(start, end)}</>;
  }

  return <>{dateFormatter.format(convertDateTime(value as DateTime, timeZone))}</>;
}

function convertDateTime(value: DateTime, timeZone: string): Date {
  if ('timeZone' in value) {
    return (value as ZonedDateTime).toDate();
  } else if ('calendar' in value) {
    return (value as CalendarDate | CalendarDateTime).toDate(timeZone);
  } else if (!(value instanceof Date)) {
    return toCalendarDateTime(today(getLocalTimeZone()), value as Time).toDate(timeZone);
  }
  return value;
}

function getDefaultFormatOptions(value: DateTime): Intl.DateTimeFormatOptions {
  if (value instanceof Date) {
    return {dateStyle: 'long', timeStyle: 'short'};
  } else if ('timeZone' in value) {
    return {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: (value as ZonedDateTime).timeZone,
      timeZoneName: 'short'
    };
  } else if ('hour' in value && 'year' in value) {
    return {dateStyle: 'long', timeStyle: 'short'};
  } else if ('hour' in value) {
    return {timeStyle: 'short'};
  } else {
    return {dateStyle: 'long'};
  }
}
