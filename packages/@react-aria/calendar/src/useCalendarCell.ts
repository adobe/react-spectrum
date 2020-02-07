import {CalendarCellOptions, CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {getCalendarId, getCellId} from './useCalendarBase';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {PressProps, useFocus, usePress} from '@react-aria/interactions';
import {useDateFormatter, useMessageFormatter} from '@react-aria/i18n';

interface CalendarCellAria {
  cellProps: PressProps & HTMLAttributes<HTMLElement>,
  textProps: HTMLAttributes<HTMLElement>
}

export function useCalendarCell(props: CalendarCellOptions, state: CalendarState | RangeCalendarState): CalendarCellAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let dateFormatter = useDateFormatter({weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});

  // aria-label should be localize Day of week, Month, Day and Year without Time.
  let label = dateFormatter.format(props.cellDate);
  if (props.isToday) {
    // If date is today, set appropriate string depending on selected state:
    label = formatMessage(props.isSelected ? 'todayDateSelected' : 'todayDate', {
      date: props.cellDate
    });
  } else if (props.isSelected) {
    // If date is selected but not today:
    label = formatMessage('dateSelected', {
      date: props.cellDate
    });
  }

  // When a cell is focused and this is a range calendar, add a prompt to help
  // screenreader users know that they are in a range selection mode.
  if ('anchorDate' in state && props.isFocused && !props.isReadOnly) {
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
      if (!props.isDisabled) {
        state.selectDate(props.cellDate);
        state.setFocusedDate(props.cellDate);
      }
    }
  });

  let {focusProps} = useFocus({
    onFocus: (event) => {
      if (!props.isDisabled) {
        state.setFocusedDate(props.cellDate);
        event.continuePropagation();
      }
    }
  });

  let onMouseEnter = () => {
    if ('highlightDate' in state) {
      state.highlightDate(props.cellDate);
    }
  };

  let tabIndex =  null;
  if (!props.isDisabled) {
    const focusedDate = state.focusedDate;
    focusedDate.setHours(0, 0, 0, 0);
    tabIndex = props.isFocused || props.cellDate.valueOf() === focusedDate.valueOf() ? 0 : -1;
  }

  return {
    cellProps: {
      ...pressProps,
      ...focusProps,
      tabIndex,
      onMouseEnter: props.isDisabled ? null : onMouseEnter,
      id: getCellId(props.cellDate, getCalendarId(state)),
      role: 'gridcell',
      'aria-disabled': props.isDisabled || null,
      'aria-selected': props.isSelected,
      'aria-label': label
    },
    textProps: {
      role: 'presentation'
    }
  };
}
