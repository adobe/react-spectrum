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
import {HTMLAttributes, useMemo} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId, useLabels} from '@react-aria/utils';
import {SpectrumBaseDialogProps} from '@react-types/dialog';
import {useDatePicker} from './useDatePicker';
import {useMessageFormatter} from '@react-aria/i18n';

interface DateFieldDescProps extends DOMProps {
  children?: string,
  hidden?: boolean
}

interface DateRangePickerAria {
  groupProps: HTMLAttributes<HTMLElement>,
  startFieldProps: HTMLAttributes<HTMLElement> & {
    descProps?: DateFieldDescProps
  },
  endFieldProps: HTMLAttributes<HTMLElement> & {
    descProps?: DateFieldDescProps
  },
  buttonProps: HTMLAttributes<HTMLElement>,
  dialogProps: SpectrumBaseDialogProps,
  descProps: DateFieldDescProps
}

export function useDateRangePicker(props: DateRangePickerProps & DOMProps, state: DateRangePickerState): DateRangePickerAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let {groupProps, buttonProps, fieldProps, dialogProps, descProps} = useDatePicker({
    ...props,
    ...useLabels(props, formatMessage('dateRange'))
  }, state);

  let startFieldDescId = useId();
  let startFieldValue:string = useMemo(
    () => state.value.start && state.value.start instanceof Date ? formatMessage('currentDate', {date: state.value.start}) : null,
    [formatMessage, state.value.start]
  );

  let startFieldProps = mergeProps(
    fieldProps,
    {
      role: 'group',
      'aria-describedby': startFieldValue ? startFieldDescId : null,
      ...useLabels({
        'aria-label': formatMessage('startDate'),
        'aria-labelledby': fieldProps['aria-labelledby']
      }),
      descProps: {
        children: startFieldValue,
        hidden: true,
        id: startFieldDescId
      }
    }
  );

  let endFieldDescId = useId();
  let endFieldValue:string = useMemo(
    () => state.value.end && state.value.end instanceof Date ? formatMessage('currentDate', {date: state.value.end}) : null,
    [formatMessage, state.value.end]
  );

  let endFieldProps = mergeProps(
    fieldProps,
    {
      role: 'group',
      'aria-describedby': endFieldValue ? endFieldDescId : null,
      ...useLabels({
        'aria-label': formatMessage('endDate'),
        'aria-labelledby': fieldProps['aria-labelledby']
      }),
      descProps: {
        children: endFieldValue,
        hidden: true,
        id: endFieldDescId
      }
    }
  );

  return {
    groupProps,
    buttonProps,
    dialogProps,
    startFieldProps,
    endFieldProps,
    descProps
  };
}
