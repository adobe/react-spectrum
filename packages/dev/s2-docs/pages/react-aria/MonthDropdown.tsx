import type {CalendarDate} from '@internationalized/date';
import {CalendarStateContext} from 'react-aria-components';
import {Select, SelectItem} from 'vanilla-starter/Select';
import {useContext} from 'react';
import {useDateFormatter} from 'react-aria';

interface MonthItem {
  id: number,
  date: CalendarDate,
  formatted: string
}

export function MonthDropdown() {
  let state = useContext(CalendarStateContext)!;
  let formatter = useDateFormatter({
    month: 'short',
    timeZone: state.timeZone
  });
  
  // Format the name of each month in the year according to the
  // current locale and calendar system. Note that in some calendar
  // systems, such as the Hebrew, the number of months may differ
  // between years.
  let months: MonthItem[] = [];
  let numMonths = state.focusedDate.calendar.getMonthsInYear(state.focusedDate);
  for (let i = 1; i <= numMonths; i++) {
    let date = state.focusedDate.set({month: i});
    months.push({
      id: i,
      date,
      formatted: formatter.format(date.toDate(state.timeZone))
    });
  }

  return (
    <Select
      aria-label="Month"
      style={{flex: 1}}
      selectedKey={state.focusedDate.month}
      onSelectionChange={key => {
        if (typeof key === 'number') {
          state.setFocusedDate(months[key - 1].date);
        }
      }}
      items={months}>
      {item => <SelectItem>{item.formatted}</SelectItem>}
    </Select>
  );
}
