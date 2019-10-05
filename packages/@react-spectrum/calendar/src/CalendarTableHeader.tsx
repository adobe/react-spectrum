import {classNames} from '@react-spectrum/utils';
import React from 'react';
import {setDay} from 'date-fns'; // pull these out individually
// eslint-disable-next-line monorepo/no-internal-import
import styles from '@spectrum-css/calendar/dist/index-vars.css';
import {useDateFormatter} from '@react-aria/i18n';

interface CalendarTableHeaderProps {
  weekStart: number
}

export function CalendarTableHeader({weekStart}: CalendarTableHeaderProps) {
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
