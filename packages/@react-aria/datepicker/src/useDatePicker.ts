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
import {DOMAttributes, GroupDOMAttributes, KeyboardEvent, ValidationResult} from '@react-types/shared';
import {filterDOMProps, mergeProps, useDescription, useId} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {privateValidationStateProp} from '@react-stately/form';
import {RefObject, useMemo} from 'react';
import {roleSymbol} from './useDateField';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

export interface DatePickerAria extends ValidationResult {
  /** Props for the date picker's visible label element, if any. */
  labelProps: DOMAttributes,
  /** Props for the grouping element containing the date field and button. */
  groupProps: GroupDOMAttributes,
  /** Props for the date field. */
  fieldProps: AriaDatePickerProps<DateValue>,
  /** Props for the popover trigger button. */
  buttonProps: AriaButtonProps,
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes,
  /** Props for the popover dialog. */
  dialogProps: AriaDialogProps,
  /** Props for the calendar within the popover dialog. */
  calendarProps: CalendarProps<DateValue>
}

/**
 * Provides the behavior and accessibility implementation for a date picker component.
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export function useDatePicker<T extends DateValue>(props: AriaDatePickerProps<T>, state: DatePickerState, ref: RefObject<Element>): DatePickerAria {
  let buttonId = useId();
  let dialogId = useId();
  let fieldId = useId();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/datepicker');

  let {isInvalid, validationErrors, validationDetails} = state.displayValidation;
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span',
    isInvalid,
    errorMessage: props.errorMessage || validationErrors
  });

  let groupProps = useDatePickerGroup(state, ref);

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let date = state.formatValue(locale, {month: 'long'});
  let description = date ? stringFormatter.format('selectedDateDescription', {date}) : '';
  let descProps = useDescription(description);
  let ariaDescribedBy = [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  let domProps = filterDOMProps(props);
  let focusManager = useMemo(() => createFocusManager(ref), [ref]);

  let {focusWithinProps} = useFocusWithin({
    ...props,
    isDisabled: state.isOpen,
    onBlurWithin: props.onBlur,
    onFocusWithin: props.onFocus,
    onFocusWithinChange: props.onFocusChange
  });

  return {
    groupProps: mergeProps(domProps, groupProps, fieldProps, descProps, focusWithinProps, {
      role: 'group' as const,
      'aria-disabled': props.isDisabled || null,
      'aria-labelledby': labelledBy,
      'aria-describedby': ariaDescribedBy,
      onKeyDown(e: KeyboardEvent) {
        if (state.isOpen) {
          return;
        }

        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
      },
      onKeyUp(e: KeyboardEvent) {
        if (state.isOpen) {
          return;
        }

        if (props.onKeyUp) {
          props.onKeyUp(e);
        }
      }
    }),
    labelProps: {
      ...labelProps,
      onClick: () => {
        focusManager.focusFirst();
      }
    },
    fieldProps: {
      ...fieldProps,
      id: fieldId,
      [roleSymbol]: 'presentation',
      'aria-describedby': ariaDescribedBy,
      value: state.value,
      onChange: state.setValue,
      placeholderValue: props.placeholderValue,
      hideTimeZone: props.hideTimeZone,
      hourCycle: props.hourCycle,
      shouldForceLeadingZeros: props.shouldForceLeadingZeros,
      granularity: props.granularity,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      validationBehavior: props.validationBehavior,
      // DatePicker owns the validation state for the date field.
      [privateValidationStateProp]: state,
      autoFocus: props.autoFocus,
      name: props.name
    },
    descriptionProps,
    errorMessageProps,
    buttonProps: {
      ...descProps,
      id: buttonId,
      'aria-haspopup': 'dialog',
      'aria-label': stringFormatter.format('calendar'),
      'aria-labelledby': `${buttonId} ${labelledBy}`,
      'aria-describedby': ariaDescribedBy,
      'aria-expanded': state.isOpen,
      isDisabled: props.isDisabled || props.isReadOnly,
      onPress: () => state.setOpen(true)
    },
    dialogProps: {
      id: dialogId,
      'aria-labelledby': `${buttonId} ${labelledBy}`
    },
    calendarProps: {
      autoFocus: true,
      value: state.dateValue,
      onChange: state.setDateValue,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isDateUnavailable: props.isDateUnavailable,
      defaultFocusedValue: state.dateValue ? undefined : props.placeholderValue,
      isInvalid: state.isInvalid,
      errorMessage: typeof props.errorMessage === 'function' ? props.errorMessage(state.displayValidation) : (props.errorMessage || state.displayValidation.validationErrors.join(' '))
    },
    isInvalid,
    validationErrors,
    validationDetails
  };
}
