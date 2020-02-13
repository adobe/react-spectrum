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
import {DatePickerFieldState, DateSegment} from '@react-stately/datepicker';
import React from 'react';
import {SpectrumDatePickerProps} from '@react-types/datepicker';
import styles from './index.css';
import {useDateSegment} from '@react-aria/datepicker';
import {useFocusManager} from '@react-aria/focus';

interface DatePickerSegmentProps extends SpectrumDatePickerProps {
  segment: DateSegment,
  state: DatePickerFieldState
}

interface LiteralSegmentProps {
  segment: DateSegment,
  isPlaceholder?: boolean
}

export function DatePickerSegment({segment, state, ...otherProps}: DatePickerSegmentProps) {
  switch (segment.type) {
    // A separator, e.g. punctuation
    case 'literal':
      return <LiteralSegment segment={segment} />;

    // These segments cannot be directly edited by the user.
    case 'weekday':
    case 'timeZoneName':
    case 'era':
      return <LiteralSegment segment={segment} isPlaceholder />;

    // Editable segment
    default:
      return <EditableSegment segment={segment} state={state} {...otherProps} />;
  }
}

function LiteralSegment({segment, isPlaceholder}: LiteralSegmentProps) {
  let focusManager = useFocusManager();
  let onMouseDown = (e) => {
    let node = focusManager.focusNext({from: e.target});
    if (node) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <span 
      role="presentation"
      className={classNames(styles, 'react-spectrum-Datepicker-literal', {'is-placeholder': isPlaceholder})}
      onMouseDown={onMouseDown}
      data-testid={segment.type === 'literal' ? undefined : segment.type}>
      {segment.text}
    </span>
  );
}

function EditableSegment({segment, state, ...otherProps}: DatePickerSegmentProps) {
  let {segmentProps} = useDateSegment(otherProps, segment, state);
  return (
    <div
      className={classNames(styles, 'react-spectrum-DatePicker-cell', {'is-placeholder': segment.isPlaceholder})}
      data-testid={segment.type}
      {...segmentProps}>
      {segment.text}
    </div>
  );
}
