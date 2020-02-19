interface CalendarTableHeaderAria {
  columnHeaderProps: {scope?: 'col'}
}

export function useCalendarTableHeader(): CalendarTableHeaderAria {
  return {
    columnHeaderProps: {
      scope: 'col'
    }
  };
}
