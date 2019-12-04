import {CalendarBase} from './CalendarBase';
import {CalendarProps} from '@react-types/calendar';
import {DOMProps} from '@react-types/shared';
import React from 'react';
import {StyleProps} from '@react-spectrum/view';
import {useCalendar} from '@react-aria/calendar';
import {useCalendarState} from '@react-stately/calendar';

interface SpectrumCalendarProps extends CalendarProps, DOMProps, StyleProps {}

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
