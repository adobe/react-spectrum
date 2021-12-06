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
import {RefObject, useRef} from 'react';
import {useCalendarBase} from './useCalendarBase';
import {useEvent, useId} from '@react-aria/utils';

export function useRangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, state: RangeCalendarState, ref: RefObject<HTMLElement>): CalendarAria {
  let res = useCalendarBase(props, state);
  res.nextButtonProps.id = useId();
  res.prevButtonProps.id = useId();

  // We need to ignore virtual pointer events from VoiceOver due to these bugs.
  // https://bugs.webkit.org/show_bug.cgi?id=222627
  // https://bugs.webkit.org/show_bug.cgi?id=223202
  // usePress also does this and waits for the following click event before firing.
  // We need to match that here otherwise this will fire before the press event in
  // useCalendarCell, causing range selection to not work properly.
  let isVirtualClick = useRef(false);
  useEvent(useRef(window), 'pointerdown', e => {
    isVirtualClick.current = e.width === 0 && e.height === 0;
  });

  // Stop range selection when pressing or releasing a pointer outside the calendar body,
  // except when pressing the next or previous buttons to switch months.
  let endDragging = e => {
    if (isVirtualClick.current) {
      isVirtualClick.current = false;
      return;
    }

    state.setDragging(false);
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
  };

  useEvent(useRef(window), 'pointerup', endDragging);
  useEvent(useRef(window), 'pointercancel', endDragging);

  // Prevent touch scrolling while dragging
  useEvent(ref, 'touchmove', e => {
    if (state.isDragging) {
      e.preventDefault();
    }
  }, {passive: false, capture: true});

  return res;
}
