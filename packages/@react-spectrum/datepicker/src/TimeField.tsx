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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DatePickerField} from './DatePickerField';
import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {useRef} from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import '@adobe/spectrum-css-temp/components/textfield/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

export function TimeField(props: SpectrumDatePickerProps) {
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
  let {hoverProps, isHovered} = useHover({isDisabled});
  let state = useDatePickerState(props);
  let {groupProps, fieldProps, descProps} = useDatePicker(props, state);
  let {value, setValue} = state;
  let targetRef = useRef<HTMLDivElement>();

  let className = classNames(
    styles,
    {
      'is-invalid': state.validationState === 'invalid',
      'is-disabled': isDisabled,
      'is-hovered': isHovered
    },
    styleProps.className
  );
  return (
    <div
      {...styleProps}
      {...mergeProps(groupProps, hoverProps)}
      className={className}
      ref={targetRef}>
      {descProps && descProps.children && <span {...descProps} />}
      <FocusScope autoFocus={autoFocus}>
        <DatePickerField
          {...fieldProps as any}
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
          maxGranularity="hour"
          granularity={props.granularity ?? 'minute'}
          hourCycle={props.hourCycle} />
      </FocusScope>
    </div>
  );
}
