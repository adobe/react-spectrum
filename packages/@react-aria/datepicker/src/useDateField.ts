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

import {AriaDatePickerProps, AriaTimeFieldProps, DateValue, TimeValue} from '@react-types/datepicker';
import {createFocusManager, FocusManager} from '@react-aria/focus';
import {DateFieldState} from '@react-stately/datepicker';
import {focusManagerSymbol} from './useDateRangePicker';
import {HTMLAttributes, RefObject, useEffect, useMemo, useRef} from 'react';
import {mergeProps, useDescription} from '@react-aria/utils';
import {useDatePickerGroup} from './useDatePickerGroup';
import {useField} from '@react-aria/label';
import {useFocusWithin} from '@react-aria/interactions';

// Allows this hook to also be used with TimeField
interface DateFieldProps<T extends DateValue> extends Omit<AriaDatePickerProps<T>, 'value' | 'defaultValue' | 'onChange' | 'minValue' | 'maxValue' | 'placeholderValue'> {}

interface DateFieldAria {
   /** Props for the field's visible label element, if any. */
  labelProps: HTMLAttributes<HTMLElement>,
   /** Props for the field grouping element. */
  fieldProps: HTMLAttributes<HTMLElement>,
  /** Props for the description element, if any. */
  descriptionProps: HTMLAttributes<HTMLElement>,
  /** Props for the error message element, if any. */
  errorMessageProps: HTMLAttributes<HTMLElement>
}

// Data that is passed between useDateField and useDateSegment.
interface HookData {
  ariaLabelledBy: string,
  ariaDescribedBy: string,
  focusManager: FocusManager
}

export const hookData = new WeakMap<DateFieldState, HookData>();

/**
 * Provides the behavior and accessibility implementation for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function useDateField<T extends DateValue>(props: DateFieldProps<T>, state: DateFieldState, ref: RefObject<HTMLElement>): DateFieldAria {
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    ...props,
    labelElementType: 'span'
  });

  let groupProps = useDatePickerGroup(state, ref);

  let {focusWithinProps} = useFocusWithin({
    onBlurWithin() {
      state.confirmPlaceholder();
    }
  });

  let descProps = useDescription(state.formatValue({month: 'long'}));

  let segmentLabelledBy = fieldProps['aria-labelledby'] || fieldProps.id;
  let describedBy = [descProps['aria-describedby'], fieldProps['aria-describedby']].filter(Boolean).join(' ') || undefined;
  let propsFocusManager = props[focusManagerSymbol];
  let focusManager = useMemo(() => propsFocusManager || createFocusManager(ref), [propsFocusManager, ref]);

  hookData.set(state, {
    ariaLabelledBy: segmentLabelledBy,
    ariaDescribedBy: describedBy,
    focusManager
  });

  let autoFocusRef = useRef(props.autoFocus);

  useEffect(() => {
    if (autoFocusRef.current) {
      focusManager.focusFirst();
    }
    autoFocusRef.current = false;
  }, [focusManager]);

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        focusManager.focusFirst();
      }
    },
    fieldProps: mergeProps(fieldProps, descProps, groupProps, focusWithinProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || undefined,
      'aria-describedby': describedBy
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
export function useTimeField<T extends TimeValue>(props: AriaTimeFieldProps<T>, state: DateFieldState, ref: RefObject<HTMLElement>): DateFieldAria {
  return useDateField(props, state, ref);
}
