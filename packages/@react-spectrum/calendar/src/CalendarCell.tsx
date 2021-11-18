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
import {CalendarDate, getDayOfWeek, isEqualDay, isSameDay, isSameMonth, isToday} from '@internationalized/date';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {classNames} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import React, {useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useDateFormatter, useLocale} from '@react-aria/i18n';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';

interface CalendarCellProps extends AriaCalendarCellProps {
  state: CalendarState | RangeCalendarState,
  currentMonth: CalendarDate
}

export function CalendarCell({state, currentMonth, ...props}: CalendarCellProps) {
  let ref = useRef<HTMLElement>();
  let {cellProps, buttonProps, isPressed} = useCalendarCell({
    ...props,
    isDisabled: !isSameMonth(props.date, currentMonth)
  }, state, ref);
  let {hoverProps, isHovered} = useHover({});
  let dateFormatter = useDateFormatter({
    day: 'numeric',
    timeZone: state.timeZone,
    calendar: currentMonth.calendar.identifier
  });
  let isSelected = state.isSelected(props.date);
  let highlightedRange = 'highlightedRange' in state && state.highlightedRange;
  let isSelectionStart = highlightedRange && isSameDay(props.date, highlightedRange.start);
  let isSelectionEnd = highlightedRange && isSameDay(props.date, highlightedRange.end);
  let {locale} = useLocale();
  let dayOfWeek = getDayOfWeek(props.date, locale);
  let isRangeStart = isSelected && (dayOfWeek === 0 || props.date.day === 1);
  let isRangeEnd = isSelected && (dayOfWeek === 6 || props.date.day === currentMonth.calendar.getDaysInMonth(currentMonth));
  let {focusProps, isFocusVisible} = useFocusRing();

  // For performance, reuse the same date object as before if the new date prop is the same.
  // This allows subsequent useMemo results to be reused.
  let date = props.date;
  let lastDate = useRef(null);
  if (lastDate.current && isEqualDay(date, lastDate.current)) {
    date = lastDate.current;
  }

  lastDate.current = date;

  let nativeDate = useMemo(() => date.toDate(state.timeZone), [date, state.timeZone]);
  let formatted = useMemo(() => dateFormatter.format(nativeDate), [dateFormatter, nativeDate]);

  return (
    <td
      {...cellProps}
      className={classNames(styles, 'spectrum-Calendar-tableCell')}>
      <span
        {...mergeProps(buttonProps, hoverProps, focusProps)}
        ref={ref}
        className={classNames(styles, 'spectrum-Calendar-date', {
          'is-today': isToday(props.date, state.timeZone),
          'is-selected': isSelected,
          'is-focused': state.isCellFocused(props.date) && isFocusVisible,
          'is-disabled': state.isCellDisabled(props.date),
          'is-outsideMonth': !isSameMonth(props.date, currentMonth),
          'is-range-start': isRangeStart,
          'is-range-end': isRangeEnd,
          'is-range-selection': isSelected && 'highlightedRange' in state,
          'is-selection-start': isSelectionStart,
          'is-selection-end': isSelectionEnd,
          'is-hovered': isHovered,
          'is-pressed': isPressed
        })}>
        <span className={classNames(styles, 'spectrum-Calendar-dateText')}>{formatted}</span>
      </span>
    </td>
  );
}
