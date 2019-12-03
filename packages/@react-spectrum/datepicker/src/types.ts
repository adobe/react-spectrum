import {DatePickerProps, DateRangePickerProps} from '@react-types/datepicker';

interface SpectrumDatePickerBase {
  isQuiet?: boolean
}

export interface SpectrumDatePickerProps extends DatePickerProps, SpectrumDatePickerBase {}
export interface SpectrumDateRangePickerProps extends DateRangePickerProps, SpectrumDatePickerBase {}
