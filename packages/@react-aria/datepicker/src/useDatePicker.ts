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
import {AriaDatePickerProps, DateValue} from '@react-types/datepicker';
import {AriaDialogProps} from '@react-types/dialog';
import {createFocusManager} from '@react-aria/focus';
import {DatePickerState} from '@react-stately/datepicker';
import {HTMLAttributes, KeyboardEvent, LabelHTMLAttributes, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useDescription, useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';

interface DatePickerAria<T extends DateValue> {
  groupProps: HTMLAttributes<HTMLElement>,
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  fieldProps: AriaDatePickerProps<T>,
  buttonProps: AriaButtonProps,
  dialogProps: AriaDialogProps
}

export function useDatePicker<T extends DateValue>(props: AriaDatePickerProps<T>, state: DatePickerState, ref: RefObject<HTMLElement>): DatePickerAria<T> {
  let buttonId = useId();
  let dialogId = useId();
  let formatMessage = useMessageFormatter(intlMessages);

  // Open the popover on alt + arrow down
  let onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
    }
  };

  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let descriptionProps = useDescription(state.formatValue(locale, {month: 'long'}));

  return {
    groupProps: mergeProps(descriptionProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || null,
      'aria-labelledby': labelledBy,
      onKeyDown
    }),
    labelProps: {
      ...labelProps,
      onClick: () => {
        let focusManager = createFocusManager(ref);
        focusManager.focusFirst();
      }
    },
    fieldProps,
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
    }
  };
}
