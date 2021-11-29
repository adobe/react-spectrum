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

import {AriaButtonProps} from '@react-types/button';
import {AriaDatePickerProps, AriaDateRangePickerProps, DateValue} from '@react-types/datepicker';
import {AriaDialogProps} from '@react-types/dialog';
import {createFocusManager} from '@react-aria/focus';
import {DateRangePickerState} from '@react-stately/datepicker';
import {HTMLAttributes, LabelHTMLAttributes, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useDescription, useId, useLabels} from '@react-aria/utils';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';

interface DateRangePickerAria<T extends DateValue> {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  groupProps: HTMLAttributes<HTMLElement>,
  startFieldProps: AriaDatePickerProps<T>,
  endFieldProps: AriaDatePickerProps<T>,
  /** Props for the description element, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>,
  /** Props for the error message element, if any. */
  errorMessageProps: HTMLAttributes<HTMLElement>,
  buttonProps: AriaButtonProps,
  dialogProps:  AriaDialogProps
}

export function useDateRangePicker<T extends DateValue>(props: AriaDateRangePickerProps<T>, state: DateRangePickerState, ref: RefObject<HTMLElement>): DateRangePickerAria<T> {
  let formatMessage = useMessageFormatter(intlMessages);
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span'
  });

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let description = state.formatValue(locale, {month: 'long'});
  let descProps = useDescription(description);

  let startFieldProps = useLabels({
    'aria-label': formatMessage('startDate'),
    'aria-labelledby': labelledBy
  });

  let endFieldProps = useLabels({
    'aria-label': formatMessage('endDate'),
    'aria-labelledby': labelledBy
  });

  let buttonId = useId();
  let dialogId = useId();

  let groupProps = useDatePickerGroup(state, ref);
  let {focusWithinProps} = useFocusWithin({
    onBlurWithin() {
      state.confirmPlaceholder();
    }
  });

  let ariaDescribedBy = [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;

  return {
    groupProps: mergeProps(groupProps, fieldProps, descProps, focusWithinProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || null,
      'aria-describedby': ariaDescribedBy
    }),
    labelProps: {
      ...labelProps,
      onClick: () => {
        let focusManager = createFocusManager(ref);
        focusManager.focusFirst();
      }
    },
    buttonProps: {
      ...descProps,
      id: buttonId,
      excludeFromTabOrder: true,
      'aria-haspopup': 'dialog',
      'aria-label': formatMessage('calendar'),
      'aria-labelledby': `${labelledBy} ${buttonId}`,
      'aria-describedby': ariaDescribedBy
    },
    dialogProps: {
      id: dialogId,
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    startFieldProps: {
      ...startFieldProps,
      'aria-describedby': fieldProps['aria-describedby']
    },
    endFieldProps: {
      ...endFieldProps,
      'aria-describedby': fieldProps['aria-describedby']
    },
    descriptionProps,
    errorMessageProps
  };
}
