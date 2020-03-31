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

import {HTMLAttributes} from 'react';
import {clamp} from '@react-aria/utils';
import {DOMProps} from '@react-types/shared';
import {ProgressBarProps} from '@react-types/progress';
import {useLabel} from '@react-aria/label';
import {useNumberFormatter} from '@react-aria/i18n';

interface ProgressBarAria {
  progressBarProps: HTMLAttributes<HTMLDivElement>,
  labelProps: HTMLAttributes<HTMLLabelElement>
}

interface ProgressBarAriaProps extends ProgressBarProps, DOMProps {
  textValue?: string
}

export function useProgressBar(props: ProgressBarAriaProps): ProgressBarAria {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    textValue,
    isIndeterminate,
    formatOptions = {
      style: 'percent'
    }
  } = props;

  let {labelProps, fieldProps} = useLabel({
    ...props,
    // Progress bar is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: 'span'
  });

  value = clamp(value, minValue, maxValue);
  let percentage = (value - minValue) / (maxValue - minValue);
  let formatter = useNumberFormatter(formatOptions);

  if (!isIndeterminate && !textValue) {
    let valueToFormat = formatOptions.style === 'percent' ? percentage : value;
    textValue = formatter.format(valueToFormat);
  }

  return {
    progressBarProps: {
      ...fieldProps,
      'aria-valuenow': isIndeterminate ? undefined : value,
      'aria-valuemin': minValue,
      'aria-valuemax': maxValue,
      'aria-valuetext': isIndeterminate ? undefined : textValue,
      role: 'progressbar'
    },
    labelProps
  };
}
