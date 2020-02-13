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
import {DatePickerProps} from '@react-types/datepicker';
import {DOMProps} from '@react-types/shared';
import {HTMLAttributes, MouseEvent} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useFocusManager} from '@react-aria/focus';
import {useLabels} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface DateFieldAria {
  fieldProps: HTMLAttributes<HTMLElement>,
  segmentProps: DOMProps
}

export function useDateField(props: DatePickerProps & DOMProps): DateFieldAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let fieldProps = useLabels(props, formatMessage('date'));
  let focusManager = useFocusManager();

  // This is specifically for mouse events, not touch or keyboard.
  // Focus the last segment on mouse down in the field.
  let onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focusManager.focusPrevious({from: e.target as HTMLElement});
  };

  return {
    fieldProps: {
      ...fieldProps,
      onMouseDown
    },
    segmentProps: {
      // Segments should be labeled by the input id if provided, otherwise the field itself
      'aria-labelledby': fieldProps['aria-labelledby'] || fieldProps.id
    }
  };
}
