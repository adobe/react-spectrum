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
import {Calendar} from '@react-spectrum/calendar';
import CalendarIcon from '@spectrum-icons/workflow/Calendar';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DatePickerField} from './DatePickerField';
import datepickerStyles from './index.css';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {FieldButton} from '@react-spectrum/button';
import {FocusRing, FocusScope} from '@react-aria/focus';
import React, {useRef} from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import '@adobe/spectrum-css-temp/components/textfield/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

export function DatePicker(props: SpectrumDatePickerProps) {
  props = useProviderProps(props);
  let {
    autoFocus,
    formatOptions,
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    placeholderDate,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let state = useDatePickerState(props);
  let {comboboxProps, fieldProps, buttonProps, dialogProps} = useDatePicker(props, state);
  let {value, setValue, selectDate, isOpen, setOpen} = state;
  let targetRef = useRef<HTMLDivElement>();
  let {direction} = useLocale();

  let className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled
    },
    styleProps.className
  );
  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(styles, 'is-focused')}
      focusRingClass={classNames(styles, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...comboboxProps}
        className={className}
        ref={targetRef}>
        <FocusScope autoFocus={autoFocus}>
          <DatePickerField
            {...fieldProps}
            data-testid="date-field"
            isQuiet={isQuiet}
            validationState={state.validationState}
            value={value}
            onChange={setValue}
            placeholderDate={placeholderDate}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            formatOptions={formatOptions}
            UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-endField')} />
        </FocusScope>
        <DialogTrigger
          type="popover"
          mobileType="tray"
          placement={direction === 'rtl' ? 'bottom right' : 'bottom left'}
          targetRef={targetRef}
          hideArrow
          isOpen={isOpen}
          onOpenChange={setOpen}>
          <FieldButton
            {...buttonProps}
            UNSAFE_className={classNames(styles, 'spectrum-FieldButton')}
            isQuiet={isQuiet}
            validationState={state.validationState}
            icon={<CalendarIcon />}
            isDisabled={isDisabled || isReadOnly} />
          <Dialog UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
            <Calendar
              autoFocus
              value={value}
              onChange={selectDate} />
          </Dialog>
        </DialogTrigger>
      </div>
    </FocusRing>
  );
}
