import {CalendarBase} from './CalendarBase';
import {RangeCalendarProps} from '@react-types/calendar';
import React from 'react';
import {useRangeCalendar} from '@react-aria/calendar';
import {useRangeCalendarState} from '@react-stately/calendar';

export function RangeCalendar(props: RangeCalendarProps) {
  let state = useRangeCalendarState(props);
  let aria = useRangeCalendar(props, state);
  return (
    <CalendarBase
      {...props}
      state={state}
      aria={aria} />
  );
}
