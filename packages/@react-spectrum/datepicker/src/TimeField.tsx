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
import React, {useMemo, useRef} from 'react';
import {SpectrumDatePickerProps, SpectrumTimePickerProps} from '@react-types/datepicker';
import '@adobe/spectrum-css-temp/components/textfield/vars.css'; // HACK: must be included BEFORE inputgroup
import styles from '@adobe/spectrum-css-temp/components/inputgroup/vars.css';
import {useDatePicker} from '@react-aria/datepicker';
import {useDatePickerState} from '@react-stately/datepicker';
import {useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';
import { useControlledState } from '@react-stately/utils';
import { toCalendarDateTime, today, toTime } from '@internationalized/date';

export function TimeField(props: SpectrumTimePickerProps) {
  props = useProviderProps(props);
  let {
    autoFocus,
    isQuiet,
    isDisabled,
    isReadOnly,
    isRequired,
    ...otherProps
  } = props;

  let [value, setValue] = useControlledState(
    props.value,
    props.defaultValue,
    props.onChange
  );

  let dateTime = useMemo(() => value == null ? null : toCalendarDateTime(today('America/Los_Angeles'), value), [value]);
  let onChange = value => {
    setValue(toTime(value));
  };

  return (
    <FocusScope autoFocus={autoFocus}>
      <DatePickerField
        data-testid="date-field"
        isQuiet={isQuiet}
        validationState={props.validationState}
        value={dateTime}
        onChange={onChange}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isRequired={isRequired}
        maxGranularity="hour"
        granularity={props.granularity ?? 'minute'}
        hourCycle={props.hourCycle} />
    </FocusScope>
  );
}
