import {classNames} from '@react-spectrum/utils';
import React from 'react';
import {setDay} from 'date-fns'; // pull these out individually
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useCalendarTableHeader} from '@react-aria/calendar';
import {useDateFormatter} from '@react-aria/i18n';

interface CalendarTableHeaderProps {
  weekStart: number
}

export function CalendarTableHeader({weekStart}: CalendarTableHeaderProps) {
  const {
    columnHeaderProps
  } = useCalendarTableHeader();
  let dayFormatter = useDateFormatter({weekday: 'short'});
  return (
    <thead>
      <tr>
        {
          [...new Array(7).keys()].map(index => {
            let day = dayFormatter.format(setDay(Date.now(), (index + weekStart) % 7));
            return (
              <th
                key={index}
                {...columnHeaderProps}
                className={classNames(styles, 'spectrum-Calendar-tableCell')}>
                <abbr className={classNames(styles, 'spectrum-Calendar-dayOfWeek')}>
                  {day}
                </abbr>
              </th>
            );
          })
        }
      </tr>
    </thead>
  );
}
