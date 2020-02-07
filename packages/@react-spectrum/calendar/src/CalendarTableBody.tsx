import {CalendarCell} from './CalendarCell';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import React from 'react';
import {useCalendarRowGroup} from '@react-aria/calendar';

interface CalendarTableBodyProps {
  state: CalendarState | RangeCalendarState
}

export function CalendarTableBody({state}: CalendarTableBodyProps) {
  const {rowGroupProps, rowProps} = useCalendarRowGroup();
  return (
    <tbody
      {...rowGroupProps}>
      {
        [...new Array(state.weeksInMonth).keys()].map(weekIndex => (
          <tr 
            {...rowProps}
            key={weekIndex}>
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
