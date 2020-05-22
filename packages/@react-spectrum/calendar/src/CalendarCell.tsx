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

import {CalendarCellOptions, CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useCalendarCell} from '@react-aria/calendar';
import {useDateFormatter} from '@react-aria/i18n';

interface CalendarCellProps extends CalendarCellOptions {
  state: CalendarState | RangeCalendarState
}

export function CalendarCell({state, ...props}: CalendarCellProps) {
  let {cellProps} = useCalendarCell(props, state);
  let dateFormatter = useDateFormatter({day: 'numeric'});

  return (
    <td
      {...cellProps}
      className={classNames(styles, 'spectrum-Calendar-tableCell')}>
      <span
        role="presentation"
        className={classNames(styles, 'spectrum-Calendar-date', {
          'is-today': props.isToday,
          'is-selected': props.isSelected,
          'is-focused': props.isFocused,
          'is-disabled': props.isDisabled,
          'is-outsideMonth': !props.isCurrentMonth,
          'is-range-start': props.isRangeStart,
          'is-range-end': props.isRangeEnd,
          'is-range-selection': props.isRangeSelection,
          'is-selection-start': props.isSelectionStart,
          'is-selection-end': props.isSelectionEnd
        })}>
        {dateFormatter.format(props.cellDate)}
      </span>
    </td>
  );
}
