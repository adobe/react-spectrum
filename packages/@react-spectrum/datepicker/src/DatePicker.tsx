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
import {classNames} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {DatePickerField} from './DatePickerField';
import datepickerStyles from './index.css';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Field} from '@react-spectrum/label';
import {FieldButton} from '@react-spectrum/button';
import {FocusScope, useFocusRing} from '@react-aria/focus';
import {fromDateToLocal, getLocalTimeZone, toCalendarDate} from '@internationalized/date';
import {mergeProps} from '@react-aria/utils';
import React, {useRef} from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import '@adobe/spectrum-css-temp/components/textfield/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

export function DatePicker(props: SpectrumDatePickerProps) {
  props = useProviderProps(props);
  let {
    autoFocus,
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    placeholderValue
    // showFormatHelpText,
  } = props;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let targetRef = useRef<HTMLDivElement>();
  let state = useDatePickerState(props);
  let {groupProps, labelProps, fieldProps, buttonProps, dialogProps} = useDatePicker(props, state, targetRef);
  let {value, setValue, selectDate, isOpen, setOpen} = state;
  let {direction} = useLocale();

  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true,
    isTextInput: true,
    autoFocus
  });

  let className = classNames(
    styles,
    'spectrum-InputGroup',
    {
      'spectrum-InputGroup--quiet': isQuiet,
      'spectrum-InputGroup--invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled,
      'is-hovered': isHovered,
      'is-focused': isFocused,
      'focus-ring': isFocusVisible
    }
  );

  let fieldClassName = classNames(
    styles,
    'spectrum-InputGroup-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': state.validationState === 'invalid'
    }
  );

  // TODO: format help text
  // let formatter = useDateFormatter({dateStyle: 'short'});
  // let segments = showFormatHelpText ? formatter.formatToParts(new Date()).map(s => {
  //   if (s.type === 'literal') {
  //     return s.value;
  //   }

  //   return s.type;
  // }).join(' ') : '';

  return (
    <Field {...props} labelProps={labelProps}>
      <div
        {...mergeProps(groupProps, hoverProps, focusProps)}
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
            placeholderValue={placeholderValue}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired}
            granularity={props.granularity}
            hourCycle={props.hourCycle}
            inputClassName={fieldClassName}
            UNSAFE_className={classNames(styles, 'spectrum-InputGroup-field')}
            hideTimeZone={props.hideTimeZone} />
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
            isDisabled={isDisabled || isReadOnly}>
            <CalendarIcon />
          </FieldButton>
          <Dialog UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-Datepicker-dialog')} {...dialogProps}>
            <Content>
              <Calendar
                autoFocus
                value={state.value ? state.value.toDate(getLocalTimeZone()) : null}
                // @ts-ignore
                onChange={date => selectDate(toCalendarDate(fromDateToLocal(date)))} />
            </Content>
          </Dialog>
        </DialogTrigger>
      </div>
    </Field>
  );
}
