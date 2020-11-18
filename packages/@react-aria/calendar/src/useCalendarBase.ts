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

import {announce} from '@react-aria/live-announcer';
import {CalendarAria} from './types';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarStateBase} from '@react-stately/calendar';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps, mergeProps, useId, useLabels, useUpdateEffect} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardEvent, useRef} from 'react';
import {useDateFormatter, useLocale, useMessageFormatter} from '@react-aria/i18n';

export function useCalendarBase(props: CalendarPropsBase & DOMProps, state: CalendarStateBase, selectedDateDescription: string): CalendarAria {
  let {
    isReadOnly = false,
    isDisabled = false
  } = props;

  let domProps = filterDOMProps(props, {labelable: true});
  let formatMessage = useMessageFormatter(intlMessages);
  let monthFormatter = useDateFormatter({month: 'long', year: 'numeric'});
  let calendarBody = useRef(null); // TODO: should this be in RSP?
  let calendarId = useId(props.id);
  let calendarTitleId = useId();
  let captionId = useId();
  let {direction} = useLocale();

  // Announce when the current month changes
  useUpdateEffect(() => {
    // announce the new month with a change from the Previous or Next button
    if (!state.isFocused) {
      announce(monthFormatter.format(state.currentMonth));
    }
    // handle an update to the current month from the Previous or Next button
    // rather than move focus, we announce the new month value
  }, [state.currentMonth]);

  // Announce when the selected value changes
  useUpdateEffect(() => {
    if (selectedDateDescription) {
      announce(selectedDateDescription, 'polite', 4000);
    }
    // handle an update to the caption that describes the currently selected range, to announce the new value
  }, [selectedDateDescription]);

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
          state.focusPreviousYear();
        } else {
          state.focusPreviousMonth();
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.shiftKey) {
          state.focusNextYear();
        } else {
          state.focusNextMonth();
        }
        break;
      case 'End':
        e.preventDefault();
        state.focusEndOfMonth();
        break;
      case 'Home':
        e.preventDefault();
        state.focusStartOfMonth();
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
        state.focusPreviousWeek();
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
        state.focusNextWeek();
        break;
    }
  };

  // aria-label logic
  let labelProps = useLabels({
    id: calendarId,
    'aria-label': props['aria-label'],
    'aria-labelledby': `${props['aria-labelledby'] || ''} ${props['aria-label'] ? calendarId : ''} ${calendarTitleId}`
  });

  return {
    calendarProps: mergeProps(domProps, {
      ...labelProps,
      id: calendarId,
      role: 'group'
    }),
    calendarTitleProps: {
      id: calendarTitleId
    },
    nextButtonProps: {
      onPress: () => state.focusNextMonth(),
      'aria-label': formatMessage('next'),
      isDisabled: props.isDisabled || state.isNextMonthInvalid()
    },
    prevButtonProps: {
      onPress: () => state.focusPreviousMonth(),
      'aria-label': formatMessage('previous'),
      isDisabled: props.isDisabled || state.isPreviousMonthInvalid()
    },
    calendarBodyProps: {
      ref: calendarBody,
      role: 'grid',
      'aria-readonly': isReadOnly || null,
      'aria-disabled': isDisabled || null,
      'aria-labelledby': labelProps['aria-labelledby'],
      'aria-describedby': selectedDateDescription ? captionId : null,
      'aria-colcount': 7,
      'aria-rowcount': state.weeksInMonth + 1,
      onKeyDown,
      onFocus: () => state.setFocused(true),
      onBlur: () => state.setFocused(false)
    },
    captionProps: {
      id: captionId,
      children: selectedDateDescription
    }
  };
}
