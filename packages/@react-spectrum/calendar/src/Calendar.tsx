import {CalendarBase} from './CalendarBase';
import {CalendarProps} from '@react-types/calendar';
import React from 'react';
import {useCalendar} from '@react-aria/calendar';
import {useCalendarState} from '@react-stately/calendar';

export function Calendar(props: CalendarProps) {
  let state = useCalendarState(props);
  let aria = useCalendar(props, state);
  return (
    <CalendarBase
      {...props}
      state={state}
      aria={aria} />
  );
}
