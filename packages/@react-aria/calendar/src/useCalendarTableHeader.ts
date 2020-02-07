import {CalendarRowGroupAria, useCalendarRowGroup} from './useCalendarRowGroup';
import {DOMProps} from '@react-types/shared';

interface CalendarTableHeaderAria extends CalendarRowGroupAria {
  columnHeaderProps: DOMProps
}

export function useCalendarTableHeader(): CalendarTableHeaderAria {
  return {
    ...useCalendarRowGroup(),
    columnHeaderProps: {
      role: 'columnheader'
    }
  };
}
