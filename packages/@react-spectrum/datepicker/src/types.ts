import {DatePickerProps, DateRangePickerProps} from '@react-types/datepicker';
import {DOMProps} from '@react-types/shared';
import {StyleProps} from '@react-spectrum/view';

interface SpectrumDatePickerBase extends DOMProps, StyleProps {
  isQuiet?: boolean
}

export interface SpectrumDatePickerProps extends DatePickerProps, SpectrumDatePickerBase {}
export interface SpectrumDateRangePickerProps extends DateRangePickerProps, SpectrumDatePickerBase {}
