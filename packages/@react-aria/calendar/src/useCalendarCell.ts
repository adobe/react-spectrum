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

import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {HTMLAttributes, RefObject, useEffect} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isSameDay, isToday} from 'date-fns';
import {PressProps, usePress} from '@react-aria/interactions';
import {useDateFormatter, useMessageFormatter} from '@react-aria/i18n';

export interface AriaCalendarCellProps {
  date: Date,
  colIndex: number
}

interface CalendarCellAria {
  cellProps: PressProps & HTMLAttributes<HTMLElement>,
  buttonProps: HTMLAttributes<HTMLElement>
}

export function useCalendarCell(props: AriaCalendarCellProps, state: CalendarState | RangeCalendarState, ref: RefObject<HTMLElement>): CalendarCellAria {
  let {colIndex, date} = props;
  let formatMessage = useMessageFormatter(intlMessages);
  let dateFormatter = useDateFormatter({weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
  let isSelected = state.isSelected(date);
  let isFocused = state.isCellFocused(date);
  let isDisabled = state.isCellDisabled(date);

  // aria-label should be localize Day of week, Month, Day and Year without Time.
  let label = dateFormatter.format(date);
  if (isToday(date)) {
    // If date is today, set appropriate string depending on selected state:
    label = formatMessage(isSelected ? 'todayDateSelected' : 'todayDate', {
      date
    });
  } else if (isSelected) {
    // If date is selected but not today:
    label = formatMessage('dateSelected', {
      date
    });
  }

  // When a cell is focused and this is a range calendar, add a prompt to help
  // screenreader users know that they are in a range selection mode.
  if ('anchorDate' in state && isFocused && !state.isReadOnly) {
    let rangeSelectionPrompt = '';

    // If selection has started add "click to finish selecting range"
    if (state.anchorDate) {
      rangeSelectionPrompt = formatMessage('finishRangeSelectionPrompt');
    // Otherwise, add "click to start selecting range" prompt
    } else {
      rangeSelectionPrompt = formatMessage('startRangeSelectionPrompt');
    }

    // Append to aria-label
    if (rangeSelectionPrompt) {
      label = `${label} (${rangeSelectionPrompt})`;
    }
  }

  let {pressProps} = usePress({
    onPress: () => {
      if (!isDisabled) {
        state.selectDate(date);
        state.setFocusedDate(date);
      }
    }
  });

  let onMouseEnter = () => {
    if ('highlightDate' in state) {
      state.highlightDate(date);
    }
  };

  let tabIndex = null;
  if (!isDisabled) {
    tabIndex = isSameDay(date, state.focusedDate) ? 0 : -1;
  }

  // Focus the button in the DOM when the state updates.
  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.focus();
    }
  }, [isFocused, ref]);

  return {
    cellProps: {
      onMouseEnter: isDisabled ? null : onMouseEnter,
      role: 'gridcell',
      'aria-colindex': colIndex,
      'aria-disabled': isDisabled || null,
      'aria-selected': isSelected
    },
    buttonProps: {
      ...pressProps,
      onFocus() {
        if (!isDisabled) {
          state.setFocusedDate(date);
        }
      },
      tabIndex,
      role: 'button',
      'aria-disabled': isDisabled || null,
      'aria-label': label
    }
  };
}
