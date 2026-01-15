'use client';

import {today, getLocalTimeZone} from '@internationalized/date';
import {RangeCalendar} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export default function RangeCalendarExample() {
  let now = today(getLocalTimeZone()).set({day: 8});
  let disabledRanges = [
    [now, now.add({days: 2})],
    [now.add({days: 10}), now.add({days: 14})],
    [now.add({days: 23}), now.add({days: 28})],
  ];

  let isDateUnavailable = (date) => disabledRanges.some((interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center'})}>
      <RangeCalendar
        aria-label="Trip dates"
        minValue={now}
        isDateUnavailable={isDateUnavailable}
        defaultValue={{start: now.add({days: 5}), end: now.add({days: 8})}} />
    </div>
  );
}
