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
import {AriaDatePickerProps, AriaDateRangePickerProps} from '@react-types/datepicker';
import {AriaDialogProps} from '@react-types/dialog';
import {createFocusManager} from '@react-aria/focus';
import {DateRangePickerState} from '@react-stately/datepicker';
import {HTMLAttributes, LabelHTMLAttributes, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {KeyboardEvent} from '@react-types/shared';
import {mergeProps, useDescription, useId, useLabels} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';

interface DateRangePickerAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  groupProps: HTMLAttributes<HTMLElement>,
  startFieldProps: AriaDatePickerProps,
  endFieldProps: AriaDatePickerProps,
  buttonProps: AriaButtonProps,
  dialogProps:  AriaDialogProps
}

export function useDateRangePicker(props: AriaDateRangePickerProps, state: DateRangePickerState, ref: RefObject<HTMLElement>): DateRangePickerAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let description = state.formatValue(locale, {month: 'long'});
  let descriptionProps = useDescription(description);

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

  // Open the popover on alt + arrow down
  let onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
    }
  };

  return {
    groupProps: mergeProps(fieldProps, descriptionProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || null,
      onKeyDown
    }),
    labelProps: {
      ...labelProps,
      onClick: () => {
        let focusManager = createFocusManager(ref);
        focusManager.focusFirst();
      }
    },
    buttonProps: {
      ...descriptionProps,
      id: buttonId,
      'aria-haspopup': 'dialog',
      'aria-label': formatMessage('calendar'),
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    dialogProps: {
      id: dialogId,
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    startFieldProps,
    endFieldProps
  };
}
