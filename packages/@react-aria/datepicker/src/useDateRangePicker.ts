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
import {DateRange, RangeCalendarProps} from '@react-types/calendar';
import {DateRangePickerState} from '@react-stately/datepicker';
import {DEFAULT_VALIDATION_RESULT, mergeValidation, privateValidationStateProp} from '@react-stately/form';
import {DOMAttributes, GroupDOMAttributes, KeyboardEvent, RefObject, ValidationResult} from '@react-types/shared';
import {filterDOMProps, mergeProps, useDescription, useId} from '@react-aria/utils';
import {focusManagerSymbol, roleSymbol} from './useDateField';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useMemo, useRef} from 'react';

export interface DateRangePickerAria extends ValidationResult {
  /** Props for the date range picker's visible label element, if any. */
  labelProps: DOMAttributes,
  /** Props for the grouping element containing the date fields and button. */
  groupProps: GroupDOMAttributes,
  /** Props for the start date field. */
  startFieldProps: AriaDatePickerProps<DateValue>,
  /** Props for the end date field. */
  endFieldProps: AriaDatePickerProps<DateValue>,
  /** Props for the popover trigger button. */
  buttonProps: AriaButtonProps,
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes,
  /** Props for the popover dialog. */
  dialogProps: AriaDialogProps,
  /** Props for the range calendar within the popover dialog. */
  calendarProps: RangeCalendarProps<DateValue>
}

/**
 * Provides the behavior and accessibility implementation for a date picker component.
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
export function useDateRangePicker<T extends DateValue>(props: AriaDateRangePickerProps<T>, state: DateRangePickerState, ref: RefObject<Element | null>): DateRangePickerAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/datepicker');
  let {isInvalid, validationErrors, validationDetails} = state.displayValidation;
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span',
    isInvalid,
    errorMessage: props.errorMessage || validationErrors
  });

  let labelledBy = fieldProps['aria-labelledby'] || fieldProps.id;

  let {locale} = useLocale();
  let range = state.formatValue(locale, {month: 'long'});
  let description = range ? stringFormatter.format('selectedRangeDescription', {startDate: range.start, endDate: range.end}) : '';
  let descProps = useDescription(description);

  let startFieldProps = {
    'aria-label': stringFormatter.format('startDate'),
    'aria-labelledby': labelledBy
  };

  let endFieldProps = {
    'aria-label': stringFormatter.format('endDate'),
    'aria-labelledby': labelledBy
  };

  let buttonId = useId();
  let dialogId = useId();

  let groupProps = useDatePickerGroup(state, ref);

  let ariaDescribedBy = [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  let focusManager = useMemo(() => createFocusManager(ref, {
    // Exclude the button from the focus manager.
    accept: element => element.id !== buttonId
  }), [ref, buttonId]);

  let commonFieldProps = {
    [focusManagerSymbol]: focusManager,
    [roleSymbol]: 'presentation',
    'aria-describedby': ariaDescribedBy,
    placeholderValue: props.placeholderValue,
    hideTimeZone: props.hideTimeZone,
    hourCycle: props.hourCycle,
    granularity: props.granularity,
    shouldForceLeadingZeros: props.shouldForceLeadingZeros,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    validationBehavior: props.validationBehavior
  };

  let domProps = filterDOMProps(props);

  let isFocused = useRef(false);
  let {focusWithinProps} = useFocusWithin({
    ...props,
    isDisabled: state.isOpen,
    onBlurWithin: e => {
      // Ignore when focus moves into the popover.
      let dialog = document.getElementById(dialogId);
      if (!dialog?.contains(e.relatedTarget)) {
        isFocused.current = false;
        props.onBlur?.(e);
        props.onFocusChange?.(false);
      }
    },
    onFocusWithin: e => {
      if (!isFocused.current) {
        isFocused.current = true;
        props.onFocus?.(e);
        props.onFocusChange?.(true);
      }
    }
  });

  let startFieldValidation = useRef(DEFAULT_VALIDATION_RESULT);
  let endFieldValidation = useRef(DEFAULT_VALIDATION_RESULT);

  return {
    groupProps: mergeProps(domProps, groupProps, fieldProps, descProps, focusWithinProps, {
      role: 'group' as const,
      'aria-disabled': props.isDisabled || null,
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
    startFieldProps: {
      ...startFieldProps,
      ...commonFieldProps,
      value: state.value?.start ?? null,
      defaultValue: state.defaultValue?.start,
      onChange: start => state.setDateTime('start', start),
      autoFocus: props.autoFocus,
      name: props.startName,
      form: props.form,
      [privateValidationStateProp]: {
        realtimeValidation: state.realtimeValidation,
        displayValidation: state.displayValidation,
        updateValidation(e) {
          startFieldValidation.current = e;
          state.updateValidation(mergeValidation(e, endFieldValidation.current));
        },
        resetValidation: state.resetValidation,
        commitValidation: state.commitValidation
      }
    },
    endFieldProps: {
      ...endFieldProps,
      ...commonFieldProps,
      value: state.value?.end ?? null,
      defaultValue: state.defaultValue?.end,
      onChange: end => state.setDateTime('end', end),
      name: props.endName,
      form: props.form,
      [privateValidationStateProp]: {
        realtimeValidation: state.realtimeValidation,
        displayValidation: state.displayValidation,
        updateValidation(e) {
          endFieldValidation.current = e;
          state.updateValidation(mergeValidation(startFieldValidation.current, e));
        },
        resetValidation: state.resetValidation,
        commitValidation: state.commitValidation
      }
    },
    descriptionProps,
    errorMessageProps,
    calendarProps: {
      autoFocus: true,
      value: state.dateRange?.start && state.dateRange.end ? state.dateRange as DateRange : null,
      onChange: state.setDateRange,
      minValue: props.minValue,
      maxValue: props.maxValue,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isDateUnavailable: props.isDateUnavailable,
      allowsNonContiguousRanges: props.allowsNonContiguousRanges,
      defaultFocusedValue: state.dateRange ? undefined : props.placeholderValue,
      isInvalid: state.isInvalid,
      errorMessage: typeof props.errorMessage === 'function' ? props.errorMessage(state.displayValidation) : (props.errorMessage || state.displayValidation.validationErrors.join(' '))
    },
    isInvalid,
    validationErrors,
    validationDetails
  };
}
