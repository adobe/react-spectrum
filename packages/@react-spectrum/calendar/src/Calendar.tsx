import {CalendarBase} from './CalendarBase';
import React from 'react';
import {SpectrumCalendarProps} from '@react-types/calendar';
import {useCalendar} from '@react-aria/calendar';
import {useCalendarState} from '@react-stately/calendar';

export function Calendar(props: SpectrumCalendarProps) {
  let state = useCalendarState(props);
  let aria = useCalendar(props, state);
  return (
    <CalendarBase
      {...props}
      state={state}
      aria={aria} />
  );
}
