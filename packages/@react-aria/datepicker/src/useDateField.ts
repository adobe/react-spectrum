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

import {AriaDateFieldProps as AriaDateFieldPropsBase, AriaTimeFieldProps, DateValue, TimeValue} from '@react-types/datepicker';
import {createFocusManager, FocusManager} from '@react-aria/focus';
import {DateFieldState} from '@react-stately/datepicker';
import {DOMAttributes, KeyboardEvent} from '@react-types/shared';
import {filterDOMProps, mergeProps, useDescription} from '@react-aria/utils';
import {FocusEvent, RefObject, useEffect, useMemo, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

// Allows this hook to also be used with TimeField
export interface AriaDateFieldOptions<T extends DateValue> extends Omit<AriaDateFieldPropsBase<T>, 'value' | 'defaultValue' | 'onChange' | 'minValue' | 'maxValue' | 'placeholderValue'> {}

export interface DateFieldAria {
   /** Props for the field's visible label element, if any. */
  labelProps: DOMAttributes,
   /** Props for the field grouping element. */
  fieldProps: DOMAttributes,
  /** Props for the description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the error message element, if any. */
  errorMessageProps: DOMAttributes
}

// Data that is passed between useDateField and useDateSegment.
interface HookData {
  ariaLabel: string,
  ariaLabelledBy: string,
  ariaDescribedBy: string,
  focusManager: FocusManager
}

export const hookData = new WeakMap<DateFieldState, HookData>();

// Private props that we pass from useDatePicker/useDateRangePicker.
// Ideally we'd use a Symbol for this, but React doesn't support them: https://github.com/facebook/react/issues/7552
export const roleSymbol = '__role_' + Date.now();
export const focusManagerSymbol = '__focusManager_' + Date.now();

/**
 * Provides the behavior and accessibility implementation for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function useDateField<T extends DateValue>(props: AriaDateFieldOptions<T>, state: DateFieldState, ref: RefObject<Element>): DateFieldAria {
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span'
  });

  let {focusWithinProps} = useFocusWithin({
    ...props,
    onBlurWithin: (e: FocusEvent) => {
      state.confirmPlaceholder();

      if (props.onBlur) {
        props.onBlur(e);
      }
    },
    onFocusWithin: props.onFocus,
    onFocusWithinChange: props.onFocusChange
  });

  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let message = state.maxGranularity === 'hour' ? 'selectedTimeDescription' : 'selectedDateDescription';
  let field = state.maxGranularity === 'hour' ? 'time' : 'date';
  let description = state.value ? stringFormatter.format(message, {[field]: state.formatValue({month: 'long'})}) : '';
  let descProps = useDescription(description);

  // If within a date picker or date range picker, the date field will have role="presentation" and an aria-describedby
  // will be passed in that references the value (e.g. entire range). Otherwise, add the field's value description.
  let describedBy = props[roleSymbol] === 'presentation'
    ? fieldProps['aria-describedby']
    : [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  let propsFocusManager = props[focusManagerSymbol];
  let focusManager = useMemo(() => propsFocusManager || createFocusManager(ref), [propsFocusManager, ref]);
  let groupProps = useDatePickerGroup(state, ref, props[roleSymbol] === 'presentation');

  // Pass labels and other information to segments.
  hookData.set(state, {
    ariaLabel: props['aria-label'],
    ariaLabelledBy: [labelProps.id, props['aria-labelledby']].filter(Boolean).join(' ') || undefined,
    ariaDescribedBy: describedBy,
    focusManager
  });

  let autoFocusRef = useRef(props.autoFocus);

  // When used within a date picker or date range picker, the field gets role="presentation"
  // rather than role="group". Since the date picker/date range picker already has a role="group"
  // with a label and description, and the segments are already labeled by this as well, this
  // avoids very verbose duplicate announcements.
  let fieldDOMProps: DOMAttributes;
  if (props[roleSymbol] === 'presentation') {
    fieldDOMProps = {
      role: 'presentation'
    };
  } else {
    fieldDOMProps = mergeProps(fieldProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || undefined,
      'aria-describedby': describedBy
    });
  }

  useEffect(() => {
    if (autoFocusRef.current) {
      focusManager.focusFirst();
    }
    autoFocusRef.current = false;
  }, [focusManager]);

  let domProps = filterDOMProps(props);
  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        focusManager.focusFirst();
      }
    },
    fieldProps: mergeProps(domProps, fieldDOMProps, groupProps, focusWithinProps, {
      onKeyDown(e: KeyboardEvent) {
        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
      },
      onKeyUp(e: KeyboardEvent) {
        if (props.onKeyUp) {
          props.onKeyUp(e);
        }
      }
    }),
    descriptionProps,
    errorMessageProps
  };
}

/**
 * Provides the behavior and accessibility implementation for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function useTimeField<T extends TimeValue>(props: AriaTimeFieldProps<T>, state: DateFieldState, ref: RefObject<Element>): DateFieldAria {
  return useDateField(props, state, ref);
}
