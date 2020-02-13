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
import {DatePickerProps, DateRangePickerProps} from '@react-types/datepicker';
import {DatePickerState, DateRangePickerState} from '@react-stately/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, KeyboardEvent} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId, useLabels} from '@react-aria/utils';
import {SpectrumBaseDialogProps} from '@react-types/dialog';
import {useMessageFormatter} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';

interface DatePickerAria {
  comboboxProps: HTMLAttributes<HTMLElement>,
  fieldProps: DOMProps,
  buttonProps: HTMLAttributes<HTMLElement>,
  dialogProps: SpectrumBaseDialogProps
}

type DatePickerAriaProps = (DatePickerProps | DateRangePickerProps) & DOMProps;

export function useDatePicker(props: DatePickerAriaProps, state: DatePickerState | DateRangePickerState): DatePickerAria {
  let buttonId = useId();
  let dialogId = useId();
  let formatMessage = useMessageFormatter(intlMessages);
  let labels = useLabels(props, formatMessage('date'));
  let labelledBy = labels['aria-labelledby'] || labels.id;

  // When a touch event occurs on the date field, open the calendar instead.
  // The date segments are too small to interact with on a touch device.
  // TODO: time picker in popover??
  let {pressProps} = usePress({
    onPress: (e) => {
      // really should detect if there is a keyboard attached too, but not sure how to do that.
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        state.setOpen(true);
      }
    }
  });

  // Open the popover on alt + arrow down
  let onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      state.setOpen(true);
    }
  };

  return {
    comboboxProps: {
      role: 'combobox',
      'aria-haspopup': 'dialog',
      'aria-expanded': state.isOpen,
      'aria-owns': state.isOpen ? dialogId : null,
      'aria-invalid': state.validationState === 'invalid' || null,
      'aria-disabled': props.isDisabled || null,
      'aria-readonly': props.isReadOnly || null,
      'aria-required': props.isRequired || null,
      ...mergeProps(pressProps, {onKeyDown}),
      ...labels
    },
    fieldProps: {
      'aria-labelledby': labelledBy
    },
    buttonProps: {
      tabIndex: -1,
      id: buttonId,
      'aria-haspopup': 'dialog',
      'aria-label': formatMessage('calendar'),
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    dialogProps: {
      id: dialogId
    }
  };
}
