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

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {useHiddenText} from './useHiddenText';

/**
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 * @param props - Aria label props.
 * @param defaultLabel - Default value for aria-label when not present.
 */
export function useLabels(props: DOMProps & AriaLabelingProps, defaultLabel?: string): DOMProps & AriaLabelingProps {
  let {
    'aria-label': label,
    'aria-labelledby': labelledBy
  } = props;

  // If there is both an aria-label and aria-labelledby, create a hidden span element
  // that holds the label and reference that in aria-labelledby. Normally we'd use a
  // self reference to the element itself, but this is currently broken in Chrome.
  // See https://bugs.chromium.org/p/chromium/issues/detail?id=1159567
  let hiddenLabelId = useHiddenText(labelledBy && label ? label : undefined);
  if (labelledBy && label) {
    let ids = new Set([...labelledBy.trim().split(/\s+/), hiddenLabelId]);
    labelledBy = [...ids].join(' ');
    label = undefined;
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(' ');
  }

  // If no labels are provided, use the default
  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    'aria-label': label,
    'aria-labelledby': labelledBy
  };
}
