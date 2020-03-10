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
import {classNames, useSlotProvider} from '@react-spectrum/utils';
import {DatePickerSegment} from './DatePickerSegment';
import datepickerStyles from './index.css';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import inputgroupStyles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import textfieldStyles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useDateField} from '@react-aria/datepicker';
import {useDatePickerFieldState} from '@react-stately/datepicker';

export function DatePickerField(props: SpectrumDatePickerProps) {
  let state = useDatePickerFieldState(props);
  let {
    isDisabled,
    isReadOnly,
    isRequired,
    isQuiet,
    validationState,
    slot,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider(slot);
  let {fieldProps, segmentProps} = useDateField(props);
  let domProps = mergeProps(
    filterDOMProps(otherProps),
    fieldProps
  );

  let isInvalid = validationState === 'invalid';
  let textfieldClass = classNames(
    textfieldStyles,
    'spectrum-Textfield',
    {
      'is-invalid': isInvalid,
      'is-valid': validationState === 'valid',
      'spectrum-Textfield--quiet': isQuiet
    },
    classNames(datepickerStyles, 'react-spectrum-Datepicker-field'),
    styleProps.className,
    slotProps.className
  );

  let inputClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-input',
    {
      'is-disabled': isDisabled,
      'is-invalid': isInvalid
    },
    classNames(
      inputgroupStyles,
      'spectrum-InputGroup-field',
      {
        'is-disabled': isDisabled,
        'is-invalid': isInvalid
      }
    ),
    classNames(datepickerStyles, 'react-spectrum-Datepicker-input')
  );

  let iconClass = classNames(
    textfieldStyles,
    'spectrum-Textfield-validationIcon',
    {
      'is-invalid': isInvalid,
      'is-valid': validationState === 'valid'
    }
  );

  let validationIcon = null;
  if (validationState === 'invalid') {
    validationIcon = <Alert data-testid="invalid-icon" UNSAFE_className={iconClass} />;
  } else if (validationState === 'valid') {
    validationIcon = <Checkmark data-testid="valid-icon" UNSAFE_className={iconClass} />;
  }

  return (
    <div {...domProps} {...styleProps} className={textfieldClass}>
      <div className={inputClass}>
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
      {validationIcon}
    </div>
  );
}
