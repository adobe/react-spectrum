import {RangeValue} from '@react-types/shared';

export interface CalendarStateBase {
  currentMonth: Date,
  setCurrentMonth(value: Date): void,
  focusedDate: Date,
  setFocusedDate(value: Date): void,
  focusNextDay(): void,
  focusPreviousDay(): void,
  focusNextWeek(): void,
  focusPreviousWeek(): void,
  focusNextMonth(): void,
  focusPreviousMonth(): void,
  focusStartOfMonth(): void,
  focusEndOfMonth(): void,
  focusNextYear(): void,
  focusPreviousYear(): void,
  selectFocusedDate(): void,
  selectDate(date: Date): void,
  isFocused: boolean,
  setFocused(value: boolean): void,
  weeksInMonth: number,
  weekStart: number,
  getCellOptions(weekIndex: number, dayIndex: number): CalendarCellOptions
}

export interface CalendarState extends CalendarStateBase {
  value: Date,
  setValue(value: Date): void
}

export interface RangeCalendarState extends CalendarStateBase {
  value: RangeValue<Date>,
  setValue(value: RangeValue<Date>): void,
  highlightDate(date: Date): void,
  anchorDate: Date | null,
  setAnchorDate(date: Date | null): void,
  highlightedRange: RangeValue<Date>
}

export interface CalendarCellOptions {
  cellDate: Date,
  isToday: boolean,
  isCurrentMonth: boolean,
  isDisabled: boolean,
  isReadOnly: boolean,
  isSelected: boolean,
  isFocused: boolean,
  isRangeSelection?: boolean,
  isRangeStart?: boolean,
  isRangeEnd?: boolean,
  isSelectionStart?: boolean,
  isSelectionEnd?: boolean
}
