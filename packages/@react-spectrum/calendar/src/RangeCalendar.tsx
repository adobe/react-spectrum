import {CalendarBase} from './CalendarBase';
import React from 'react';
import {SpectrumRangeCalendarProps} from '@react-types/calendar';
import {useRangeCalendar} from '@react-aria/calendar';
import {useRangeCalendarState} from '@react-stately/calendar';

export function RangeCalendar(props: SpectrumRangeCalendarProps) {
  let state = useRangeCalendarState(props);
  let aria = useRangeCalendar(props, state);
  return (
    <CalendarBase
      {...props}
      state={state}
      aria={aria} />
  );
}
