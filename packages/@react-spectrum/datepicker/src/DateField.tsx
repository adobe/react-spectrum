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
import {useFocusManagerRef, useFormatHelpText, useFormattedDateWidth} from './utils';
import {useFormProps} from '@react-spectrum/form';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function DateField<T extends DateValue>(props: SpectrumDateFieldProps<T>, ref: FocusableRef<HTMLElement>) {
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
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef<HTMLElement | null>(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let {labelProps, fieldProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors, validationDetails} = useDateField({
    ...props,
    inputRef
  }, state, fieldRef);

  // Note: this description is intentionally not passed to useDatePicker.
  // The format help text is unnecessary for screen reader users because each segment already has a label.
  let description = useFormatHelpText(props);
  if (description && !props.description) {
    descriptionProps.id = undefined;
  }

  let validationState = state.validationState || (isInvalid ? 'invalid' : null);

  let approximateWidth = useFormattedDateWidth(state) + 'ch';

  // let timeValue = ['hour', 'minute', 'second'];
  // let dateValue = ['year', 'month', 'day'];
  // let dateLiteral = ['.', '/', '-'];

  // is there a better way to determine what the literal will look like based on locale rather than hard coding it?
  // const groupedSegments = state.segments.reduce((acc: DateSegment[][], segment) => {
  //   if ((timeValue.includes(segment.type) || 
  //     (segment.type === 'literal' && segment.text === ':')) || (locale !== 'ar-AE' && (dateValue.includes(segment.type) || (segment.type === 'literal' && dateLiteral.includes(segment.text))))) {
  //     let lastGroup = acc[acc.length - 1];
  //     if (Array.isArray(lastGroup) && lastGroup[0].type !== 'literal') {
  //       lastGroup.push(segment);
  //     } else {
  //       acc.push([segment]);
  //     }   
  //   } else {
  //     acc.push([segment]);
  //   }
  //   return acc;
  // }, []);

  // console.log(groupedSegments);
  // let granularity = props.granularity || 'minute';

  return (
    <Field
      {...props}
      ref={domRef}
      elementType="span"
      description={description}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      validationState={validationState ?? undefined}
      isInvalid={isInvalid}
      validationErrors={validationErrors}
      validationDetails={validationDetails}
      wrapperClassName={classNames(datepickerStyles, 'react-spectrum-Datepicker-fieldWrapper')}>
      <Input
        ref={fieldRef}
        fieldProps={fieldProps}
        isDisabled={isDisabled}
        isQuiet={isQuiet}
        autoFocus={autoFocus}
        validationState={validationState}
        minWidth={approximateWidth}
        className={classNames(datepickerStyles, 'react-spectrum-DateField')}>        
        {/* {groupedSegments.map((segments, index) =>
          segments.length > 1 ? (
            <React.Fragment key={index}>
            {'\u202D'}
            {segments.map((s, i) => (
              <DatePickerSegment
                key={`${index}-${i}`}
                segment={s}
                state={state}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isRequired={isRequired} />
              ))}
            {'\u202C'}
            </React.Fragment>
          ) : (
            (<DatePickerSegment
              key={index}
              segment={segments[0]}
              state={state}
              isDisabled={isDisabled}
              isReadOnly={isReadOnly}
              isRequired={isRequired} />)
          )
        )} */}
        {/* {state.segments.map((segment, i) =>
          (<DatePickerSegment
            key={i}
            segment={segment}
            state={state}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            isRequired={isRequired} />)
        )} */}
        {/* {state.segments.map((segment, i) =>
          (
            <React.Fragment key={i}>
              {segment.type === 'day' && locale !== 'ar-AE' && '\u2066'}
              {segment.type === 'hour' && '\u2066'}
              <DatePickerSegment
                key={i}
                segment={segment}
                state={state}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isRequired={isRequired} />
              {segment.type === 'year' && locale !== 'ar-AE' &&  '\u2069'}
              {timeValue.includes(granularity) && segment.type === granularity && '\u2069'}
          </React.Fragment>)               
        )} */}
        {state.segments.map((segment, i) =>
          (
            <React.Fragment key={i}>
              {segment.ltrIsolate === '\u2066' && segment.ltrIsolate}
              <DatePickerSegment
                key={i}
                segment={segment}
                state={state}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isRequired={isRequired} />
              {segment.ltrIsolate === '\u2069' && segment.ltrIsolate}
            </React.Fragment>)               
        )}
        <input {...inputProps} ref={inputRef} />
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
