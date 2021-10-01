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
import {DatePickerBase, DateValue} from '@react-types/datepicker';
import {DatePickerFieldState, DateSegment} from '@react-stately/datepicker';
import {NumberParser} from '@internationalized/number';
import React, {useMemo, useRef} from 'react';
import styles from './index.css';
import {useDateSegment} from '@react-aria/datepicker';
import {useFocusManager} from '@react-aria/focus';
import {useLocale} from '@react-aria/i18n';
import {usePress} from '@react-aria/interactions';

interface DatePickerSegmentProps extends DatePickerBase<DateValue> {
  segment: DateSegment,
  state: DatePickerFieldState
}

interface LiteralSegmentProps {
  segment: DateSegment
}

export function DatePickerSegment({segment, state, ...otherProps}: DatePickerSegmentProps) {
  switch (segment.type) {
    // A separator, e.g. punctuation
    case 'literal':
      return <LiteralSegment segment={segment} />;

    // Editable segment
    default:
      return <EditableSegment segment={segment} state={state} {...otherProps} />;
  }
}

function LiteralSegment({segment}: LiteralSegmentProps) {
  let focusManager = useFocusManager();
  let {pressProps} = usePress({
    onPressStart: (e) => {
      if (e.pointerType === 'mouse') {
        let res = focusManager.focusNext({from: e.target as HTMLElement});
        if (!res) {
          focusManager.focusPrevious({from: e.target as HTMLElement});
        }
      }
    }
  });

  return (
    <span
      aria-hidden="true"
      className={classNames(styles, 'react-spectrum-Datepicker-literal')}
      {...pressProps}
      data-testid={segment.type === 'literal' ? undefined : segment.type}>
      {segment.text}
    </span>
  );
}

function EditableSegment({segment, state, ...otherProps}: DatePickerSegmentProps) {
  let ref = useRef();
  let {segmentProps} = useDateSegment(otherProps, segment, state, ref);
  let {locale} = useLocale();
  let parser = useMemo(() => new NumberParser(locale), [locale]);
  let isNumeric = useMemo(() => parser.isValidPartialNumber(segment.text), [segment.text, parser]);
  return (
    <div
      ref={ref}
      className={classNames(styles, 'react-spectrum-DatePicker-cell', {
        'is-placeholder': segment.isPlaceholder,
        'is-read-only': !segment.isEditable
      })}
      style={{
        minWidth: !isNumeric ? null : String(segment.maxValue).length + 'ch'
      }}
      data-testid={segment.type}
      {...segmentProps}>
      {segment.isPlaceholder ? '' : segment.text}
    </div>
  );
}
