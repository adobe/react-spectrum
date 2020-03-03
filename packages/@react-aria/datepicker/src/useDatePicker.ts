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
import {useMemo} from 'react';
import {useMessageFormatter} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';

interface DateFieldDescProps extends DOMProps {
  children?: string,
  hidden?: boolean
}

interface DatePickerAria {
  groupProps: HTMLAttributes<HTMLElement>,
  fieldProps: DOMProps & {
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog',
    'aria-invalid'?: boolean | 'false' | 'true'
  },
  buttonProps: HTMLAttributes<HTMLElement>,
  dialogProps: SpectrumBaseDialogProps,
  descProps: DateFieldDescProps
}

type DatePickerAriaProps = (DatePickerProps | DateRangePickerProps) & DOMProps;

export function useDatePicker(props: DatePickerAriaProps, state: DatePickerState | DateRangePickerState): DatePickerAria {
  let buttonId = useId();
  let dialogId = useId();
  let descId = useId();
  let formatMessage = useMessageFormatter(intlMessages);
  let labels = useLabels(props, formatMessage('date'));
  let labelledBy = labels['aria-labelledby'] || labels.id;
  let dateValueDescription = useMemo(
    () => {
      if (state.value) {
        if (state.value instanceof Date) {
          return formatMessage('currentDate', {date: state.value});
        } else if (state.value.start && state.value.start instanceof Date && state.value.end && state.value.end instanceof Date) {
          return formatMessage('currentDateRange', {start: state.value.start, end: state.value.end});
        }
      }
      return null;
    },
    [formatMessage, state.value]
  );

  // When a touch event occurs on the date field, open the calendar instead.
  // The date segments are too small to interact with on a touch device.
  // TODO: time picker in popover??
  let {pressProps} = usePress({
    onPress: (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen' || e.pointerType === 'keyboard') {
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
    groupProps: {
      role: 'group',
      'aria-describedby': dateValueDescription ? descId : null,
      'aria-disabled': props.isDisabled || null,
      ...mergeProps(pressProps, {onKeyDown}),
      ...labels
    },
    descProps: {
      children: dateValueDescription,
      hidden: true,
      id: descId
    },
    fieldProps: {
      role: 'presentation',
      'aria-controls': state.isOpen ? dialogId : null,
      'aria-haspopup': 'dialog',
      'aria-invalid': state.validationState === 'invalid' || null,
      'aria-labelledby': labelledBy
    },
    buttonProps: {
      id: buttonId,
      'aria-describedby': dateValueDescription ? descId : null,
      'aria-haspopup': 'dialog',
      'aria-label': formatMessage('calendar'),
      'aria-labelledby': `${labelledBy} ${buttonId}`
    },
    dialogProps: {
      id: dialogId
    }
  };
}
