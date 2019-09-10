import {CalendarCell} from './CalendarCell';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import React from 'react';

interface CalendarTableBodyProps {
  state: CalendarState | RangeCalendarState
}

export function CalendarTableBody({state}: CalendarTableBodyProps) {
  return (
    <tbody>
      {
        [...new Array(state.weeksInMonth).keys()].map(weekIndex => (
          <tr key={weekIndex}>
            {
              [...new Array(7).keys()].map(dayIndex => (
                <CalendarCell
                  key={dayIndex}
                  state={state}
                  {...state.getCellOptions(weekIndex, dayIndex)} />
                )
              )
            }
          </tr>
        ))
      }
    </tbody>
  );
}
