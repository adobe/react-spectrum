import {DOMProps} from '@react-types/shared';

export interface CalendarRowGroupAria {
  rowGroupProps: DOMProps,
  rowProps: DOMProps
}

export function useCalendarRowGroup(): CalendarRowGroupAria {
  return {
    rowGroupProps: {
      role: 'rowgroup'
    },
    rowProps: {
      role: 'row'
    }
  };
}
