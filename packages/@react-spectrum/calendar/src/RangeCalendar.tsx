import {CalendarBase} from './CalendarBase';
import {DOMProps} from '@react-types/shared';
import {RangeCalendarProps} from '@react-types/calendar';
import React from 'react';
import {StyleProps} from '@react-spectrum/view';
import {useRangeCalendar} from '@react-aria/calendar';
import {useRangeCalendarState} from '@react-stately/calendar';

interface SpectrumRangeCalendarProps extends RangeCalendarProps, DOMProps, StyleProps {}

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
