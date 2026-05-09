import React, {useCallback, useState} from 'react';
import type {DateValue} from 'react-stately/useCalendarState';
import type {RangeValue} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';
import {Tray} from '../tray/Tray';
import {Calendar} from './Calendar';
import {RangeCalendar} from './RangeCalendar';
import type {NativeCalendarProps} from './Calendar';
import type {NativeRangeCalendarProps} from './RangeCalendar';

export interface DatePickerProps
  extends Omit<NativeCalendarProps, 'onChange'> {
  buttonClassName?: string;
  className?: string;
  label?: string;
  onChange?: (date: DateValue) => void;
  placeholder?: string;
  testID?: string;
}

export function DatePicker({
  buttonClassName,
  className,
  label,
  onChange,
  placeholder = 'Select date',
  testID,
  value,
  ...calProps
}: DatePickerProps) {
  let [isOpen, setOpen] = useState(false);
  let [internalValue, setInternalValue] = useState<DateValue | undefined>(
    value as DateValue | undefined
  );

  let displayValue = internalValue
    ? (internalValue as any).toString?.() ?? String(internalValue)
    : null;

  let handleChange = useCallback(
    (date: DateValue) => {
      setInternalValue(date);
      onChange?.(date);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <View className={className} testID={testID}>
      {label != null && (
        <Text className="mb-100 text-200 font-medium text-text">{label}</Text>
      )}
      <Pressable
        accessibilityLabel={label ?? placeholder}
        accessibilityRole="button"
        accessibilityState={{expanded: isOpen || undefined}}
        className={cn(
          'min-h-[44px] flex-row items-center justify-between rounded-md border border-border bg-surface px-300 py-250',
          buttonClassName
        )}
        onPress={() => setOpen(true)}
        testID={testID ? `${testID}-trigger` : undefined}>
        <Text className={cn('text-200', displayValue ? 'text-text' : 'text-textMuted')}>
          {displayValue ?? placeholder}
        </Text>
        <Text className="text-200 text-textMuted">📅</Text>
      </Pressable>

      <Tray isOpen={isOpen} onOpenChange={setOpen}>
        {label != null && (
          <Text className="mb-200 text-200 font-medium text-text">{label}</Text>
        )}
        <Calendar
          {...calProps}
          onChange={handleChange}
          value={internalValue}
        />
      </Tray>
    </View>
  );
}

export interface DateRangePickerProps
  extends Omit<NativeRangeCalendarProps, 'onChange'> {
  buttonClassName?: string;
  className?: string;
  label?: string;
  onChange?: (range: RangeValue<DateValue>) => void;
  placeholder?: string;
  testID?: string;
}

export function DateRangePicker({
  buttonClassName,
  className,
  label,
  onChange,
  placeholder = 'Select date range',
  testID,
  value,
  ...calProps
}: DateRangePickerProps) {
  let [isOpen, setOpen] = useState(false);
  let [internalValue, setInternalValue] = useState<RangeValue<DateValue> | null>(
    (value as RangeValue<DateValue>) ?? null
  );

  let displayValue = internalValue?.start && internalValue?.end
    ? `${(internalValue.start as any).toString()} – ${(internalValue.end as any).toString()}`
    : null;

  let handleChange = useCallback(
    (range: RangeValue<DateValue>) => {
      setInternalValue(range);
      onChange?.(range);
      if (range.end) {
        setOpen(false);
      }
    },
    [onChange]
  );

  return (
    <View className={className} testID={testID}>
      {label != null && (
        <Text className="mb-100 text-200 font-medium text-text">{label}</Text>
      )}
      <Pressable
        accessibilityLabel={label ?? placeholder}
        accessibilityRole="button"
        accessibilityState={{expanded: isOpen || undefined}}
        className={cn(
          'min-h-[44px] flex-row items-center justify-between rounded-md border border-border bg-surface px-300 py-250',
          buttonClassName
        )}
        onPress={() => setOpen(true)}
        testID={testID ? `${testID}-trigger` : undefined}>
        <Text className={cn('text-200', displayValue ? 'text-text' : 'text-textMuted')}>
          {displayValue ?? placeholder}
        </Text>
        <Text className="text-200 text-textMuted">📅</Text>
      </Pressable>

      <Tray isOpen={isOpen} onOpenChange={setOpen}>
        {label != null && (
          <Text className="mb-200 text-200 font-medium text-text">{label}</Text>
        )}
        <RangeCalendar
          {...calProps}
          onChange={handleChange}
          value={internalValue}
        />
      </Tray>
    </View>
  );
}
