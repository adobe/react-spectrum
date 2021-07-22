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
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './index.css';
import {DOMProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useDateField} from '@react-aria/datepicker';
import {useDatePickerFieldState} from '@react-stately/datepicker';
import {useStyleProps} from '@react-spectrum/utils';
import {createCalendar} from '@internationalized/date';

interface DateFieldDescProps extends DOMProps {
  children?: string,
  hidden?: boolean
}

export function DatePickerField(props: SpectrumDatePickerProps & {descProps?: DateFieldDescProps}) {
  let state = useDatePickerFieldState({
    ...props,
    createCalendar
  });
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet,
    validationState,
    descProps,
    inputClassName,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {fieldProps, segmentProps} = useDateField(props);

  let isInvalid = validationState === 'invalid';
  let textfieldClass = classNames(
    textfieldStyles,
    'spectrum-Textfield',
    {
      'spectrum-Textfield--invalid': isInvalid,
      'spectrum-Textfield--valid': validationState === 'valid',
      'spectrum-Textfield--quiet': isQuiet
    },
    classNames(datepickerStyles, 'react-spectrum-Datepicker-field'),
    styleProps.className
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
  if (validationState === 'invalid') {
    validationIcon = <Alert data-testid="invalid-icon" UNSAFE_className={iconClass} />;
  } else if (validationState === 'valid') {
    validationIcon = <Checkmark data-testid="valid-icon" UNSAFE_className={iconClass} />;
  }

  return (
    <div {...fieldProps} {...styleProps} className={textfieldClass}>
      {descProps && descProps.children && <span {...descProps} />}
      <FocusRing focusClass={classNames(textfieldStyles, 'is-focused')} focusRingClass={classNames(textfieldStyles, 'focus-ring')} isTextInput within>
        <div role="presentation" className={inputClass}>
          {state.segments.map((segment, i) =>
            (<DatePickerSegment
              {...segmentProps}
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
  );
}
