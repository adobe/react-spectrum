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

import {classNames} from '@react-spectrum/utils';
import {createCalendar} from '@internationalized/date';
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './styles.css';
import {DateValue, SpectrumDateFieldProps} from '@react-types/datepicker';
import {Field} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import {Input} from './Input';
import React, {ReactElement, useRef} from 'react';
import {useDateField} from '@react-aria/datepicker';
import {useDateFieldState} from '@react-stately/datepicker';
import {useFocusManagerRef, useFormatHelpText} from './utils';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function DateField<T extends DateValue>(props: SpectrumDateFieldProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet
  } = props;

  let domRef = useFocusManagerRef(ref);
  let {locale} = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let inputRef = useRef(null);
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useDateField(props, state, inputRef);

  // Note: this description is intentionally not passed to useDatePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = null;
  }

  return (
    <Field
      {...props}
      ref={domRef}
      elementType="span"
      description={description}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={state.validationState}
      wrapperClassName={classNames(datepickerStyles, 'react-spectrum-Datepicker-fieldWrapper')}>
      <Input
        ref={inputRef}
        fieldProps={fieldProps}
        isDisabled={isDisabled}
        isQuiet={isQuiet}
        autoFocus={autoFocus}
        validationState={state.validationState}
        className={classNames(datepickerStyles, 'react-spectrum-DateField')}>
        {state.segments.map((segment, i) =>
          (<DatePickerSegment
            key={i}
            segment={segment}
            state={state}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired} />)
        )}
      </Input>
    </Field>
  );
}

/**
 * DateFields allow users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
const _DateField = React.forwardRef(DateField) as <T extends DateValue>(props: SpectrumDateFieldProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
export {_DateField as DateField};
