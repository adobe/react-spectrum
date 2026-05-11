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

import {AriaLabelingProps, DOMProps, FocusableElement, RefObject} from '@react-types/shared';
import {CalendarAria, useCalendarBase} from './useCalendarBase';
import {DateValue, RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {isFocusWithin, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {RangeCalendarProps} from 'react-stately/useRangeCalendarState';
import {useEvent} from '../utils/useEvent';
import {useRef} from 'react';

export interface AriaRangeCalendarProps<T extends DateValue>
  extends RangeCalendarProps<T>, DOMProps, AriaLabelingProps {
  /**
   * Controls the behavior when a pointer is released outside the calendar or a blur occurs mid selection:
   *
   * - `clear`: clear the currently selected range of dates.
   *
   * - `reset`: reset the selection to the previously selected range of dates.
   *
   * - `select`: select the currently hovered range of dates.
   * @default 'select'
   */
  commitBehavior?: 'clear' | 'reset' | 'select';
}

/**
 * Provides the behavior and accessibility implementation for a range calendar component.
 * A range calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
export function useRangeCalendar<T extends DateValue>(
  props: AriaRangeCalendarProps<T>,
  state: RangeCalendarState,
  ref: RefObject<FocusableElement | null>
): CalendarAria {
  let {commitBehavior = 'select', ...otherProps} = props;
  let res = useCalendarBase(otherProps, state);

  // We need to ignore virtual pointer events from VoiceOver due to these bugs.
  // https://bugs.webkit.org/show_bug.cgi?id=222627
  // https://bugs.webkit.org/show_bug.cgi?id=223202
  // usePress also does this and waits for the following click event before firing.
  // We need to match that here otherwise this will fire before the press event in
  // useCalendarCell, causing range selection to not work properly.
  let isVirtualClick = useRef(false);
  let windowRef = useRef(typeof window !== 'undefined' ? window : null);
  useEvent(windowRef, 'pointerdown', e => {
    isVirtualClick.current = e.width === 0 && e.height === 0;
  });

  const commitBehaviorMapping = {
    clear: () => state.clearSelection(),
    reset: () => state.setAnchorDate(null),
    select: () => state.commitSelection()
  };

  // Execute method corresponding to `commitBehavior` when pressing or releasing a pointer outside the calendar body,
  // except when pressing the next or previous buttons to switch months.
  let endDragging = (e: PointerEvent) => {
    if (isVirtualClick.current) {
      isVirtualClick.current = false;
      return;
    }

    state.setDragging(false);
    if (!state.anchorDate) {
      return;
    }

    let target = e.target as Element;
    if (
      ref.current &&
      isFocusWithin(ref.current) &&
      (!nodeContains(ref.current, target) || !target.closest('button, [role="button"]'))
    ) {
      commitBehaviorMapping[commitBehavior]();
    }
  };

  useEvent(windowRef, 'pointerup', endDragging);

  // Also execute method corresponding to `commitBehavior` on blur,
  // e.g. tabbing away from the calendar.
  res.calendarProps.onBlur = e => {
    if (!ref.current) {
      return;
    }

    if ((!e.relatedTarget || !nodeContains(ref.current, e.relatedTarget)) && state.anchorDate) {
      commitBehaviorMapping[commitBehavior]();
    }
  };

  // Prevent touch scrolling while dragging
  useEvent(
    ref,
    'touchmove',
    e => {
      if (state.isDragging) {
        e.preventDefault();
      }
    },
    {passive: false, capture: true}
  );

  return res;
}
