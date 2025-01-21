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
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './styles.css';
import {Field} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import {Input} from './Input';
import React, {ReactElement, useRef} from 'react';
import {SpectrumTimeFieldProps, TimeValue} from '@react-types/datepicker';
import {useFocusManagerRef, useFormattedDateWidth} from './utils';
import {useFormProps} from '@react-spectrum/form';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useTimeField} from '@react-aria/datepicker';
import {useTimeFieldState} from '@react-stately/datepicker';

/**
 * TimeFields allow users to enter and edit time values using a keyboard.
 * Each part of the time is displayed in an individually editable segment.
 */
export const TimeField = React.forwardRef(function TimeField<T extends TimeValue>(props: SpectrumTimeFieldProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    autoFocus,
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet
  } = props;

  let domRef = useFocusManagerRef(ref);
  let {locale} = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale
  });

  let fieldRef = useRef<HTMLDivElement | null>(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let {labelProps, fieldProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors, validationDetails} = useTimeField({
    ...props,
    inputRef
  }, state, fieldRef);

  let validationState = state.validationState || (isInvalid ? 'invalid' : null);

  let approximateWidth = useFormattedDateWidth(state) + 'ch';

  return (
    <Field
      {...props}
      ref={domRef}
      elementType="span"
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={validationState ?? undefined}
      isInvalid={isInvalid}
      validationErrors={validationErrors}
      validationDetails={validationDetails}
      wrapperClassName={classNames(datepickerStyles, 'react-spectrum-TimeField-fieldWrapper')}>
      <Input
        ref={fieldRef}
        fieldProps={fieldProps}
        isDisabled={isDisabled}
        isQuiet={isQuiet}
        autoFocus={autoFocus}
        validationState={validationState}
        minWidth={approximateWidth}
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
        <input {...inputProps} ref={inputRef} />
      </Input>
    </Field>
  );
}) as <T extends TimeValue>(props: SpectrumTimeFieldProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
