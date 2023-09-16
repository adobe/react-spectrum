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
import {AriaButtonProps} from '@react-types/button';
import {AriaLabelingProps, DOMAttributes, DOMProps} from '@react-types/shared';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {filterDOMProps, mergeProps, useLabels, useSlotId, useUpdateEffect} from '@react-aria/utils';
import {hookData, useSelectedDateDescription, useVisibleRangeDescription} from './utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useState} from 'react';

export interface CalendarAria {
  /** Props for the calendar grouping element. */
  calendarProps: DOMAttributes,
  /** Props for the next button. */
  nextButtonProps: AriaButtonProps,
  /** Props for the previous button. */
  prevButtonProps: AriaButtonProps,
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes,
  /** A description of the visible date range, for use in the calendar title. */
  title: string
}

export function useCalendarBase(props: CalendarPropsBase & DOMProps & AriaLabelingProps, state: CalendarState | RangeCalendarState): CalendarAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let domProps = filterDOMProps(props);

  let title = useVisibleRangeDescription(state.visibleRange.start, state.visibleRange.end, state.timeZone, false);
  let visibleRangeDescription = useVisibleRangeDescription(state.visibleRange.start, state.visibleRange.end, state.timeZone, true);

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

  let errorMessageId = useSlotId([Boolean(props.errorMessage), props.isInvalid, props.validationState]);

  // Pass the label to the child grid elements.
  hookData.set(state, {
    ariaLabel: props['aria-label'],
    ariaLabelledBy: props['aria-labelledby'],
    errorMessageId,
    selectedDateDescription
  });

  // If the next or previous buttons become disabled while they are focused, move focus to the calendar body.
  let [nextFocused, setNextFocused] = useState(false);
  let nextDisabled = props.isDisabled || state.isNextVisibleRangeInvalid();
  if (nextDisabled && nextFocused) {
    setNextFocused(false);
    state.setFocused(true);
  }

  let [previousFocused, setPreviousFocused] = useState(false);
  let previousDisabled = props.isDisabled || state.isPreviousVisibleRangeInvalid();
  if (previousDisabled && previousFocused) {
    setPreviousFocused(false);
    state.setFocused(true);
  }

  let labelProps = useLabels({
    id: props['id'],
    'aria-label': [props['aria-label'], visibleRangeDescription].filter(Boolean).join(', '),
    'aria-labelledby': props['aria-labelledby']
  });

  return {
    calendarProps: mergeProps(domProps, labelProps, {
      role: 'application',
      'aria-describedby': props['aria-describedby'] || undefined
    }),
    nextButtonProps: {
      onPress: () => state.focusNextPage(),
      'aria-label': stringFormatter.format('next'),
      isDisabled: nextDisabled,
      onFocusChange: setNextFocused
    },
    prevButtonProps: {
      onPress: () => state.focusPreviousPage(),
      'aria-label': stringFormatter.format('previous'),
      isDisabled: previousDisabled,
      onFocusChange: setPreviousFocused
    },
    errorMessageProps: {
      id: errorMessageId
    },
    title
  };
}
