import {CalendarProps} from '@react-types/calendar';
import {CalendarState} from '@react-stately/calendar';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useCalendarBase} from './useCalendarBase';
import {useMemo} from 'react';
import {useMessageFormatter} from '@react-aria/i18n';

export function useCalendar(props: CalendarProps, state: CalendarState) {
  // Compute localized message for the selected date
  let formatMessage = useMessageFormatter(intlMessages);
  let selectedDateDescription = useMemo(
    () => state.value ? formatMessage('selectedDateDescription', {date: state.value}) : '',
    [formatMessage, state.value]
  );

  return useCalendarBase(props, state, selectedDateDescription);
}
