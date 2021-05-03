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

import {AriaCalendarCellProps, useCalendarCell} from '@react-aria/calendar';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {classNames} from '@react-spectrum/utils';
import {isSameDay, isSameMonth, isToday} from 'date-fns';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useDateFormatter} from '@react-aria/i18n';
import {useHover} from '@react-aria/interactions';

interface CalendarCellProps extends AriaCalendarCellProps {
  state: CalendarState | RangeCalendarState
}

export function CalendarCell({state, ...props}: CalendarCellProps) {
  let ref = useRef<HTMLElement>();
  let {cellProps, buttonProps} = useCalendarCell(props, state, ref);
  let {hoverProps, isHovered} = useHover({});
  let dateFormatter = useDateFormatter({day: 'numeric'});
  let isSelected = state.isSelected(props.date);
  let highlightedRange = 'highlightedRange' in state && state.highlightedRange;
  let isSelectionStart = highlightedRange && isSameDay(props.date, highlightedRange.start);
  let isSelectionEnd = highlightedRange && isSameDay(props.date, highlightedRange.end);
  let isRangeStart = isSelected && (props.date.getDay() === 0 || props.date.getDate() === 1);
  let isRangeEnd = isSelected && (props.date.getDay() === 6 || props.date.getDate() === state.daysInMonth);

  return (
    <td
      {...cellProps}
      className={classNames(styles, 'spectrum-Calendar-tableCell')}>
      <span
        {...buttonProps}
        {...hoverProps}
        ref={ref}
        className={classNames(styles, 'spectrum-Calendar-date', {
          'is-today': isToday(props.date),
          'is-selected': isSelected,
          'is-focused': state.isCellFocused(props.date),
          'is-disabled': state.isCellDisabled(props.date),
          'is-outsideMonth': !isSameMonth(props.date, state.currentMonth),
          'is-range-start': isRangeStart,
          'is-range-end': isRangeEnd,
          'is-range-selection': isSelected && 'highlightedRange' in state,
          'is-selection-start': isSelectionStart,
          'is-selection-end': isSelectionEnd,
          'is-hovered': isHovered
        })}>
        {dateFormatter.format(props.date)}
      </span>
    </td>
  );
}
