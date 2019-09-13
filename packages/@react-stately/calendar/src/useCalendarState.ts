import {addDays, addMonths, addWeeks, addYears, endOfDay, endOfMonth, getDaysInMonth, isSameDay, isSameMonth, startOfDay, startOfMonth, subDays, subMonths, subWeeks, subYears} from 'date-fns';
import {CalendarProps} from '@react-types/calendar';
import {CalendarState} from './types';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';
import {useWeekStart} from './useWeekStart';

export function useCalendarState(props: CalendarProps): CalendarState {
  let [value, setControlledValue] = useControlledState(props.value || undefined, props.defaultValue, props.onChange);
  let defaultMonth = value ? new Date(value) : new Date();
  let [currentMonth, setCurrentMonth] = useState(defaultMonth); // TODO: does this need to be in state at all??
  let [focusedDate, setFocusedDate] = useState(defaultMonth);
  let [isFocused, setFocused] = useState(false);
  let month = currentMonth.getMonth();
  let year = currentMonth.getFullYear();
  let weekStart = useWeekStart();
  let monthStartsAt = (startOfMonth(currentMonth).getDay() - weekStart) % 7;
  if (monthStartsAt < 0) {
    monthStartsAt += 7;
  }
  
  let days = getDaysInMonth(currentMonth);
  let weeksInMonth = Math.ceil((monthStartsAt + days) / 7);
  let minDate = props.minValue ? startOfDay(props.minValue) : null;
  let maxDate = props.maxValue ? endOfDay(props.maxValue) : null;

  // Sets focus to a specific cell date
  function focusCell(date: Date) {
    if (isInvalid(date, minDate, maxDate)) {
      return;
    }

    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(startOfMonth(date));
    }

    setFocusedDate(date);
  }

  function setValue(value: Date) {
    if (!props.isDisabled && !props.isReadOnly) {
      setControlledValue(value);
    }
  }

  return {
    value,
    setValue,
    currentMonth,
    setCurrentMonth,
    focusedDate,
    setFocusedDate,
    focusNextDay() {
      focusCell(addDays(focusedDate, 1));
    },
    focusPreviousDay() {
      focusCell(subDays(focusedDate, 1));
    },
    focusNextWeek() {
      focusCell(addWeeks(focusedDate, 1));
    },
    focusPreviousWeek() {
      focusCell(subWeeks(focusedDate, 1));
    },
    focusNextMonth() {
      focusCell(addMonths(focusedDate, 1));
    },
    focusPreviousMonth() {
      focusCell(subMonths(focusedDate, 1));
    },
    focusStartOfMonth() {
      focusCell(startOfMonth(focusedDate));
    },
    focusEndOfMonth() {
      focusCell(endOfMonth(startOfDay(focusedDate)));
    },
    focusNextYear() {
      focusCell(addYears(focusedDate, 1));
    },
    focusPreviousYear() {
      focusCell(subYears(focusedDate, 1));
    },
    selectFocusedDate() {
      setValue(focusedDate);
    },
    selectDate(date) {
      setValue(date);
    },
    isFocused,
    setFocused,
    weeksInMonth,
    weekStart,
    getCellOptions(weekIndex, dayIndex) {
      let day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
      let cellDate = new Date(year, month, day);
      let isCurrentMonth = cellDate.getMonth() === month;

      return {
        cellDate,
        isToday: isSameDay(cellDate, new Date()),
        isCurrentMonth,
        isDisabled: props.isDisabled || !isCurrentMonth || isInvalid(cellDate, minDate, maxDate),
        isSelected: isSameDay(cellDate, value),
        isFocused: isFocused && focusedDate && isSameDay(cellDate, focusedDate),
        isReadOnly: props.isReadOnly
      };
    }
  };
}

function isInvalid(date: Date, minDate: Date, maxDate: Date) {
  return (minDate != null && date < minDate) ||
    (maxDate != null && date > maxDate);
}
