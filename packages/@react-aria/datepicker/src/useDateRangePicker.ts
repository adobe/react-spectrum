/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {DateRangePickerProps} from '@react-types/datepicker';
import {DateRangePickerState} from '@react-stately/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {SpectrumBaseDialogProps} from '@react-types/dialog';
import {useDatePicker} from './useDatePicker';
import {useLabels} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface DateRangePickerAria {
  comboboxProps: HTMLAttributes<HTMLElement>,
  startFieldProps: DOMProps,
  endFieldProps: DOMProps,
  buttonProps: HTMLAttributes<HTMLElement>,
  dialogProps: SpectrumBaseDialogProps
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
