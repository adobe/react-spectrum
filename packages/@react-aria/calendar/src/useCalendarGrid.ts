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

import {CalendarDate} from '@internationalized/date';
import {CalendarGridAria} from './types';
import {calendarIds, useSelectedDateDescription, useVisibleRangeDescription} from './utils';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {KeyboardEvent} from 'react';
import {mergeProps, useDescription, useLabels} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

interface CalendarGridProps extends CalendarPropsBase {
  startDate?: CalendarDate,
  endDate?: CalendarDate
}

export function useCalendarGrid(props: CalendarGridProps, state: CalendarState | RangeCalendarState): CalendarGridAria {
  let {
    isReadOnly = false,
    isDisabled = false,
    startDate = state.visibleRange.start,
    endDate = state.visibleRange.end
  } = props;

  let {direction} = useLocale();

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        state.selectFocusedDate();
        break;
      case 'PageUp':
        e.preventDefault();
        if (e.shiftKey) {
          state.focusPreviousSection();
        } else {
          state.focusPreviousPage();
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.shiftKey) {
          state.focusNextSection();
        } else {
          state.focusNextPage();
        }
        break;
      case 'End':
        e.preventDefault();
        state.focusPageEnd();
        break;
      case 'Home':
        e.preventDefault();
        state.focusPageStart();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (direction === 'rtl') {
          state.focusNextDay();
        } else {
          state.focusPreviousDay();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        state.focusPreviousRow();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (direction === 'rtl') {
          state.focusPreviousDay();
        } else {
          state.focusNextDay();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        state.focusNextRow();
        break;
      case 'Escape':
        // Cancel the selection.
        if ('setAnchorDate' in state) {
          e.preventDefault();
          state.setAnchorDate(null);
        }
        break;
    }
  };

  let selectedDateDescription = useSelectedDateDescription(state);
  let descriptionProps = useDescription(selectedDateDescription);
  let visibleRangeDescription = useVisibleRangeDescription(startDate, endDate, state.timeZone);

  let labelProps = useLabels({
    'aria-label': visibleRangeDescription,
    'aria-labelledby': calendarIds.get(state)
  });

  return {
    gridProps: mergeProps(descriptionProps, labelProps, {
      role: 'grid',
      'aria-readonly': isReadOnly || null,
      'aria-disabled': isDisabled || null,
      'aria-multiselectable': ('highlightedRange' in state) || undefined,
      onKeyDown,
      onFocus: () => state.setFocused(true),
      onBlur: () => state.setFocused(false)
    })
  };
}
