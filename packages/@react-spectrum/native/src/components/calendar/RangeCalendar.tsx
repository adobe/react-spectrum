import React from 'react';
import {
  CalendarDate,
  createCalendar,
  getWeeksInMonth,
  isSameDay,
  isSameMonth,
  today
} from '@internationalized/date';
import {useRangeCalendarState} from 'react-stately/useRangeCalendarState';
import type {RangeCalendarProps} from 'react-stately/useRangeCalendarState';
import type {DateValue} from 'react-stately/useCalendarState';
import type {RangeValue} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {useProvider} from '../../provider';
import {cn} from '../../styles/cn';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface NativeRangeCalendarProps extends RangeCalendarProps<DateValue> {
  className?: string;
  locale?: string;
  testID?: string;
}

export function RangeCalendar(rawProps: NativeRangeCalendarProps) {
  let {className, locale, testID, ...calProps} = rawProps;
  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';

  let state = useRangeCalendarState({
    ...calProps,
    createCalendar,
    locale: resolvedLocale
  });

  let monthName = new Intl.DateTimeFormat(resolvedLocale, {
    month: 'long',
    year: 'numeric'
  }).format(
    state.visibleRange.start.toDate
      ? state.visibleRange.start.toDate('UTC')
      : new Date()
  );

  let weeksCount = getWeeksInMonth(state.visibleRange.start, resolvedLocale);
  let rangeValue = state.value as RangeValue<CalendarDate> | null;

  function isInRange(date: CalendarDate) {
    if (!rangeValue?.start || !rangeValue?.end) {
      return false;
    }
    return (
      date.compare(rangeValue.start) >= 0 && date.compare(rangeValue.end) <= 0
    );
  }

  return (
    <View className={cn('gap-300 p-300', className)} testID={testID}>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Previous month"
          accessibilityRole="button"
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          onPress={() => state.focusPreviousPage()}
          testID={testID ? `${testID}-prev` : undefined}>
          <Text className="text-300 text-textMuted">‹</Text>
        </Pressable>
        <Text className="text-200 font-medium text-text">{monthName}</Text>
        <Pressable
          accessibilityLabel="Next month"
          accessibilityRole="button"
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          onPress={() => state.focusNextPage()}
          testID={testID ? `${testID}-next` : undefined}>
          <Text className="text-300 text-textMuted">›</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-around">
        {DAYS.map(day => (
          <View className="flex-1 items-center py-100" key={day}>
            <Text className="text-100 font-medium text-textMuted">{day}</Text>
          </View>
        ))}
      </View>

      {Array.from({length: weeksCount}, (_, weekIndex) => (
        <View className="flex-row justify-around" key={weekIndex}>
          {state.getDatesInWeek(weekIndex).map((date, i) => {
            if (!date) {
              return <View className="flex-1" key={i} />;
            }

            let isStart = rangeValue?.start ? isSameDay(date, rangeValue.start) : false;
            let isEnd = rangeValue?.end ? isSameDay(date, rangeValue.end) : false;
            let inRange = isInRange(date);
            let isToday = isSameDay(date, today(state.timeZone));
            let isOutside = !isSameMonth(date, state.visibleRange.start);
            let isDisabled = state.isDisabled || isOutside;
            let isUnavailable = state.isCellUnavailable(date);

            return (
              <Pressable
                accessibilityLabel={date.toString()}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isDisabled || isUnavailable || undefined,
                  selected: (isStart || isEnd) || undefined
                }}
                className={cn(
                  'flex-1 min-h-[44px] items-center justify-center',
                  (isStart || isEnd) && 'rounded-md bg-accent',
                  inRange && !isStart && !isEnd && 'bg-accentSubtle',
                  isToday && !isStart && !isEnd && 'border border-accent rounded-md',
                  (isDisabled || isUnavailable) && 'opacity-disabled'
                )}
                isDisabled={!!(isDisabled || isUnavailable)}
                key={`${weekIndex}-${i}`}
                onPress={() => !isDisabled && !isUnavailable && state.selectDate(date)}
                testID={testID ? `${testID}-day-${date.toString()}` : undefined}>
                <Text
                  className={cn(
                    'text-200',
                    isStart || isEnd ? 'font-bold text-accentText' : 'text-text',
                    isDisabled && 'text-textMuted'
                  )}>
                  {date.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
