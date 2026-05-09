import React from 'react';
import {
  CalendarDate,
  createCalendar,
  getWeeksInMonth,
  isSameDay,
  isSameMonth,
  today
} from '@internationalized/date';
import {useCalendarState} from 'react-stately/useCalendarState';
import type {CalendarProps} from 'react-stately/useCalendarState';
import type {DateValue} from 'react-stately/useCalendarState';
import {Pressable, Text, View} from '../../primitives';
import {useProvider} from '../../provider';
import {cn} from '../../styles/cn';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface NativeCalendarProps extends CalendarProps<DateValue> {
  className?: string;
  locale?: string;
  testID?: string;
}

export function Calendar(rawProps: NativeCalendarProps) {
  let {className, locale, testID, ...calProps} = rawProps;
  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';

  let state = useCalendarState({
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

            let isSelected =
              state.value instanceof CalendarDate
                ? isSameDay(date, state.value as CalendarDate)
                : false;
            let isToday = isSameDay(date, today(state.timeZone));
            let isDisabled = state.isDisabled || !isSameMonth(date, state.visibleRange.start);
            let isUnavailable = state.isCellUnavailable(date);

            return (
              <Pressable
                accessibilityLabel={date.toString()}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isDisabled || isUnavailable || undefined,
                  selected: isSelected || undefined
                }}
                className={cn(
                  'flex-1 min-h-[44px] items-center justify-center rounded-md',
                  isSelected && 'bg-accent',
                  isToday && !isSelected && 'border border-accent',
                  (isDisabled || isUnavailable) && 'opacity-disabled'
                )}
                isDisabled={!!(isDisabled || isUnavailable)}
                key={`${weekIndex}-${i}`}
                onPress={() => !isDisabled && !isUnavailable && state.selectDate(date)}
                testID={testID ? `${testID}-day-${date.toString()}` : undefined}>
                <Text
                  className={cn(
                    'text-200',
                    isSelected ? 'font-bold text-accentText' : 'text-text',
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
