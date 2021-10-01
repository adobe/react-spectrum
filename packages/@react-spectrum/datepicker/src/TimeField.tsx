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
import datepickerStyles from './index.css';
import {Field} from '@react-spectrum/label';
import {Input} from './Input';
import React, {useRef} from 'react';
import {SpectrumTimePickerProps, TimeValue} from '@react-types/datepicker';
import {useDateField} from '@react-aria/datepicker';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useTimeFieldState} from '@react-stately/datepicker';

export function TimeField<T extends TimeValue>(props: SpectrumTimePickerProps<T>) {
  props = useProviderProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet
  } = props;

  let ref = useRef();
  let {locale} = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale,
    createCalendar
  });

  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useDateField(props, state, ref);

  return (
    <Field
      {...props}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={state.validationState}
      UNSAFE_className={classNames(datepickerStyles, 'react-spectrum-TimeField-fieldWrapper')}>
      <Input
        fieldProps={fieldProps}
        isDisabled={isDisabled}
        isQuiet={isQuiet}
        autoFocus={autoFocus}
        validationState={state.validationState}
        inputRef={ref}
        className={classNames(datepickerStyles, 'react-spectrum-TimeField')}>
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
