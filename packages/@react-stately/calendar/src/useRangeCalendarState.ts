import {endOfDay, getDaysInMonth, isSameDay, startOfDay} from 'date-fns';
import {RangeCalendarProps} from '@react-types/calendar';
import {RangeCalendarState} from './types';
import {RangeValue} from '@react-types/shared';
import {useCalendarState} from './useCalendarState';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export function useRangeCalendarState(props: RangeCalendarProps): RangeCalendarState {
  let {value: valueProp, defaultValue, onChange, ...calendarProps} = props;
  let [value, setValue] = useControlledState(
    valueProp,
    defaultValue,
    onChange
  );

  let [anchorDate, setAnchorDate] = useState(null);
  let calendar = useCalendarState({
    ...calendarProps,
    value: value && value.start
  });

  let highlightedRange = anchorDate ? makeRange(anchorDate, calendar.focusedDate) : value && makeRange(value.start, value.end);
  let selectDate = (date: Date) => {
    if (props.isReadOnly) {
      return;
    }

    if (!anchorDate) {
      setAnchorDate(date);
    } else {
      setValue(makeRange(anchorDate, date));
      setAnchorDate(null);
    }
  };

  return {
    ...calendar,
    value,
    setValue,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    selectFocusedDate() {
      selectDate(calendar.focusedDate);
    },
    selectDate,
    highlightDate(date) {
      if (anchorDate) {
        calendar.setFocusedDate(date);
      }
    },
    getCellOptions(weekIndex, dayIndex) {
      let opts = calendar.getCellOptions(weekIndex, dayIndex);
      let isSelected = highlightedRange && opts.cellDate >= highlightedRange.start && opts.cellDate <= highlightedRange.end;
      return {
        ...opts,
        isRangeSelection: isSelected,
        isSelected,
        isRangeStart: isSelected && (dayIndex === 0 || opts.cellDate.getDate() === 1),
        isRangeEnd: isSelected && (dayIndex === 6 || opts.cellDate.getDate() === getDaysInMonth(calendar.currentMonth)),
        isSelectionStart: highlightedRange && isSameDay(opts.cellDate, highlightedRange.start),
        isSelectionEnd: highlightedRange && isSameDay(opts.cellDate, highlightedRange.end)
      };
    }
  };
}

function makeRange(start: Date, end: Date): RangeValue<Date> {
  if (end < start) {
    [start, end] = [end, start];
  }

  return {start: startOfDay(start), end: endOfDay(end)};
}
