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
import {CalendarProps} from '@react-types/calendar';
import {createFocusManager} from '@react-aria/focus';
import {DatePickerState} from '@react-stately/datepicker';
import {HTMLAttributes, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useDescription, useId} from '@react-aria/utils';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';

interface DatePickerAria {
  /** Props for the date picker's visible label element, if any. */
  labelProps: HTMLAttributes<HTMLElement>,
  /** Props for the grouping element containing the date field and button. */
  groupProps: HTMLAttributes<HTMLElement>,
  /** Props for the date field. */
  fieldProps: AriaDatePickerProps<DateValue>,
  /** Props for the popover trigger button. */
  buttonProps: AriaButtonProps,
  /** Props for the description element, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>,
  /** Props for the error message element, if any. */
  errorMessageProps: HTMLAttributes<HTMLElement>,
  /** Props for the popover dialog. */
  dialogProps: AriaDialogProps,
  /** Props for the calendar within the popover dialog. */
  calendarProps: CalendarProps<DateValue>
}

/**
 * Provides the behavior and accessibility implementation for a date picker component.
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export function useDatePicker<T extends DateValue>(props: AriaDatePickerProps<T>, state: DatePickerState, ref: RefObject<HTMLElement>): DatePickerAria {
  let buttonId = useId();
  let dialogId = useId();
  let formatMessage = useMessageFormatter(intlMessages);

  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span'
  });

  let groupProps = useDatePickerGroup(state, ref);

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let descProps = useDescription(state.formatValue(locale, {month: 'long'}));
  let ariaDescribedBy = [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;

  return {
    groupProps: mergeProps(groupProps, descProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || null,
      'aria-labelledby': labelledBy,
      'aria-describedby': ariaDescribedBy
    }),
    labelProps: {
      ...labelProps,
      onClick: () => {
        let focusManager = createFocusManager(ref);
        focusManager.focusFirst();
      }
    },
    fieldProps: {
      ...fieldProps,
      value: state.value,
      onChange: state.setValue,
      minValue: props.minValue,
      maxValue: props.maxValue,
      placeholderValue: props.placeholderValue,
      hideTimeZone: props.hideTimeZone,
      hourCycle: props.hourCycle,
      granularity: props.granularity,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      validationState: state.validationState,
      autoFocus: props.autoFocus
    },
    descriptionProps,
    errorMessageProps,
    buttonProps: {
      ...descProps,
      id: buttonId,
      excludeFromTabOrder: true,
      'aria-haspopup': 'dialog',
      'aria-label': formatMessage('calendar'),
      'aria-labelledby': `${labelledBy} ${buttonId}`,
      'aria-describedby': ariaDescribedBy,
      onPress: () => state.setOpen(true)
    },
    dialogProps: {
      id: dialogId,
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    calendarProps: {
      autoFocus: true,
      value: state.dateValue,
      onChange: state.setDateValue,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isDateDisabled: props.isDateDisabled
    }
  };
}
