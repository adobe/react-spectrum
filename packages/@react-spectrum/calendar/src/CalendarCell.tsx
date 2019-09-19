import {CalendarCellOptions, CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '@spectrum-css/calendar/dist/index-vars.css';
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
