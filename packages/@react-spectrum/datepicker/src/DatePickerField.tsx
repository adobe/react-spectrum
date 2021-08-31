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

import Alert from '@spectrum-icons/ui/AlertMedium';
import Checkmark from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames} from '@react-spectrum/utils';
import {createCalendar} from '@internationalized/date';
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './index.css';
import {DateValue, SpectrumDatePickerProps} from '@react-types/datepicker';
import {Field} from '@react-spectrum/label';
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useDateField} from '@react-aria/datepicker';
import {useDatePickerFieldState} from '@react-stately/datepicker';
import {useLocale} from '@react-aria/i18n';

interface DatePickerFieldProps<T extends DateValue> extends SpectrumDatePickerProps<T> {
  inputClassName?: string,
  hideValidationIcon?: boolean,
  maxGranularity?: SpectrumDatePickerProps<T>['granularity']
}

export function DatePickerField<T extends DateValue>(props: DatePickerFieldProps<T>) {
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet,
    inputClassName,
    hideValidationIcon
  } = props;
  let ref = useRef();
  let {locale} = useLocale();
  let state = useDatePickerFieldState({
    ...props,
    locale,
    createCalendar
  });

  let {labelProps, fieldProps} = useDateField(props, state, ref);

  let isInvalid = state.validationState === 'invalid';
  let textfieldClass = classNames(
    textfieldStyles,
    'spectrum-Textfield',
    {
      'spectrum-Textfield--invalid': isInvalid && !hideValidationIcon,
      'spectrum-Textfield--valid': state.validationState === 'valid' && !hideValidationIcon,
      'spectrum-Textfield--quiet': isQuiet
    },
    classNames(datepickerStyles, 'react-spectrum-Datepicker-field')
  );

  let inputClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': isInvalid
    },
    classNames(datepickerStyles, 'react-spectrum-Datepicker-input'),
    inputClassName
  );

  let iconClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-validationIcon'
  );

  let validationIcon = null;
  if (!hideValidationIcon) {
    if (state.validationState === 'invalid') {
      validationIcon = <Alert data-testid="invalid-icon" UNSAFE_className={iconClass} />;
    } else if (state.validationState === 'valid') {
      validationIcon = <Checkmark data-testid="valid-icon" UNSAFE_className={iconClass} />;
    }
  }

  return (
    <Field {...props} labelProps={labelProps}>
      <div {...fieldProps} className={textfieldClass}>
        <FocusRing focusClass={classNames(textfieldStyles, 'is-focused')} focusRingClass={classNames(textfieldStyles, 'focus-ring')} isTextInput within>
          <div role="presentation" className={inputClass} ref={ref}>
            {state.segments.map((segment, i) =>
              (<DatePickerSegment
                key={i}
                segment={segment}
                state={state}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isRequired={isRequired} />)
            )}
          </div>
        </FocusRing>
        {validationIcon}
      </div>
    </Field>
  );
}
