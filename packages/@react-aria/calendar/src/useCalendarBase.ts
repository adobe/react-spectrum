import {announce} from '@react-aria/live-announcer';
import {CalendarAria} from './types';
import {CalendarPropsBase} from '@react-types/calendar';
import {CalendarStateBase} from '@react-stately/calendar';
import {format} from 'date-fns';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardEvent, useEffect, useRef} from 'react';
import {useDateFormatter, useLocale, useMessageFormatter} from '@react-aria/i18n';
import {useId, useLabels, useUpdateEffect} from '@react-aria/utils';

// Returns the id for a specific cell date
export function getCellId(date: Date, calendarId: string): string {
  return `${calendarId}-${format(date, 'YYYY-MM-DD')}`;
}

const calendarIds = new WeakMap<CalendarStateBase, string>();
export function getCalendarId(state: CalendarStateBase): string {
  return calendarIds.get(state);
}

export function useCalendarBase(props: CalendarPropsBase, state: CalendarStateBase, selectedDateDescription: string): CalendarAria {
  let {
    autoFocus = false,
    isReadOnly = false,
    isDisabled = false
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);
  let monthFormatter = useDateFormatter({month: 'long', year: 'numeric'});
  let calendarBody = useRef(null); // TODO: should this be in RSP?
  let calendarId = useId(props.id);
  let calendarTitleId = useId();
  let captionId = useId();
  let {direction} = useLocale();

  // Store calendarId so that useCalendarCell can access it.
  // Kinda hacky, but it's the easiest way to get the id from the cell.
  calendarIds.set(state, calendarId);

  useEffect(() => {
    // focus the calendar body when mounting
    if (autoFocus) {
      calendarBody.current.focus();
    }
  }, [autoFocus]);

  // Announce when the current month changes
  useUpdateEffect(() => {
    announce(monthFormatter.format(state.currentMonth));
  }, [state.currentMonth]);

  // Announce when the selected value changes
  useUpdateEffect(() => {
    if (selectedDateDescription) {
      announce(selectedDateDescription);
    }
  }, [selectedDateDescription]);

  // Ensure that the focused date is announced when it changes.
  // VoiceOver does not announce changes to aria-activedescendant or move the VoiceOver cursor,
  // so we blur and re-focus the calendar body to force it to do so.
  // This will cause the focused date, along with the selected date (part of the table caption)
  // to be announced as you move around the calendar.
  useUpdateEffect(() => {
    if (document.activeElement === calendarBody.current) {
      calendarBody.current.blur();
      calendarBody.current.focus();
    }
  }, [state.focusedDate]);

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
    calendarProps: {
      ...labelProps,
      id: calendarId,
      role: 'group'
    },
    calendarTitleProps: {
      id: calendarTitleId
    },
    nextButtonProps: {
      onPress: () => state.focusNextMonth(),
      'aria-label': formatMessage('next')
    },
    prevButtonProps: {
      onPress: () => state.focusPreviousMonth(),
      'aria-label': formatMessage('previous')
    },
    calendarBodyProps: {
      ref: calendarBody,
      role: 'grid',
      tabIndex: isDisabled ? null : 0,
      'aria-readonly': isReadOnly,
      'aria-disabled': isDisabled,
      'aria-activedescendant': getCellId(state.focusedDate, calendarId),
      'aria-labelledby': labelProps['aria-labelledby'],
      'aria-describedby': selectedDateDescription ? captionId : null,
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
