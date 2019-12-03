import {DateRangePickerProps} from '@react-types/datepicker';
import {DateRangePickerState} from '@react-stately/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDatePicker} from './useDatePicker';
import {useLabels} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface DateRangePickerAria {
  comboboxProps: HTMLAttributes<HTMLElement>,
  startFieldProps: DOMProps,
  endFieldProps: DOMProps,
  buttonProps: HTMLAttributes<HTMLElement>,
  dialogProps: HTMLAttributes<HTMLElement>
}

export function useDateRangePicker(props: DateRangePickerProps & DOMProps, state: DateRangePickerState): DateRangePickerAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let {comboboxProps, buttonProps, fieldProps, dialogProps} = useDatePicker({
    ...props,
    ...useLabels(props, formatMessage('dateRange'))
  }, state);

  let startFieldProps = useLabels({
    'aria-label': formatMessage('startDate'),
    'aria-labelledby': fieldProps['aria-labelledby']
  });

  let endFieldProps = useLabels({
    'aria-label': formatMessage('endDate'),
    'aria-labelledby': fieldProps['aria-labelledby']
  });

  return {
    comboboxProps,
    buttonProps,
    dialogProps,
    startFieldProps,
    endFieldProps
  };
}
