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

import {AriaDatePickerProps, DateValue} from '@react-types/datepicker';
import {createFocusManager} from '@react-aria/focus';
import {DatePickerFieldState} from '@react-stately/datepicker';
import {HTMLAttributes, LabelHTMLAttributes, RefObject} from 'react';
import {mergeProps, useDescription} from '@react-aria/utils';
import {useDateFormatter} from '@react-aria/i18n';
import {useLabel} from '@react-aria/label';
import {usePress} from '@react-aria/interactions';

interface DateFieldAria {
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,
  fieldProps: HTMLAttributes<HTMLElement>
}

export const labelIds = new WeakMap<DatePickerFieldState, string>();

export function useDateField<T extends DateValue>(props: AriaDatePickerProps<T>, state: DatePickerFieldState, ref: RefObject<HTMLElement>): DateFieldAria {
  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  // Focus the last segment on mouse down/touch up in the field.
  let {pressProps} = usePress({
    onPressStart(e) {
      if (e.pointerType === 'mouse') {
        let focusManager = createFocusManager(ref);
        focusManager.focusLast();
      }
    },
    onPress(e) {
      if (e.pointerType !== 'mouse') {
        let focusManager = createFocusManager(ref);
        focusManager.focusLast();
      }
    }
  });

  let formatter = useDateFormatter(state.getFormatOptions({month: 'long'}));
  let descriptionProps = useDescription(state.value ? formatter.format(state.dateValue) : null);

  labelIds.set(state, fieldProps['aria-labelledby'] || fieldProps.id);

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        let focusManager = createFocusManager(ref);
        focusManager.focusFirst();
      }
    },
    fieldProps: mergeProps(fieldProps, descriptionProps, pressProps, {
      role: 'group',
      'aria-disabled': props.isDisabled || undefined
    })
  };
}
