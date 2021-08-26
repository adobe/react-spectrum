/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CalendarAria} from './types';
import {DateValue, RangeCalendarProps} from '@react-types/calendar';
import {RangeCalendarState} from '@react-stately/calendar';
import {useCalendarBase} from './useCalendarBase';
import {useEvent, useId} from '@react-aria/utils';
import {useRef} from 'react';

export function useRangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, state: RangeCalendarState): CalendarAria {
  let res = useCalendarBase(props, state);
  res.nextButtonProps.id = useId();
  res.prevButtonProps.id = useId();

  // Stop range selection when pressing or releasing a pointer outside the calendar body,
  // except when pressing the next or previous buttons to switch months.
  useEvent(useRef(window), 'pointerup', e => {
    if (!state.anchorDate) {
      return;
    }

    let target = e.target as HTMLElement;
    let body = document.getElementById(res.calendarProps.id);
    if (
      (!body.contains(target) || target.getAttribute('role') !== 'button') &&
      !document.getElementById(res.nextButtonProps.id)?.contains(target) &&
      !document.getElementById(res.prevButtonProps.id)?.contains(target)
    ) {
      state.selectFocusedDate();
    }
  });

  return res;
}
