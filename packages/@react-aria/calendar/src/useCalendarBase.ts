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
import {calendarIds, useSelectedDateDescription, useVisibleRangeDescription} from './utils';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {DOMProps} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useDescription, useId, useUpdateEffect} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';
import {useRef} from 'react';

export function useCalendarBase(props: CalendarPropsBase & DOMProps, state: CalendarState | RangeCalendarState): CalendarAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let calendarId = useId(props.id);

  let visibleRangeDescription = useVisibleRangeDescription(state.visibleRange.start, state.visibleRange.end, state.timeZone);

  // Announce when the visible date range changes
  useUpdateEffect(() => {
    // only when pressing the Previous or Next button
    if (!state.isFocused) {
      announce(visibleRangeDescription);
    }
  }, [visibleRangeDescription]);

  // Announce when the selected value changes
  let selectedDateDescription = useSelectedDateDescription(state);
  useUpdateEffect(() => {
    if (selectedDateDescription) {
      announce(selectedDateDescription, 'polite', 4000);
    }
    // handle an update to the caption that describes the currently selected range, to announce the new value
  }, [selectedDateDescription]);

  let descriptionProps = useDescription(visibleRangeDescription);

  // Label the child grid elements by the group element if it is labelled.
  calendarIds.set(state, props['aria-label'] || props['aria-labelledby'] ? calendarId : null);

  // If the next or previous buttons become disabled while they are focused, move focus to the calendar body.
  let nextFocused = useRef(false);
  let nextDisabled = props.isDisabled || state.isNextVisibleRangeInvalid();
  if (nextDisabled && nextFocused.current) {
    nextFocused.current = false;
    state.setFocused(true);
  }

  let previousFocused = useRef(false);
  let previousDisabled = props.isDisabled || state.isPreviousVisibleRangeInvalid();
  if (previousDisabled && previousFocused.current) {
    previousFocused.current = false;
    state.setFocused(true);
  }

  return {
    calendarProps: mergeProps(descriptionProps, {
      role: 'group',
      id: calendarId,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby']
    }),
    nextButtonProps: {
      onPress: () => state.focusNextPage(),
      'aria-label': formatMessage('next'),
      isDisabled: nextDisabled,
      onFocus: () => nextFocused.current = true,
      onBlur: () => nextFocused.current = false
    },
    prevButtonProps: {
      onPress: () => state.focusPreviousPage(),
      'aria-label': formatMessage('previous'),
      isDisabled: previousDisabled,
      onFocus: () => previousFocused.current = true,
      onBlur: () => previousFocused.current = false
    },
    title: visibleRangeDescription
  };
}
